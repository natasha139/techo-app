import test from 'node:test';
import assert from 'node:assert/strict';
import {createWriteQueue} from '../src/writeQueue.js';
test('failed writes retain newer edits and retry in order',async()=>{
 const writes=[],states=[];let fail=true;
 const queue=createWriteQueue(s=>states.push(s));
 queue.enqueue(async()=>{if(fail)throw Error('offline');writes.push('A');});
 await new Promise(r=>setImmediate(r));
 queue.enqueue(async()=>{writes.push('B');});
 assert.equal(queue.hasPending(),true);assert.equal(states.at(-1).pending,2);assert.equal(states.at(-1).error,'offline');assert.deepEqual(writes,[]);
 fail=false;await queue.retry();assert.deepEqual(writes,['A','B']);assert.equal(queue.hasPending(),false);assert.equal(states.at(-1).running,false);
});
test('overlapping edits never write concurrently',async()=>{
 const writes=[];let release;
 const queue=createWriteQueue(()=>{});
 queue.enqueue(async()=>{writes.push('A start');await new Promise(r=>release=r);writes.push('A end');});
 queue.enqueue(async()=>{writes.push('B');});assert.deepEqual(writes,['A start']);release();await new Promise(r=>setImmediate(r));assert.deepEqual(writes,['A start','A end','B']);
});
