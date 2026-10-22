const SYMBOL = /^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/;
const STOP_WORDS = new Set('I A AI API CEO CFO EPS PE ETF ETFS USD THE AND IRA ROI USA US UK EU GDP APR APY CD CDS MMF NAV UTC WHAT HOW WHY WHEN WHERE WHICH CAN DO IS ARE FOR NEW TOPIC'.split(' '));
const ALIASES = { apple: 'AAPL', microsoft: 'MSFT', nvidia: 'NVDA', tesla: 'TSLA', amazon: 'AMZN', alphabet: 'GOOGL', google: 'GOOGL', meta: 'META', netflix: 'NFLX', 'advanced micro devices': 'AMD', intel: 'INTC', 'berkshire hathaway': 'BRK.B' };
const KNOWN = new Set([...Object.values(ALIASES), 'VTI', 'VOO', 'SPY', 'QQQ', 'DIA', 'JPM', 'V', 'WMT']);
const MAX_TICKERS = 4;
function extract(text = '') {
  const found = [];
  for (const match of text.matchAll(/\$[a-z]{1,5}(?:[.-][a-z]{1,2})?\b|\b[a-z]{1,5}(?:[.-][a-z]{1,2})?\b/gi)) {
    const raw = match[0], symbol = raw.replace(/^\$/, '').toUpperCase();
    if (!STOP_WORDS.has(symbol) && (raw.startsWith('$') || KNOWN.has(symbol) || raw === symbol)) found.push({symbol, index: match.index});
  }
  for (const [name, symbol] of Object.entries(ALIASES)) {
    const match = new RegExp(`\\b${name}\\b`, 'i').exec(text);
    if (match) found.push({symbol, index: match.index});
  }
  return [...new Set(found.sort((a,b) => a.index-b.index).map(x => x.symbol))];
}
function resolveChatContext(message, context = {}, history = []) {
  let symbols = extract(message);
  let source = 'message';
  const followup = /\b(those|them|that one|these|which of|what about)\b/i.test(message);
  const educational = !followup && /\b(beginner|diversification|diversified|investing basics|what is|what are|how do|how does|risk tolerance|six months|\d+ months)\b/i.test(message);
  const reset = /\b(new topic|change (?:the )?topic|forget (?:that|those)|start over)\b/i.test(message);
  if (!symbols.length && !reset && !educational) {
    for (const turn of [...history].reverse()) {
      // Both user mentions and assistant suggestions can anchor a follow-up.
      if (!['user','assistant'].includes(turn.role) || typeof turn.content !== 'string') continue;
      if (/\b(new topic|start over)\b/i.test(turn.content)) break;
      symbols = extract(turn.content);
      // Assistant prose contains many uppercase acronyms and incidental company
      // names. Prefer the user's actual stock focus over those incidental mentions.
      if (turn.role === 'assistant') {
        const userFocus = [...history].reverse().find(t => t.role === 'user' && extract(t.content).length);
        symbols = userFocus ? extract(userFocus.content) : symbols.filter(s => KNOWN.has(s));
      }
      if (symbols.length) { source = 'conversation'; break; }
    }
    if (!symbols.length && typeof context.ticker === 'string' && SYMBOL.test(context.ticker.toUpperCase())) {
      symbols = [context.ticker.toUpperCase()]; source = 'selected-stock';
    }
  }
  return { tickers: symbols.slice(0, MAX_TICKERS), omittedTickers: symbols.slice(MAX_TICKERS), source: symbols.length ? source : 'general' };
}
function chatTickers(message, context = {}, history = []) { return resolveChatContext(message, context, history).tickers; }
function sanitizeHistory(history) {
  const turns = (Array.isArray(history) ? history : []).filter(t => t && ['user','assistant'].includes(t.role) && typeof t.content === 'string').slice(-40);
  let budget = 24000;
  const result = [];
  for (const turn of turns.reverse()) {
    if (budget <= 0) break;
    const content = turn.content.slice(0, Math.min(4000, budget));
    budget -= content.length;
    result.push({ role: turn.role, content });
  }
  return result.reverse();
}
module.exports = { chatTickers, resolveChatContext, sanitizeHistory, MAX_TICKERS };
