const test=require('node:test'),assert=require('node:assert/strict');
const {parseFilings,cleanText,selectExcerpts,classifyHeadline,validateAnalysis,createResearch}=require('../services/companyResearch');
const {createApp}=require('../portfolioApp');
const {resolveChatContext}=require('../services/chatContext');
const data={cik:'320193',name:'Apple Inc.',tickers:['AAPL'],filings:{recent:{form:['8-K','10-Q','10-K','4','10-K'],accessionNumber:['0000320193-26-000003','0000320193-26-000002','0000320193-25-000001','0000320193-26-000004','0000320193-25-000005'],filingDate:['2026-08-01','2026-07-31','2025-10-31','2026-08-01','2025-10-30'],reportDate:['2026-08-01','2026-06-30','2025-09-30','',''],primaryDocument:['aapl8.htm','aaplq.htm','aaplk.htm','ownership.xml','../../evil.htm']}}};
test('SEC parsing verifies issuer identity, excludes unsafe paths and non-research forms',()=>{
 const r=parseFilings(data,'AAPL');assert.equal(r.filings.length,3);assert.equal(r.filings[0].form,'8-K');assert.equal(r.filings[1].url,'https://www.sec.gov/Archives/edgar/data/320193/000032019326000002/aaplq.htm');assert.throws(()=>parseFilings({...data,tickers:['MSFT']},'AAPL'));assert.throws(()=>parseFilings({...data,cik:'789019'},'AAPL'));
});
test('filing extraction strips executable and hidden XBRL content; evidence retains source wording',()=>{
 const text=cleanText('<script>invent revenue</script><ix:header>hidden facts</ix:header><p>Revenue &amp; income &#8212; increased.</p><p>'+('Risks include supply chain disruption and competitive pressure. ').repeat(4)+'</p>');assert.ok(!text.includes('invent'));assert.ok(!text.includes('hidden'));assert.match(text,/Revenue & income — increased/);const excerpts=selectExcerpts(text,'supply risks');assert.ok(excerpts.length);assert.ok(excerpts.every(e=>text.includes(e.text)));assert.ok(excerpts.every(e=>e.text.length<=900));
});
test('headline labels require company relevance and resolve mixed evidence to neutral',()=>{
 const make=title=>classifyHeadline('AAPL',{title,link:'https://example.com/news'});
 assert.equal(make('Apple raises guidance after strong results').label,'Positive');assert.equal(make('Apple cuts forecast on weaker demand').label,'Negative');assert.equal(make('Apple raises guidance but faces lawsuit').label,'Neutral');assert.equal(make('Microsoft raises guidance').label,'Neutral');assert.equal(make('Pineapple production rises').relevance,'Unconfirmed');assert.equal(make('Apple shares rise 5%').label,'Neutral');
});
test('AI news validation rejects fabricated IDs, incomplete results, invalid labels and unrelated catalysts',()=>{
 const a=classifyHeadline('AAPL',{title:'Microsoft raises guidance',link:'https://example.com'});
 assert.throws(()=>validateAnalysis({items:[]},[a]));assert.throws(()=>validateAnalysis({items:[{id:'fake',label:'Positive',reason:'A plausible but invented reason.'}]},[a]));assert.throws(()=>validateAnalysis({items:[{id:a.id,label:'BUY',reason:'A plausible but invented reason.'}]},[a]));const r=validateAnalysis({items:[{id:a.id,label:'Positive',reason:'A plausible but invented reason.'}]},[a]);assert.equal(r[0].label,'Neutral');
});
test('SEC metadata is coalesced and reused, unsupported symbols make no request',async()=>{
 let calls=0;const service=createResearch({fetcher:async()=>{calls++;return new Response(JSON.stringify(data));},market:{},generate:async()=>''});const [a,b]=await Promise.all([service.filings('AAPL'),service.filings('AAPL')]);assert.deepEqual(a,b);assert.equal(calls,1);assert.equal((await service.filings('ZZZZ')).unsupported,true);assert.equal(calls,1);await assert.rejects(()=>service.document('AAPL','0000320193-26-999999'));
});
test('news is ticker-filtered, independent of quote availability, and cached without AI',async()=>{
 let calls=0,ai=0;const service=createResearch({market:{fetchCompanyNews:async()=>{calls++;return [{title:'Apple raises guidance',link:'https://example.com/a'},{title:'Microsoft cuts forecast',link:'https://example.com/b'}];}},generate:async()=>{ai++;return '';}});const n=await service.news('AAPL');assert.equal(n.articles.length,1);assert.equal(n.unconfirmed.length,1);await service.news('AAPL');assert.equal(calls,1);assert.equal(ai,0);
});
test('explicit AI news requests reuse cached analysis and honor shared quota guard',async()=>{
 let calls=0;const market={fetchCompanyNews:async()=>[{title:'Apple raises guidance',link:'https://example.com/a'}]};const generate=async({prompt})=>{calls++;const id=JSON.parse(prompt.split('Headlines: ')[1])[0].id;return JSON.stringify({items:[{id,label:'Positive',reason:'Higher guidance suggests stronger expected operating performance.'}]});};const r=createResearch({market,generate,budget:{acquire:()=>()=>{}}});assert.equal((await r.analyzeNews('AAPL')).articles[0].method,'AI headline analysis');await r.analyzeNews('AAPL');assert.equal(calls,1);const denied=createResearch({market,generate,budget:{acquire:()=>null}});await assert.rejects(()=>denied.analyzeNews('AAPL'),e=>e.status===429);assert.equal(calls,1);
});
test('SEC failure is explicit and never cached as an empty successful library',async()=>{
 let calls=0;const r=createResearch({fetcher:async()=>{calls++;return new Response('',{status:503});},market:{},generate:async()=>''});await assert.rejects(()=>r.filings('AAPL'));await assert.rejects(()=>r.filings('AAPL'));assert.equal(calls,2);
});
test('filing follow-ups use selected company rather than interpreting SEC as a ticker',()=>{
 assert.deepEqual(resolveChatContext('What risks does this SEC filing disclose?',{ticker:'AAPL'},[]).tickers,['AAPL']);
 assert.deepEqual(resolveChatContext('Summarize this 10-K',{ticker:'MSFT',filing:'selected'},[{role:'user',content:'Explain AAPL'}]).tickers,['MSFT']);
});
test('chat receives server-fetched filing evidence and exposes its original source',async t=>{
 let received;
 const evidence={filing:{accession:data.filings.recent.accessionNumber[1],form:'10-Q',filed:'2026-07-31',url:'https://www.sec.gov/Archives/example.htm'},excerpts:[{id:'E1',text:'Actual source excerpt.'}]};
 const app=createApp({market:{fetchMarketData:async()=>[]},budget:{acquire:()=>()=>{}},research:{filings:async()=>({filings:[evidence.filing]}),document:async()=>evidence},handleChat:async(q,c)=>{received=c;return 'Supported answer [E1].';}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>server.close(r)));
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/chat`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'What risks does this SEC filing disclose?',context:{ticker:'AAPL',filing:evidence.filing.accession}})});const body=await response.json();assert.equal(response.status,200);assert.deepEqual(received.filingEvidence.excerpts,evidence.excerpts);assert.equal(body.sources[0].url,evidence.filing.url);assert.equal(response.headers.get('cache-control'),'no-store');
});
