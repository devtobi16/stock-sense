import test from 'node:test';
import assert from 'node:assert/strict';
import { startPolling } from '../src/lib/resourcePolling.ts';
const settle = () => new Promise(resolve => setImmediate(resolve));
test('hidden tabs do no refresh work; becoming visible resumes it',async()=>{
 let visible=false,calls=0;const timers=new Map<number,()=>void>();let id=0;
 const polling=startPolling(async()=>{calls++;},()=>60000,{visible:()=>visible,schedule(fn){timers.set(++id,fn);return id;},cancel(n){timers.delete(n);}});
 await settle();assert.equal(calls,0);visible=true;await polling.trigger();assert.equal(calls,1);
 polling.stop();assert.equal(timers.size,0);await polling.trigger();assert.equal(calls,1);
});
test('overlapping focus events leave only one polling timer',async()=>{
 const timers=new Map<number,()=>void>();let id=0;
 const polling=startPolling(async()=>{await settle();},()=>60000,{visible:()=>true,schedule(fn){timers.set(++id,fn);return id;},cancel(n){timers.delete(n);}});
 await Promise.all([polling.trigger(),polling.trigger()]);await settle();assert.equal(timers.size,1);polling.stop();
});
test('unmount during request prevents future polling',async()=>{
 let finish:()=>void=()=>{},scheduled=0;
 const polling=startPolling(()=>new Promise<void>(r=>{finish=r;}),()=>60000,{visible:()=>true,schedule(){scheduled++;return 1;},cancel(){}});
 polling.stop();finish();await settle();assert.equal(scheduled,0);
});
