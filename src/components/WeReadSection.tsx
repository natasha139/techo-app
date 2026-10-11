import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowLeft, RefreshCw, Grid2X2, List, Search, Link as LinkIcon } from 'lucide-react';

type Entry = { id: string; text: string; quote?: string; chapterId: string; chapterName?: string; range?: string };
type Book = { id: string; title: string; author: string; cover: string; category: string; readerLink: string; status?: string; progress?: number; readingSeconds?: number; noteCount?: number; notesSynced?: boolean; syncedAt: string; personalNote?: string; chapters?: { id: string; title: string; order: number }[]; highlights?: Entry[]; thoughts?: Entry[] };
const statusLabel = (book: Book) => book.status === 'finished' ? '读完' : book.status === 'reading' ? '在读' : book.status === 'unread' ? '未读' : '待同步进度';
async function request(path: string, code: string, method = 'GET', body?: object) {
  const res = await fetch('/api/weread/' + path, { method, headers: { 'Content-Type': 'application/json', 'X-Sync-Code': code }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json().catch(() => ({ error: '服务返回异常，请重新登录或重试。' }));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}
export default function WeReadSection({ syncCode }: { syncCode: string }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'gallery' | 'table'>('gallery');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState<Book | null>(null);
  const [draft, setDraft] = useState('');
  const [stop, setStop] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const stopRef = useRef(false);
  const load = async () => {
    setLoading(true); setError('');
    try { const [status, data] = await Promise.all([request('status', syncCode), request('books', syncCode)]); setConnected(status.connected); setReady(status.ready); setBooks(data.books); }
    catch (err) { setError(err instanceof Error ? err.message : '读取失败'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); return () => { stopRef.current = true; }; }, [syncCode]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (err) { setError(err instanceof Error ? err.message : '操作失败'); } finally { setBusy(false); }
  };
  const connect = () => run(async () => { await request('connect', syncCode, 'POST', { key }); setKey(''); setConnected(true); setShowConnect(false); setNotice('已连接，点击“同步书架”导入你的书籍。'); });
  const syncShelf = () => run(async () => { const data = await request('sync', syncCode, 'POST'); await load(); setNotice(`已更新 ${data.imported} 本电子书。${data.albums ? `微信读书另有 ${data.albums} 个有声专辑，此处展示电子书笔记。` : ''}`); });
  const open = (book: Book) => run(async () => { const data = await request(`books/${encodeURIComponent(book.id)}`, syncCode); setDetail(data.book); setDraft(data.book.personalNote || ''); });
  const savePersonal = async () => {
    if (!detail || draft === (detail.personalNote || '')) return;
    const data = await request(`books/${encodeURIComponent(detail.id)}`, syncCode, 'PUT', { personalNote: draft });
    setDetail(data.book);
  };
  const syncBook = () => run(async () => {
    if (!detail) return;
    await savePersonal();
    const data = await request(`books/${encodeURIComponent(detail.id)}/sync`, syncCode, 'POST'); setDetail(data.book); setDraft(data.book.personalNote || ''); await load(); setNotice('已更新划线、想法和阅读进度。');
  });
  const syncAll = () => run(async () => {
    setSyncingAll(true); stopRef.current = false; setStop(false); const failures: string[] = []; let imported = 0;
    for (const book of books) {
      if (stopRef.current) break;
      setNotice(`正在同步 ${imported + failures.length + 1} / ${books.length} · ${book.title}`);
      try { await request(`books/${encodeURIComponent(book.id)}/sync`, syncCode, 'POST'); imported++; }
      catch { failures.push(book.title); }
    }
    setSyncingAll(false); await load(); setNotice(`${stopRef.current ? '已停止。' : ''}已同步 ${imported} 本书。${failures.length ? `失败 ${failures.length} 本：${failures.join('、')}，可打开单本书重试。` : ''}`);
  });
  const filtered = books.filter(b => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || filter === 'notes' && b.notesSynced || b.status === filter));
  const controls = 'border border-[#dedbd4] rounded-md px-3 py-2 text-xs bg-white disabled:opacity-50';
  const groups = detail ? [...(detail.chapters || [])].sort((a, b) => a.order - b.order).filter(c => [...(detail.highlights || []), ...(detail.thoughts || [])].some(e => e.chapterId === c.id)) : [];
  if (detail) {
    const known = new Set(groups.map(c => c.id));
    const extra = [...new Set([...(detail.highlights || []), ...(detail.thoughts || [])].map(e => e.chapterId))].filter(id => !known.has(id)).map(id => ({ id, title: [...(detail.thoughts || [])].find(t => t.chapterId === id)?.chapterName || '书评与其他笔记', order: 99999 }));
    groups.push(...extra);
  }
  const exportNotes = () => {
    if (!detail) return;
    const lines = [`# ${detail.title}`, '', `作者：${detail.author}`, '', ...(detail.readerLink ? [`来源：${detail.readerLink}`, ''] : [])];
    for (const chapter of groups) {
      lines.push(`## ${chapter.title}`, '');
      for (const mark of (detail.highlights || []).filter(e => e.chapterId === chapter.id)) lines.push(mark.text.split('\n').map(line => '> ' + line).join('\n'), '');
      for (const thought of (detail.thoughts || []).filter(e => e.chapterId === chapter.id)) {
        if (thought.quote) lines.push(thought.quote.split('\n').map(line => '> ' + line).join('\n'), '');
        lines.push(`想法：${thought.text}`, '');
      }
    }
    lines.push('## 我的阅读心得', '', draft);
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = detail.title.replace(/[\\/:*?"<>|]/g, '_') + '.md'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="weread-section bg-white rounded-xl border border-[#dedbd4] p-5 sm:p-7 mb-6 text-[#37352f]">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen size={23} />微信读书笔记</h2><p className="text-xs text-[#8a857b] mt-2">把阅读留下来 · 书架、划线、想法与自己的心得</p></div>
      <button className={controls} disabled={busy || loading || !ready} onClick={() => { setShowConnect(!showConnect); setKey(''); }}>{connected ? '更新授权' : '连接微信读书'}</button>
    </div>
    {!ready && <p className="text-sm mb-4">连接服务尚未配置，请联系网站维护者。</p>}
    {showConnect && <form className="bg-[#f7f6f3] rounded-lg p-4 mb-5 space-y-3" onSubmit={e => { e.preventDefault(); connect(); }}>
      <p className="text-sm">在 <a className="underline" href="https://weread.qq.com/r/weread-skills" target="_blank" rel="noreferrer">微信读书官方页面</a> 创建 API Key，粘贴到这里即可连接。</p>
      <label className="block text-xs">微信读书 API Key<input className="block w-full border rounded-md p-2 mt-2 bg-white" type="password" value={key} onChange={e => setKey(e.target.value)} autoComplete="off" required disabled={busy} /></label>
      <p className="text-xs text-[#8a857b]">仅用于读取微信读书，凭据加密保存在网站后端。</p>
      <button className={controls} disabled={busy || !key.trim()}>验证并连接</button>
    </form>}
    {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded mb-4">{error} <button className="underline ml-2" onClick={load} disabled={busy}>重新读取</button></p>}
    {notice && <p role="status" className="text-sm bg-[#f3f7f1] p-3 rounded mb-4">{notice}</p>}
    {loading && <p className="text-sm text-[#8a857b]">正在读取书架…</p>}
    {detail ? <>
      <div className="flex flex-wrap justify-between gap-3 mb-6"><button className={controls} disabled={busy} onClick={() => run(async () => { await savePersonal(); setDetail(null); })}><ArrowLeft size={12} className="inline mr-1" />返回书架</button><button className={controls} disabled={busy || !connected} onClick={syncBook}><RefreshCw size={12} className="inline mr-1" />更新本书笔记</button><button className={controls} disabled={busy || !detail.highlights} onClick={exportNotes}>导出笔记 .md</button></div>
      <div className="flex gap-5 mb-7">{detail.cover && <img src={detail.cover} alt={detail.title} className="w-20 h-28 object-contain rounded" referrerPolicy="no-referrer" />}<div className="min-w-0"><h3 className="text-2xl font-bold break-words">{detail.title}</h3><p className="text-sm mt-2">{detail.author}</p><div className="flex flex-wrap gap-3 text-xs mt-3 text-[#8a857b]"><span>{statusLabel(detail)}</span>{detail.progress != null && <span>{detail.progress}%</span>}{detail.readingSeconds != null && <span>阅读 {Math.round(detail.readingSeconds / 60)} 分钟</span>}{detail.readerLink && <a href={detail.readerLink} target="_blank" rel="noreferrer" className="underline"><LinkIcon size={11} className="inline" /> 微信读书</a>}</div></div></div>
      <div className="border-y py-4 mb-6 text-xs text-[#8a857b] flex flex-wrap gap-4"><span>划线 {detail.highlights?.length ?? '待同步'}</span><span>想法 {detail.thoughts?.length ?? '待同步'}</span><span>更新于 {new Date(detail.syncedAt).toLocaleString()}</span></div>
      {!detail.highlights && <p className="text-sm mb-5">点击“更新本书笔记”读取划线和想法。</p>}
      {detail.highlights && groups.length === 0 && <p className="text-sm mb-5">这本书还没有划线或想法。</p>}
      {groups.map(chapter => <details key={chapter.id} open className="mb-5"><summary className="font-semibold border-b pb-3 cursor-pointer">{chapter.title}</summary><div className="pt-3 space-y-3">
        {(detail.highlights || []).filter(e => e.chapterId === chapter.id).sort((a, b) => parseInt(a.range || '0') - parseInt(b.range || '0')).map(mark => <blockquote key={mark.id} className="border-l-3 border-[#d4ccb9] bg-[#faf9f6] p-4 whitespace-pre-wrap text-sm leading-7">{mark.text}</blockquote>)}
        {(detail.thoughts || []).filter(e => e.chapterId === chapter.id).map(thought => <div key={thought.id} className="border rounded-lg p-4 text-sm leading-7">{thought.quote && <blockquote className="border-l-2 pl-3 mb-2 text-[#8a857b] whitespace-pre-wrap">{thought.quote}</blockquote>}<p className="whitespace-pre-wrap">💭 {thought.text}</p></div>)}
      </div></details>)}
      <div className="mt-8 bg-[#fffdf2] p-4 rounded-lg border border-[#e9dfb9]"><label className="block font-semibold text-sm" htmlFor="weread-personal">我的阅读心得</label><p className="text-xs text-[#8a857b] my-2">独立保存，更新微信读书笔记时会保留。</p><textarea id="weread-personal" value={draft} onChange={e => setDraft(e.target.value)} disabled={busy} rows={5} maxLength={50000} className="w-full border rounded p-3 bg-white text-sm" placeholder="这本书让我想到…" /><button className={controls + ' mt-3'} disabled={busy || draft === (detail.personalNote || '')} onClick={() => run(async () => { await savePersonal(); setNotice('心得已保存。'); })}>保存心得</button></div>
    </> : <>
      <div className="flex flex-wrap gap-2 items-center border-b pb-4 mb-5">
        <button className={controls} onClick={syncShelf} disabled={busy || !connected}><RefreshCw size={12} className="inline mr-1" />同步书架</button>
        <button className={controls} onClick={syncAll} disabled={busy || !connected || !books.length}>同步全部笔记</button>
        {syncingAll && books.length > 0 && <button className={controls} disabled={stop} onClick={() => { stopRef.current = true; setStop(true); }}>完成当前书后停止</button>}
        <div className="flex gap-1 ml-auto"><button aria-label="画廊视图" aria-pressed={view === 'gallery'} className={controls} onClick={() => setView('gallery')}><Grid2X2 size={14} /></button><button aria-label="表格视图" aria-pressed={view === 'table'} className={controls} onClick={() => setView('table')}><List size={14} /></button></div>
      </div>
      <div className="flex flex-wrap gap-3 mb-5"><label className="flex items-center gap-2 border rounded-md px-3 flex-1 min-w-0"><Search size={14} /><input className="py-2 text-xs min-w-0 w-full outline-none" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索书名、作者、分类" aria-label="搜索微信读书书架" /></label><select className={controls} value={filter} onChange={e => setFilter(e.target.value)} aria-label="筛选微信读书"><option value="all">全部电子书 · {books.length}</option><option value="notes">已同步笔记</option><option value="reading">在读</option><option value="finished">读完</option></select></div>
      {!loading && !filtered.length && <div className="py-12 text-center text-sm text-[#8a857b]">{books.length ? '没有符合筛选条件的书。' : connected ? '已连接。同步书架后，你的书会出现在这里。' : '连接微信读书，开始整理你的阅读笔记。'}</div>}
      {view === 'gallery' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{filtered.map(book => <button disabled={busy} key={book.id} onClick={() => open(book)} className="text-left border border-[#e6e3dc] rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white min-w-0"><div className="h-36 flex justify-center items-center bg-[#f7f6f3] p-3">{book.cover ? <img src={book.cover} alt="" className="h-full max-w-full object-contain rounded shadow-sm" loading="lazy" referrerPolicy="no-referrer" /> : <BookOpen size={38} className="text-[#b8b1a4]" />}</div><div className="p-3"><h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3><p className="text-xs text-[#8a857b] mt-1 truncate">{book.author}</p><span className="inline-block text-[10px] bg-[#eef3ec] text-[#5c7352] px-1.5 py-0.5 rounded mt-2">{statusLabel(book)}</span><p className="text-xs mt-2 text-[#8a857b]">{book.progress != null ? `${book.progress}% · ` : ''}{book.noteCount != null ? `${book.noteCount} 条划线 / 想法` : '笔记待同步'}</p>{book.category && <p className="text-[10px] text-[#8a857b] mt-1 truncate">{book.category}</p>}</div></button>)}</div> : <div className="overflow-x-auto"><table className="w-full text-xs min-w-[540px]"><thead><tr className="text-left text-[#8a857b] border-b">{['书名', '作者', '状态', '进度', '笔记'].map(t => <th key={t} className="p-3 font-normal">{t}</th>)}</tr></thead><tbody>{filtered.map(book => <tr key={book.id} className="border-b"><td className="p-3"><button disabled={busy} onClick={() => open(book)} className="underline text-left">{book.title}</button></td><td className="p-3">{book.author}</td><td className="p-3">{statusLabel(book)}</td><td className="p-3">{book.progress != null ? `${book.progress}%` : '待同步'}</td><td className="p-3">{book.noteCount ?? '待同步'}</td></tr>)}</tbody></table></div>}
    </>}
  </section>;
}
