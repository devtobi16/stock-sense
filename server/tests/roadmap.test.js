const test = require('node:test');
const assert = require('node:assert/strict');
const { chatTickers, resolveChatContext } = require('../services/chatContext');
const { createAnalysisCache } = require('../services/analysisCache');
const tick = () => new Promise(resolve => setImmediate(resolve));
const cases = [
 ['uppercase comparison', ['Compare AAPL and MSFT'], ['AAPL','MSFT']],
 ['four symbol cap', ['AAPL MSFT NVDA TSLA AMZN'], ['AAPL','MSFT','NVDA','TSLA']],
 ['follow-up', ['Which moved more?', {}, [{role:'user',content:'Compare AAPL and MSFT'}]], ['AAPL','MSFT']],
 ['selected-stock fallback', ['Explain recent movement', {ticker:'NVDA'}], ['NVDA']],
 ['beginner education', ['What can a beginner invest in?'], []],
 ['lowercase symbols', ['compare aapl and msft'], ['AAPL','MSFT']],
 ['dollar symbols', ['Explain $aapl'], ['AAPL']],
 ['company names', ['Compare Apple and Microsoft'], ['AAPL','MSFT']],
 ['financial acronyms', ['How do IRA and ROI work?'], []],
 ['conversation over page selection', ['Which moved more?', {ticker:'NVDA'}, [{role:'user',content:'Compare AAPL and MSFT'}]], ['AAPL','MSFT']],
 ['new topic clears context', ['New topic: explain diversification', {}, [{role:'user',content:'Compare AAPL and MSFT'}]], []],
 ['assistant suggestions', ['Which of those is more diversified?', {}, [{role:'user',content:'Suggest some broad funds'}, {role:'assistant',content:'Consider comparing VTI and VOO.'}]], ['VTI','VOO']],
];
for (const [name,args,want] of cases) test(`context: ${name}`, () => assert.deepEqual(chatTickers(...args), want));
test('ticker overflow is explicit metadata, not silent loss', () => assert.deepEqual(resolveChatContext('AAPL MSFT NVDA TSLA AMZN').omittedTickers, ['AMZN']));
test('AI enrichment returns immediately, coalesces, expires, and keeps previous analysis', async () => {
 let clock=0, calls=0, finish;
 const cache=createAnalysisCache({ttl:100,now:()=>clock});
 const load=()=>{calls++;return new Promise(r=>{finish=r;});};
 assert.equal(cache('a',load).status,'pending');
 assert.equal(cache('a',load).status,'pending');
 await tick(); assert.equal(calls,1);
 finish({summary:'done'}); await tick();
 assert.equal(cache('a',load).status,'ready');
 clock=101; const stale=cache('a',load);
 assert.equal(stale.status,'refreshing');assert.equal(stale.data.summary,'done');
 await tick(); finish({summary:'new'});await tick();
 assert.equal(cache('a',load).data.summary,'new');
});
test('AI failure backs off without creating a retry storm', async () => {
 let clock=0,calls=0;
 const cache=createAnalysisCache({retryMs:30,now:()=>clock});
 const load=async()=>{calls++;throw Error('503');};
 cache('a',load);await tick();
 assert.equal(cache('a',load).status,'unavailable');await tick();assert.equal(calls,1);
 clock=31;cache('a',load);await tick();assert.equal(calls,2);
});
test('AI cache bounds work when every slot has pending work', async () => {
 const cache=createAnalysisCache({limit:1});
 cache('a',()=>new Promise(()=>{}));
 assert.equal(cache('b',()=>Promise.resolve('other')).status,'busy');
});

const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function marketModule(fetch) {
 const sandbox={module:{exports:{}},process:{env:{}},fetch,AbortSignal,console:{error(){}},require(n){ if(n==='./requestCache') return require('../services/requestCache'); throw Error(n); }};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../services/marketData.js'),'utf8'),sandbox);
 return sandbox.module.exports;
}
test('quote-only portfolio work never requests company news',async()=>{
 const urls=[];const market=marketModule(async url=>{urls.push(url);return {ok:true,json:async()=>({c:100,dp:2,t:1000})};});
 const quotes=await market.fetchQuotes(['AAPL','MSFT']);assert.equal(quotes.length,2);
 assert.equal(urls.length,2);assert.ok(urls.every(url=>url.includes('/quote?')));
});
test('failed news preserves a valid quote',async()=>{
 const market=marketModule(async url=> url.includes('/quote?') ? {ok:true,json:async()=>({c:100,dp:2})} : {ok:false,status:503});
 const quote=await market.fetchTickerData('AAPL');assert.equal(quote.price,100);assert.equal(quote.news.length,0);
});
test('unknown symbols do not become zero-dollar live quotes',async()=>{
 const market=marketModule(async()=>({ok:true,json:async()=>({c:0,dp:0})}));
 assert.equal(await market.fetchQuote('ZZZZZ'),null);
});
test('history retains recent context but bounds message count and character budget',()=>{
 const {sanitizeHistory}=require('../services/chatContext');
 const turns=Array.from({length:50},(_,i)=>({role:'user',content:`${i}:`+'x'.repeat(4000)}));
 const result=sanitizeHistory(turns);assert.ok(result.length<=40);assert.ok(result.reduce((n,t)=>n+t.content.length,0)<=24000);assert.ok(result.at(-1).content.startsWith('49:'));
});
