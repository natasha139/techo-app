const GATEWAY = 'https://i.weread.qq.com/api/agent/gateway';
const encoder = new TextEncoder();
export class WeReadError extends Error { constructor(message, status = 502) { super(message); this.status = status; } }
export function safeUrl(value, reading = false) {
  try { const u = new URL(value); return u.protocol === 'https:' && (!reading || u.hostname === 'weread.qq.com') ? u.href : ''; } catch { return ''; }
}
export async function gateway(key, apiName, params = {}, transport = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await transport(GATEWAY, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ api_name: apiName, skill_version: '1.0.5', ...params }), signal: controller.signal });
    if (!response.ok) throw new WeReadError(response.status === 401 || response.status === 403 ? '微信读书授权已失效，请更新 API Key。' : '微信读书暂时无法连接，请稍后重试。');
    const reader = response.body.getReader(); let size = 0; const chunks = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2 * 1024 * 1024) { await reader.cancel(); throw new WeReadError('本次数据过大，请稍后重试。'); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (data.upgrade_info) throw new WeReadError('微信读书接口需要升级，请联系网站维护者。');
    if (data.errcode && Number(data.errcode) !== 0) throw new WeReadError('微信读书返回错误，请检查 API Key 或稍后重试。');
    return data;
  } catch (err) { if (err instanceof WeReadError) throw err; throw new WeReadError('微信读书连接超时或返回异常，请重试。'); }
  finally { clearTimeout(timer); }
}
async function encryptionKey(secret) {
  if (!secret) throw new WeReadError('连接服务尚未配置，请联系网站维护者。', 503);
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode('techo-weread-v1:' + secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function seal(value, secret, owner) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(owner) }, await encryptionKey(secret), encoder.encode(value));
  return JSON.stringify({ iv: Array.from(iv), data: Array.from(new Uint8Array(data)) });
}
export async function unseal(value, secret, owner) {
  const payload = JSON.parse(value);
  const result = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(payload.iv), additionalData: encoder.encode(owner) }, await encryptionKey(secret), new Uint8Array(payload.data));
  return new TextDecoder().decode(result);
}
export function normalizeBook(book) {
  return { id: String(book.bookId), title: book.title || '未命名书籍', author: book.author || '', cover: safeUrl(book.cover), category: typeof book.category === 'string' ? book.category : '', readerLink: safeUrl(book.readerLink || book.deepLink, true), status: Number(book.finishReading) === 1 ? 'finished' : 'unread', progress: null, readingSeconds: null };
}
export async function collectBook(key, id, call = gateway) {
  const [info, marks, chapters, progress] = await Promise.all([
    call(key, '/book/info', { bookId: id }), call(key, '/book/bookmarklist', { bookId: id }), call(key, '/book/chapterinfo', { bookId: id }), call(key, '/book/getprogress', { bookId: id }),
  ]);
  const reviews = []; let cursor = 0; const seen = new Set(); let complete = false;
  for (let page = 0; page < 20; page++) {
    const data = await call(key, '/review/list/mine', { bookid: id, synckey: cursor, count: 100 });
    for (const item of data.reviews || []) { const r = item.review || item; if (r.reviewId && !seen.has(r.reviewId)) { seen.add(r.reviewId); reviews.push(r); } }
    if (!data.hasMore) { complete = true; break; }
    if (!data.synckey || data.synckey === cursor) throw new WeReadError('笔记翻页异常，未覆盖已保存数据，请重试。');
    cursor = data.synckey;
  }
  if (!complete) throw new WeReadError('这本书的想法超过单次同步范围，未覆盖已保存数据。');
  const p = progress.book || {};
  const book = normalizeBook({ ...info, bookId: id });
  book.progress = Math.max(0, Math.min(100, Number(p.progress) || 0));
  book.status = p.finishTime || book.progress >= 100 ? 'finished' : p.isStartReading || p.updateTime || book.progress > 0 ? 'reading' : 'unread';
  book.readingSeconds = Number(p.recordReadingTime) || 0;
  book.highlights = (marks.updated || []).filter(m => m.markText && Number(m.type ?? 1) === 1).map(m => ({ id: String(m.bookmarkId), chapterId: String(m.chapterUid ?? ''), text: m.markText, range: m.range || '', created: m.createTime || 0 }));
  book.thoughts = reviews.map(r => ({ id: String(r.reviewId), chapterId: String(r.chapterUid ?? ''), chapterName: r.chapterName || '', text: r.content || '', quote: r.abstract || '', range: r.range || '', created: r.createTime || 0 }));
  book.chapters = (chapters.chapters || marks.chapters || []).map(c => ({ id: String(c.chapterUid), title: c.title, order: c.chapterIdx ?? 0 }));
  return book;
}
async function schema(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS weread_connections (sync_code TEXT PRIMARY KEY, key_cipher TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    db.prepare("CREATE TABLE IF NOT EXISTS weread_books (sync_code TEXT NOT NULL, book_id TEXT NOT NULL, metadata TEXT NOT NULL, content TEXT, personal_note TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL, PRIMARY KEY (sync_code, book_id))"),
  ]);
}
function response(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
export async function handleWeread(request, env, syncCode, call = gateway) {
  // The caller has already validated the app session and sync code.
  const path = new URL(request.url).pathname; const method = request.method; const db = env.SELF_GROWTH_DB;
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return response({ error: '不允许跨站请求。' }, 403);
  try {
    await schema(db);
    const secret = env.WEREAD_ENCRYPTION_KEY || env.SESSION_SECRET;
    const connection = await db.prepare('SELECT key_cipher FROM weread_connections WHERE sync_code = ?').bind(syncCode).first();
    if (path === '/api/weread/status' && method === 'GET') return response({ connected: !!connection, ready: !!secret });
    if (path === '/api/weread/connect' && method === 'POST') {
      const body = await request.json(); const key = typeof body.key === 'string' ? body.key.trim() : '';
      if (!key || key.length > 2048 || /[\r\n]/.test(key)) return response({ error: '请填写有效的微信读书 API Key。' }, 400);
      if (!secret) throw new WeReadError('连接服务尚未配置。', 503);
      await call(key, '/shelf/sync');
      const encrypted = await seal(key, secret, syncCode);
      await db.prepare('INSERT INTO weread_connections (sync_code, key_cipher, updated_at) VALUES (?, ?, ?) ON CONFLICT(sync_code) DO UPDATE SET key_cipher = excluded.key_cipher, updated_at = excluded.updated_at').bind(syncCode, encrypted, new Date().toISOString()).run();
      return response({ connected: true });
    }
    if (path === '/api/weread/books' && method === 'GET') {
      const { results } = await db.prepare('SELECT book_id, metadata, content, updated_at FROM weread_books WHERE sync_code = ? ORDER BY updated_at DESC').bind(syncCode).all();
      return response({ books: results.map(r => ({ ...JSON.parse(r.metadata), noteCount: r.content ? (() => { const c = JSON.parse(r.content); return (c.highlights?.length || 0) + (c.thoughts?.length || 0); })() : null, syncedAt: r.updated_at, notesSynced: !!r.content })) });
    }
    const match = path.match(/^\/api\/weread\/books\/([A-Za-z0-9_-]+)(\/sync)?$/);
    if (match) {
      const id = match[1];
      if (method === 'POST' && match[2]) {
        if (!connection) throw new WeReadError('请先连接微信读书。', 400);
        const key = await unseal(connection.key_cipher, secret, syncCode);
        const book = await collectBook(key, id, call);
        const { highlights, thoughts, chapters, ...metadata } = book;
        const content = JSON.stringify({ highlights, thoughts, chapters });
        if (encoder.encode(content).byteLength > 800000) throw new WeReadError('这本书的笔记过大，未覆盖已保存数据。');
        await db.prepare('INSERT INTO weread_books (sync_code, book_id, metadata, content, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(sync_code, book_id) DO UPDATE SET metadata = excluded.metadata, content = excluded.content, updated_at = excluded.updated_at').bind(syncCode, id, JSON.stringify(metadata), content, new Date().toISOString()).run();
      } else if (method === 'PUT' && !match[2]) {
        const body = await request.json();
        if (typeof body.personalNote !== 'string' || body.personalNote.length > 50000) return response({ error: '心得太长或格式错误。' }, 400);
        await db.prepare('UPDATE weread_books SET personal_note = ? WHERE sync_code = ? AND book_id = ?').bind(body.personalNote, syncCode, id).run();
      } else if (method !== 'GET' || match[2]) return response({ error: '不支持此操作。' }, 405);
      const row = await db.prepare('SELECT metadata, content, personal_note, updated_at FROM weread_books WHERE sync_code = ? AND book_id = ?').bind(syncCode, id).first();
      if (!row) return response({ error: '找不到这本书，请先同步书架。' }, 404);
      return response({ book: { ...JSON.parse(row.metadata), ...(row.content ? JSON.parse(row.content) : {}), personalNote: row.personal_note, syncedAt: row.updated_at } });
    }
    if (path === '/api/weread/sync' && method === 'POST') {
      if (!connection) throw new WeReadError('请先连接微信读书。', 400);
      const key = await unseal(connection.key_cipher, secret, syncCode);
      const shelf = await call(key, '/shelf/sync');
      if (!Array.isArray(shelf.books)) throw new WeReadError('书架数据异常，未覆盖已保存数据。');
      const books = shelf.books.filter(b => b.bookId).map(normalizeBook);
      // Shelf refresh updates only source metadata; cached detail and personal writing stay intact.
      for (let start = 0; start < books.length; start += 50) await db.batch(books.slice(start, start + 50).map(book => db.prepare('INSERT INTO weread_books (sync_code, book_id, metadata, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(sync_code, book_id) DO UPDATE SET metadata = json_patch(weread_books.metadata, excluded.metadata), updated_at = excluded.updated_at').bind(syncCode, book.id, JSON.stringify(Object.fromEntries(Object.entries(book).filter(([k]) => !['progress', 'readingSeconds', 'status'].includes(k)))), new Date().toISOString())));
      return response({ imported: books.length, albums: shelf.albums?.length || 0 });
    }
    return response({ error: 'Not found' }, 404);
  } catch (err) { return response({ error: err instanceof WeReadError ? err.message : '同步服务暂时不可用，请重试。' }, err instanceof WeReadError ? err.status : 500); }
}
