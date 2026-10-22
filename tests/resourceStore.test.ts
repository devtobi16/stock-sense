import test from 'node:test';
import assert from 'node:assert/strict';
import { createResourceStore } from '../src/lib/resourceStore.ts';
test('concurrent consumers and page revisits reuse one request',async()=>{
 let calls=0;const store=createResourceStore(async()=>{calls++;return {price:100};});
 await Promise.all([store.refresh('a',100),store.refresh('a',100)]);
 await store.refresh('a',100);assert.equal(calls,1);assert.equal(store.read<{price:number}>('a').data?.price,100);
});
test('expired data stays visible while refreshing',async()=>{
 let clock=0,calls=0;let finish:(v:unknown)=>void=()=>{};
 const store=createResourceStore(async()=> ++calls===1 ? 'old' : new Promise(r=>{finish=r;}),()=>clock);
 await store.refresh('a',100);clock=101;const p=store.refresh('a',100);
 await Promise.resolve();assert.equal(store.read('a').data,'old');assert.equal(store.read('a').loading,true);
 finish('new');await p;assert.equal(store.read('a').data,'new');
});
test('slow old ticker cannot overwrite the current ticker',async()=>{
 let finish:(v:unknown)=>void=()=>{};
 const store=createResourceStore(async url=>url==='AAPL'?new Promise(r=>{finish=r;}):'MSFT data');
 const old=store.refresh('AAPL',100);await store.refresh('MSFT',100);
 finish('AAPL data');await old;assert.equal(store.read('MSFT').data,'MSFT data');
});
test('failure retains stale data and backs off with a fake clock',async()=>{
 let clock=0,calls=0;const store=createResourceStore(async()=>{if(++calls>1)throw Error('429');return 'saved';},()=>clock);
 await store.refresh('a',100);clock=101;await store.refresh('a',100);
 assert.equal(store.read('a').data,'saved');assert.equal(store.read('a').error,'429');
 clock=200;await store.refresh('a',100);assert.equal(calls,2);
 clock=30102;await store.refresh('a',100);assert.equal(calls,3);
});
test('manual refresh bypasses freshness and removes old errors on success',async()=>{
 let calls=0;const store=createResourceStore(async()=>++calls);
 await store.refresh('a',100000);await store.refresh('a',100000,true);assert.equal(store.read('a').data,2);
});
test('inactive resources are evicted at capacity',async()=>{
 let calls=0;const store=createResourceStore(async()=>++calls,Date.now,1);
 await store.refresh('a',100000);await store.refresh('b',100000);await store.refresh('a',100000);assert.equal(calls,3);
});
