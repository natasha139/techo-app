import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { gateway, collectBook, seal, unseal, handleWeread, safeUrl } from '../server/weread.mjs';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  const db = { prepare(sql) { return { bind(...args) { return {
    run: async () => sqlite.prepare(sql).run(...args), first: async () => sqlite.prepare(sql).get(...args), all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
  }; }, run: async () => sqlite.prepare(sql).run() }; }, batch: async statements => { sqlite.exec('BEGIN'); try { const result = []; for (const s of statements) result.push(await s.run()); sqlite.exec('COMMIT'); return result; } catch (err) { sqlite.exec('ROLLBACK'); throw err; } } };
  return db;
}
function gatewayResponse(data) { return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }); }
const shelf = { books: [{ bookId: '42', title: 'Example', author: 'Author', cover: 'https://example.com/cover.png' }], albums: [] };
function data(api, body) {
  if (api === '/shelf/sync') return shelf;
  if (api === '/book/info') return shelf.books[0];
  if (api === '/book/bookmarklist') return { updated: [{ bookmarkId: 'h1', chapterUid: 1, type: 1, markText: 'Quote', range: '10-20' }, { bookmarkId: 'b1', type: 0, markText: 'Bookmark' }] };
  if (api === '/book/chapterinfo') return { chapters: [{ chapterUid: 1, title: 'Chapter 1', chapterIdx: 1 }] };
  if (api === '/book/getprogress') return { book: { progress: 1, recordReadingTime: 120, isStartReading: 1 } };
  if (api === '/review/list/mine') return body.synckey === 0 ? { reviews: [{ review: { reviewId: 'r1', chapterUid: 1, content: 'First' } }], hasMore: 1, synckey: 12 } : { reviews: [{ review: { reviewId: 'r2', chapterUid: 1, content: 'Second' } }], hasMore: 0 };
  throw Error('Unexpected API');
}
test('credential encryption isolates owners and does not expose plaintext', async () => {
  const encrypted = await seal('test-only-key', 'test-secret', 'owner-a');
  assert.ok(!encrypted.includes('test-only-key'));
  assert.equal(await unseal(encrypted, 'test-secret', 'owner-a'), 'test-only-key');
  await assert.rejects(unseal(encrypted, 'test-secret', 'owner-b'));
});
test('gateway flattens parameters and does not return raw upstream errors or keys', async () => {
  await gateway('test-key', '/user/notebooks', { count: 20, lastSort: 7 }, async (_url, init) => {
    assert.deepEqual(JSON.parse(init.body), { api_name: '/user/notebooks', skill_version: '1.0.5', count: 20, lastSort: 7 });
    assert.equal(init.headers.Authorization, 'Bearer test-key'); return gatewayResponse({ books: [] });
  });
  await assert.rejects(gateway('test-key', '/shelf/sync', {}, async () => gatewayResponse({ errcode: -1, errmsg: 'test-key' })), err => !err.message.includes('test-key'));
});
test('book sync paginates thoughts, excludes bookmarks, and interprets 1 as 1 percent', async () => {
  const book = await collectBook('test-key', '42', async (_key, api, body) => data(api, body));
  assert.equal(book.progress, 1); assert.equal(book.status, 'reading'); assert.equal(book.highlights.length, 1); assert.equal(book.thoughts.length, 2); assert.equal(book.chapters[0].title, 'Chapter 1');
});
test('stalled pagination fails instead of silently publishing partial notes', async () => {
  await assert.rejects(collectBook('test-key', '42', async (_key, api, body) => api === '/review/list/mine' ? { reviews: [], hasMore: 1, synckey: body.synckey } : data(api, body)), /翻页异常/);
});
test('synced source preserves personal writing and each user owns separate records', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, init) => { const body = JSON.parse(init.body); return gatewayResponse(data(body.api_name, body)); });
  const env = { SELF_GROWTH_DB: database(), SESSION_SECRET: 'test-only-secret' };
  const call = (path, method = 'GET', body, owner = 'A') => handleWeread(new Request('https://techo-app.pages.dev/api/weread/' + path, { method, headers: { Origin: 'https://techo-app.pages.dev', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }), env, owner);
  assert.equal((await call('connect', 'POST', { key: 'test-only-key' })).status, 200);
  assert.equal((await call('sync', 'POST')).status, 200);
  assert.equal((await call('books/42/sync', 'POST')).status, 200);
  assert.equal((await call('books/42', 'PUT', { personalNote: 'My own writing' })).status, 200);
  await call('sync', 'POST'); await call('books/42/sync', 'POST');
  const saved = await (await call('books/42')).json();
  assert.equal(saved.book.personalNote, 'My own writing'); assert.equal(saved.book.thoughts.length, 2);
  assert.equal((await call('books/42', 'GET', undefined, 'B')).status, 404);
  const listing = await (await call('books')).json(); assert.equal(listing.books[0].progress, 1);
  const status = await (await call('status')).json(); assert.deepEqual(status, { connected: true, ready: true });
  assert.ok(!JSON.stringify(listing).includes('test-only-key'));
});
test('unsafe reader links and cross-site writes are rejected', async () => {
  assert.equal(safeUrl('javascript:alert(1)'), ''); assert.equal(safeUrl('https://evil.example/read', true), '');
  const response = await handleWeread(new Request('https://techo-app.pages.dev/api/weread/connect', { method: 'POST', headers: { Origin: 'https://evil.example' } }), {}, 'A');
  assert.equal(response.status, 403);
});
