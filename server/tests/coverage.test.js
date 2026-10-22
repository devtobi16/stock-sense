const test=require('node:test'),assert=require('node:assert/strict');
const {COMPANIES,searchCompanies,normalizeTicker,createResearch,classifyHeadline}=require('../services/companyResearch');
const {createApp}=require('../portfolioApp');
const {resolveChatContext}=require('../services/chatContext');
const fixture={cik:21344,name:'COCA COLA CO',tickers:['KO'],filings:{recent:{form:['10-K','8-K','20-F'],accessionNumber:['0000021344-26-000001','0000021344-26-000002','0000021344-26-000003'],filingDate:['2026-02-01','2026-03-01','2026-04-01'],primaryDocument:['annual.htm','current.htm','foreign.htm']}}};
test('full directory resolves companies outside demo list and bounds search results',()=>{
 assert.ok(Object.keys(COMPANIES).length>1000);assert.equal(COMPANIES.KO.cik,'21344');assert.equal(searchCompanies('COST')[0].ticker,'COST');assert.ok(searchCompanies('Coca').some(c=>c.ticker==='KO'));assert.ok(searchCompanies('').length<=20);assert.equal(normalizeTicker('brk.b'),'BRK-B');
});
test('new issuer filings validate identity, include foreign forms and coalesce lookups',async()=>{
 let calls=0;const service=createResearch({fetcher:async()=>{calls++;return new Response(JSON.stringify(fixture));},market:{},snapshots:{}});
 const [a,b]=await Promise.all([service.filings('KO'),service.filings('KO')]);assert.deepEqual(a,b);assert.equal(calls,1);assert.equal(a.filings.length,3);assert.equal(a.filings[0].form,'20-F');assert.ok(a.filings[0].url.startsWith('https://www.sec.gov/Archives/edgar/data/21344/'));
});
test('provider fallback accepts only the matching issuer and original SEC archive',async()=>{
 const good={cik:'21344',form:'10-K',accessNumber:'0000021344-26-000001',filedDate:'2026-02-01 00:00:00',reportUrl:'https://www.sec.gov/Archives/edgar/data/21344/000002134426000001/annual.htm'};
 const service=createResearch({snapshots:{},fetcher:async()=>new Response('',{status:403}),market:{fetchCompanyFilings:async()=>[good,{...good,cik:'789019'},{...good,reportUrl:'https://example.com/annual.htm'}]}});
 const r=await service.filings('KO');assert.equal(r.filings.length,1);assert.equal(r.source,'Finnhub SEC filing index');assert.equal(r.filings[0].url,good.reportUrl);
 await assert.rejects(()=>service.document('KO',good.accessNumber));
});
test('unknown and unavailable issuers have distinct honest coverage messages',async()=>{
 const service=createResearch({snapshots:{},fetcher:async()=>new Response('',{status:403}),market:{}});
 const unknown=await service.filings('NOTREAL123');assert.equal(unknown.unsupported,true);assert.deepEqual(unknown.filings,[]);
 const blocked=await service.filings('KO');assert.equal(blocked.unavailable,true);assert.match(blocked.searchUrl,/CIK=21344/);assert.deepEqual(blocked.filings,[]);
});
test('broader news matches company names across punctuation without common-word ticker matches',()=>{
 assert.equal(classifyHeadline('KO',{title:'Coca-Cola raises guidance',link:'https://example.com'}).label,'Positive');
 assert.equal(classifyHeadline('COST',{title:'Costco raises guidance',link:'https://example.com'}).label,'Positive');
 assert.equal(classifyHeadline('COST',{title:'Airlines face cost increases',link:'https://example.com'}).relevance,'Unconfirmed');
 assert.deepEqual(resolveChatContext('Explain $COST',{ticker:'AAPL'},[]).tickers,['COST']);
 assert.deepEqual(resolveChatContext('What are its risks?',{ticker:'KO'},[{role:'user',content:'Explain $COST'}]).tickers,['COST']);
});
test('calendar route requests broad coverage and company search does not send full catalogue',async t=>{
 let selected='unset';const app=createApp({market:{fetchEarningsCalendar:async tickers=>{selected=tickers;return [{ticker:'KO'}];}}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>server.close(r)));
 const base=`http://127.0.0.1:${server.address().port}`;
 const r=await fetch(base+'/api/earnings-calendar');assert.deepEqual(await r.json(),[{ticker:'KO'}]);assert.equal(selected,undefined);
 const companies=await (await fetch(base+'/api/research/companies?q=COST')).json();assert.equal(companies[0].ticker,'COST');assert.ok(companies.length<=20);
});
test('calendar retains non-demo releases, zero estimates and UTC dates with one provider request',async()=>{
 const original=global.fetch;let calls=0;const date=new Date().toISOString().slice(0,10);
 global.fetch=async()=>{calls++;return new Response(JSON.stringify({earningsCalendar:[{symbol:'KO',date,epsEstimate:0,hour:'bmo'},{symbol:'COST',date,epsActual:2},{symbol:'BAD',date:'invalid'}]}));};
 try {const {fetchEarningsCalendar}=require('../services/marketData');const rows=await fetchEarningsCalendar(undefined,{strict:true});assert.deepEqual(rows.map(r=>r.ticker),['KO','COST']);assert.equal(rows[0].estimatedEPS,0);assert.equal(rows[1].estimatedEPS,null);assert.equal(calls,1);}finally{global.fetch=original;}
});
