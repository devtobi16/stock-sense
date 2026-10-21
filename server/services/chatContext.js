const SYMBOL = /^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/;
const STOP_WORDS = new Set(['I', 'AI', 'API', 'CEO', 'CFO', 'EPS', 'PE', 'ETF', 'USD', 'THE', 'AND']);
function chatTickers(message, context = {}, history = []) {
  const extract = text => [...text.matchAll(/\$?\b[A-Z]{1,5}(?:[.-][A-Z]{1,2})?\b/g)]
    .map(m => m[0].replace(/^\$/, '')).filter(t => !STOP_WORDS.has(t));
  const explicit = extract(message);
  if (explicit.length) return [...new Set(explicit)].slice(0, 4);
  if (typeof context.ticker === 'string' && SYMBOL.test(context.ticker.toUpperCase())) return [context.ticker.toUpperCase()];
  for (const turn of [...history].reverse()) {
    if (turn.role !== 'user') continue;
    const found = extract(turn.content);
    if (found.length) return [...new Set(found)].slice(0, 4);
  }
  return [];
}
module.exports = { chatTickers };
