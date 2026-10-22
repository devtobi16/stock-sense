const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const realExpress=require('express');
async function fixture(t) {
 let app,listen,finishAI;let aiCalls=0;
 const express=Object.assign(()=>{app=realExpress();listen=app.listen.bind(app);app.listen=()=>{};return app;},{json:realExpress.json});
 const quotes=[{ticker:'AAPL',price:100,changePct:2}];
 const market={fetchTrendingSymbols:async()=>['AAPL'],fetchQuotes:async()=>quotes,fetchMarketData:async()=>quotes};
 const ai={synthesizeMarketData:async()=>{aiCalls++;return new Promise(r=>{finishAI=r;});},handleChat:async(message,context,history)=>JSON.stringify({message,context,history})};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../index.js'),'utf8'),{require(n){
  if(n==='dotenv')return {config(){}};if(n==='express')return express;if(n==='cors')return require('cors');
  if(n==='./services/marketData')return market;if(n==='./services/aiSynthesizer')return ai;
  if(n.startsWith('./services/'))return require('../services/'+n.split('/').at(-1));throw Error(n);
 },process:{env:{}},console:{log(){}},performance});
 const server=listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>new Promise(r=>server.close(r)));
 return {url:`http://127.0.0.1:${server.address().port}`,get aiCalls(){return aiCalls;},finish(){finishAI({contradictions:[],narrativeShifts:[],thesisChanges:[]});}};
}
test('HTTP: dashboard prices respond while AI remains unresolved; timing header is emitted',async t=>{
 const f=await fixture(t);
 const insight=await fetch(f.url+'/api/market-insights');assert.equal((await insight.json()).status,'pending');
 const response=await fetch(f.url+'/api/market-snapshot');assert.equal(response.status,200);assert.match(response.headers.get('server-timing'),/app;dur=/);assert.equal((await response.json()).quotes[0].price,100);
 await fetch(f.url+'/api/market-insights');assert.equal(f.aiCalls,1);f.finish();
});
test('HTTP: beginner question and six-month follow-up reach model with conversation context',async t=>{
 const f=await fixture(t);const history=[{role:'user',content:'I am a beginner and need the money in six months.'}];
 const response=await fetch(f.url+'/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'What did I say about when I need the money?',history})});
 assert.equal(response.status,200);const data=JSON.parse((await response.json()).reply);assert.equal(data.history[0].content,history[0].content);assert.equal(data.context.requestedTickers.length,0);
});
test('HTTP: overflow symbols are returned to the UI',async t=>{
 const f=await fixture(t);const response=await fetch(f.url+'/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'Compare AAPL MSFT NVDA TSLA AMZN'})});
 const result=await response.json();assert.deepEqual(result.context.omittedTickers,['AMZN']);
});
