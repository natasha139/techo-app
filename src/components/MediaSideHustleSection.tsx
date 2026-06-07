/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, MessageSquareCode, Plus, Trash2, CalendarDays, BarChart3, TrendingUp, StickyNote } from 'lucide-react';
import { SideHustleContent, FinancialMetric } from '../types';

interface SideHustleProps {
  contents: SideHustleContent[];
  finance: FinancialMetric[];
  onAddContent: (c: Omit<SideHustleContent, 'id'>) => void;
  onDeleteContent: (id: string) => void;
  onUpdateContentStatus: (id: string, status: 'concept' | 'in_progress' | 'published') => void;
  onAddFinance: (f: Omit<FinancialMetric, 'id'>) => void;
  onDeleteFinance: (id: string) => void;
}

export default function MediaSideHustleSection({
  contents,
  finance,
  onAddContent,
  onDeleteContent,
  onUpdateContentStatus,
  onAddFinance,
  onDeleteFinance
}: SideHustleProps) {
  
  // Adding state for content
  const [platform, setPlatform] = useState('小红书');
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<'video' | 'article' | 'image_text' | 'other'>('image_text');
  const [publishDate, setPublishDate] = useState('2026-06-03');
  const [status, setStatus] = useState<'concept' | 'in_progress' | 'published'>('concept');

  // Adding state for finance
  const [month, setMonth] = useState('2026.06');
  const [traffic, setTraffic] = useState(1000);
  const [revenue, setRevenue] = useState(0.0);
  const [expense, setExpense] = useState(0.0);
  const [note, setNote] = useState('');

  const submitContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onAddContent({
        platform,
        topic: topic.trim(),
        format,
        publishDate,
        status
      });
      setTopic('');
    }
  };

  // Notes state (localStorage)
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<{ id: string; text: string; createdAt: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('techo_media_notes') || '[]'); } catch { return []; }
  });

  const addNote = () => {
    if (!noteInput.trim()) return;
    const updated = [{ id: `mn_${Date.now()}`, text: noteInput.trim(), createdAt: new Date().toISOString().slice(0, 10) }, ...notes];
    setNotes(updated);
    localStorage.setItem('techo_media_notes', JSON.stringify(updated));
    setNoteInput('');
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('techo_media_notes', JSON.stringify(updated));
  };

  const submitFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (month.trim()) {
      onAddFinance({
        month: month.trim(),
        traffic,
        revenue,
        expense,
        note: note.trim() || '日常核算记录'
      });
      setMonth('2026.06');
      setTraffic(0);
      setRevenue(0.0);
      setExpense(0.0);
      setNote('');
    }
  };

  // Aggregated totals
  const totalRevenue = finance.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalExpense = finance.reduce((acc, curr) => acc + (curr.expense || 0), 0);
  const netEarnings = totalRevenue - totalExpense;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      
      {/* LEFT COLUMN: CONTENT CALENDAR SCHEDULE */}
      <div className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm flex flex-col relative">
        <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4 select-none">
          <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
            <MessageSquareCode size={16} className="text-techo-teal" />
            自媒体副业内容企划时间轴 (Content Grid)
          </h3>
          <span className="text-[10px] text-gray-500 font-bold font-mono">CONTENT DESIGN</span>
        </div>

        {/* Content Plan Creation draft */}
        <form onSubmit={submitContent} className="bg-[#fcfbf7] border border-[#efede5] p-3 rounded-md mb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-gray-500">主发平台 / Platform</label>
              <select 
                value={platform} 
                onChange={e => setPlatform(e.target.value)}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
              >
                <option value="小红书">小红书 Little Red Book</option>
                <option value="Bilibili 视频">哔哩哔哩 Bilibili</option>
                <option value="微信公众号">微信公众号 Wechat</option>
                <option value="X (Twitter)">X / Twitter</option>
                <option value="YouTube/TikTok">YouTube / Shorts</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-500">内容媒介 / Format</label>
              <select 
                value={format} 
                onChange={e => setFormat(e.target.value as any)}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
              >
                <option value="image_text">图文卡片 (Graphic)</option>
                <option value="video">剪辑短视频 (Video)</option>
                <option value="article">深度文章 (Article)</option>
                <option value="other">其它日常 (Other)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[9px] font-bold text-gray-500">写作/视频主题 / Subject</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="例如: 日本国誉手帐无纸化模板的网格极致几何排班..."
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-500">企划日期 / Date</label>
              <input
                type="date"
                value={publishDate}
                onChange={e => setPublishDate(e.target.value)}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-500">发布状态 / Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
              >
                <option value="concept">💡 脑暴选题 (Idea)</option>
                <option value="in_progress">🎬 稿件创作中 (Working)</option>
                <option value="published">🚀 已经全网发布 (Live)</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-1 bg-techo-teal hover:bg-[#3d7a77] text-white text-xs font-bold rounded cursor-pointer transition-colors"
          >
            + 记录此篇自媒体草稿
          </button>
        </form>

        {/* Content list representation */}
        <div className="space-y-2 overflow-y-auto max-h-[290px] pr-1 flex-1">
          {contents.length === 0 ? (
            <p className="text-center italic text-[#9b9485] text-xs py-10">目前没有正在创作的自媒体副业草案。</p>
          ) : (
            contents.map((item) => (
              <div 
                key={item.id} 
                className="border border-[#e5e1d5] bg-[#faf9f4]/50 rounded p-2.5 flex items-start gap-2.5 justify-between relative hover:bg-[#fafaf3]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-[#e09453] bg-orange-50 border border-orange-200/50 px-1 rounded">
                      {item.platform}
                    </span>
                    <span className="text-[9px] text-[#8e8574] bg-[#eae6d8]/60 px-1 rounded">
                      {item.format === 'video' ? '🎬 剪辑视频' : item.format === 'article' ? '📝 文本专栏' : '🎨 图文并茂'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#3c3830] leading-snug truncate">
                    {item.topic}
                  </h4>
                  <div className="flex items-center gap-3 text-[9px] text-[#9b9485] mt-1.5 font-mono">
                    <span className="flex items-center gap-0.5"><CalendarDays size={10} />预计日期: {item.publishDate}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateContentStatus(item.id, e.target.value as any)}
                    className="text-[10px] bg-white border border-[#c2bdae] rounded px-1.5 py-0.5"
                  >
                    <option value="concept">💡 脑暴选题</option>
                    <option value="in_progress">🎬 制作中</option>
                    <option value="published">🚀 已发布</option>
                  </select>

                  <button 
                    onClick={() => onDeleteContent(item.id)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    title="移出企划"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: REVENUE & EXPENSE GRAPH MONIES */}
      <div className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm flex flex-col relative">
        <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4 select-none">
          <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
            <DollarSign size={16} className="text-[#e09453]" />
            金钱计划与指标记账簿 (Financial Metrics Ledger)
          </h3>
          <span className="text-[10px] text-[#e09453] font-bold font-mono">FINANCIAL METRICS</span>
        </div>

        {/* Totals Summary Card */}
        <div className="grid grid-cols-3 gap-2 bg-[#fcfbf8] border border-[#e5dfce] p-2.5 rounded mb-4 text-center">
          <div>
            <span className="text-[9px] text-gray-400 font-bold block">总收益 Total</span>
            <span className="text-xs font-mono font-bold text-emerald-700">￥{totalRevenue.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold block">总支出 Cost</span>
            <span className="text-xs font-mono font-bold text-red-600">￥{totalExpense.toFixed(2)}</span>
          </div>
          <div className="border-l border-[#eae6d8]">
            <span className="text-[9px] text-gray-400 font-bold block">纯结余 Net</span>
            <span className={`text-xs font-mono font-bold ${netEarnings >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
              ￥{netEarnings.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Ledger Entry Form */}
        <form onSubmit={submitFinance} className="bg-[#fcfbf7] border border-[#efede5] p-3 rounded-md mb-4 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="block text-[8px] font-bold text-gray-500">业务月份 / Month</label>
              <input
                type="text"
                value={month}
                onChange={e => setMonth(e.target.value)}
                placeholder="2026.06"
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-gray-500">新增流量 (Views)</label>
              <input
                type="number"
                value={traffic}
                onChange={e => setTraffic(Number(e.target.value))}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-gray-500">月收入 (¥)</label>
              <input
                type="number"
                step="0.01"
                value={revenue}
                onChange={e => setRevenue(Number(e.target.value))}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-gray-500">月投入支出 (¥)</label>
              <input
                type="number"
                step="0.01"
                value={expense}
                onChange={e => setExpense(Number(e.target.value))}
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-[8px] font-bold text-gray-500">收支说明 / Accounting note</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例如: 付费专栏收益 + Cloudflare 域名注册扣费"
                className="w-full bg-white border border-[#c2bdae] p-1 rounded font-sans text-xs"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-1 bg-[#8a816c] hover:bg-[#736a56] text-white text-xs font-bold rounded cursor-pointer transition-colors"
          >
            + 记一笔月度收支账簿
          </button>
        </form>

        {/* Finance list table */}
        <div className="overflow-x-auto select-text flex-1">
          <table className="w-full border-collapse border border-[#e5e1d5] text-[11px] font-sans">
            <thead>
              <tr className="bg-[#f5f3e7] text-[#555] font-semibold text-left border-b border-[#e5e1d5]">
                <th className="p-1.5">月份</th>
                <th className="p-1.5 text-right">流量 views</th>
                <th className="p-1.5 text-right">收入 revenue</th>
                <th className="p-1.5 text-right">支出 expense</th>
                <th className="p-1.5">利润分析和备注</th>
                <th className="p-1.5 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede5] techo-grid-bg">
              {finance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center italic text-gray-400 py-6">月度财务损益明细为空。</td>
                </tr>
              ) : (
                finance.map(f => (
                  <tr key={f.id} className="hover:bg-[#fafaf3] bg-white">
                    <td className="p-1.5 font-mono font-bold text-gray-700">{f.month}</td>
                    <td className="p-1.5 text-right text-indigo-700 font-mono">+{f.traffic}</td>
                    <td className="p-1.5 text-right text-emerald-700 font-mono">￥{f.revenue.toFixed(2)}</td>
                    <td className="p-1.5 text-right text-red-600 font-mono">￥{f.expense.toFixed(2)}</td>
                    <td className="p-1.5 text-gray-500 max-w-[140px] truncate" title={f.note}>{f.note}</td>
                    <td className="p-1.5 text-right shrink-0">
                      <button 
                        onClick={() => onDeleteFinance(f.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTES SECTION */}
      <div className="lg:col-span-2 bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4 select-none">
          <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
            <StickyNote size={16} className="text-purple-500" />
            创作灵感 & 想法便签 (Notes)
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">QUICK NOTES</span>
        </div>
        <div className="flex gap-2 mb-4">
          <textarea
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(); }}
            placeholder="随手记想法、灵感、待研究的方向... (⌘Enter 保存)"
            className="flex-1 bg-[#fdfcf8] border border-[#d3cfc3] rounded-md p-2.5 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-purple-300 font-sans"
          />
          <button
            onClick={addNote}
            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-md cursor-pointer transition-colors shrink-0 self-end"
          >
            <Plus size={14} />
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-center text-xs text-gray-300 py-4">还没有便签，随手记下来吧</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {notes.map(n => (
              <div key={n.id} className="group bg-[#fdfcf4] border border-[#e8e4d8] rounded-md p-3 relative hover:border-purple-200 transition-colors">
                <p className="text-xs text-[#3a3528] leading-relaxed whitespace-pre-wrap pr-4">{n.text}</p>
                <span className="text-[9px] text-gray-300 font-mono mt-1.5 block">{n.createdAt}</span>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
