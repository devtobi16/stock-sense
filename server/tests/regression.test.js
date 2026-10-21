const test = require('node:test');
const assert = require('node:assert/strict');
const { createCache } = require('../services/requestCache');
const { chatTickers } = require('../services/chatContext');

test('concurrent requests share work and subsequent requests reuse results', async () => {
  const cached = createCache(2, 1000);
  let calls = 0;
  const load = async () => { calls++; return ['quote']; };
  const result = await Promise.all([cached('AAPL', load), cached('AAPL', load)]);
  assert.deepEqual(result, [['quote'], ['quote']]);
  await cached('AAPL', load);
  assert.equal(calls, 1);
});
test('failures do not poison the cache', async () => {
  const cached = createCache(2, 1000);
  await assert.rejects(cached('x', async () => { throw Error('down'); }));
  assert.equal(await cached('x', async () => 42), 42);
});
test('cache evicts old entries and expires results', async () => {
  const cached = createCache(1, 1000);
  await cached('a', async () => 1);
  await cached('b', async () => 2);
  assert.equal(await cached('a', async () => 3), 3);
  const expired = createCache(1, 0);
  await expired('a', async () => 1);
  assert.equal(await expired('a', async () => 2), 2);
});
test('comparison gets both symbols instead of only the selected stock', () => {
  assert.deepEqual(chatTickers('Compare AAPL and MSFT', { ticker: 'NVDA' }), ['AAPL', 'MSFT']);
});
test('follow-up and selected-stock questions retain context', () => {
  assert.deepEqual(chatTickers('What about earnings?', {}, [{role: 'user', content: 'Explain TSLA'}]), ['TSLA']);
  assert.deepEqual(chatTickers('Explain recent movement', {ticker: 'NVDA'}), ['NVDA']);
  assert.deepEqual(chatTickers('Explain recent movement'), []);
  assert.deepEqual(chatTickers('I want AI analysis'), []);
});

const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function chatRoute(handleChat, fetchMarketData) {
  const routes = {};
  const app = { use() {}, get() {}, post(route, handler) { routes[route] = handler; }, listen() {} };
  const express = Object.assign(() => app, { json: () => () => {} });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8'), {
    require(name) {
      if (name === 'dotenv') return { config() {} };
      if (name === 'express') return express;
      if (name === 'cors') return () => () => {};
      if (name === './services/marketData') return { fetchMarketData };
      if (name === './services/aiSynthesizer') return { handleChat };
      if (name === './services/chatContext') return { chatTickers };
      if (name === './services/requestCache') return { createCache };
      throw Error(name);
    }, process: { env: {} }, console,
  });
  return async body => {
    let status = 200, payload;
    await routes['/api/chat']({ body }, { status(value) { status = value; return this; }, json(value) { payload = value; } });
    return { status, payload };
  };
}
test('chat endpoint supplies comparison data and history without requiring context', async () => {
  let received;
  const invoke = chatRoute(async (...args) => { received = args; return 'Comparison'; }, async tickers => tickers.map(ticker => ({ ticker, price: 100 })));
  const result = await invoke({ message: 'Compare AAPL and MSFT', history: [{role: 'user', content: 'Hello'}] });
  assert.equal(result.status, 200);
  assert.equal(result.payload.reply, 'Comparison');
  assert.equal(received[1].marketData.length, 2);
  assert.equal(received[2][0].content, 'Hello');
});
test('chat rejects empty messages and reports provider failures as HTTP errors', async () => {
  const invoke = chatRoute(async () => { throw Error('provider down'); }, async () => []);
  assert.equal((await invoke({ message: ' ' })).status, 400);
  assert.equal((await invoke({ message: 'Hi', context: null })).status, 503);
});
