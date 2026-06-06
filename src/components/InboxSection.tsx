/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Inbox, Plus, Trash2, CheckCircle2, Circle, ExternalLink,
  Tag, Search, Filter
} from 'lucide-react';
import { InboxItem } from '../types';

interface InboxSectionProps {
  items: InboxItem[];
  onAdd: (item: Omit<InboxItem, 'id'>) => void;
  onUpdate: (id: string, fields: Partial<InboxItem>) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_PRESETS = [
  { value: '待研究', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: '教育资源', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: '工具/App', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { value: '课程/认证', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: '书单', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: '项目机会', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: '灵感', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: '其他', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

function getCategoryStyle(cat: string) {
  return CATEGORY_PRESETS.find(c => c.value === cat)?.color
    ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function InboxSection({ items, onAdd, onUpdate, onDelete }: InboxSectionProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('待研究');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterReviewed, setFilterReviewed] = useState<'all' | 'pending' | 'reviewed'>('all');

  const today = new Date().toISOString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      category,
      isReviewed: false,
      createdAt: today,
    });
    setTitle('');
    setUrl('');
    setNotes('');
    setCategory('待研究');
  };

  const filtered = items.filter(item => {
    const matchSearch = !searchTerm
      || item.title.toLowerCase().includes(searchTerm.toLowerCase())
      || (item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchCat = filterCat === 'all' || item.category === filterCat;
    const matchReviewed =
      filterReviewed === 'all'
      || (filterReviewed === 'pending' && !item.isReviewed)
      || (filterReviewed === 'reviewed' && item.isReviewed);
    return matchSearch && matchCat && matchReviewed;
  });

  const pendingCount = items.filter(i => !i.isReviewed).length;

  return (
    <div className="max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white border-2 border-[#d3cfc3] rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-6 -ml-1 select-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#cbd5e1] border border-white shadow-inner" />
          ))}
        </div>
        <div className="pl-4">
          {/* Title row */}
          <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-5">
            <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
              <Inbox size={16} className="text-techo-teal" />
              信息收集箱 (Inbox Clippings)
            </h3>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  {pendingCount} 条待查阅
                </span>
              )}
              <span className="text-[10px] text-gray-400 font-mono hidden sm:block">INBOX</span>
            </div>
          </div>

          {/* Add form */}
          <form onSubmit={handleSubmit} className="bg-amber-50/30 border border-amber-100 rounded-md p-4 mb-5 space-y-3">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <Plus size={12} /> 快速收集
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-1">项目名称 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="如：ICEP HK 教育规划师证书"
                  className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">链接 (可选)</label>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">分类</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {CATEGORY_PRESETS.map(c => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-1">备注 (可选)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="简短说明，稍后再研究..."
                  className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-techo-teal hover:bg-techo-teal/80 text-white text-xs font-bold rounded cursor-pointer transition-colors">
              + 收进来，稍后研究
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 bg-[#f5f3eb] border border-[#d6cfbe] rounded-md px-2 py-1">
              <Search size={11} className="text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className="bg-transparent text-xs outline-none w-24 text-[#444]"
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="bg-[#f5f3eb] border border-[#d6cfbe] rounded-md px-2 py-1 text-xs text-[#555] outline-none cursor-pointer"
            >
              <option value="all">全部分类</option>
              {CATEGORY_PRESETS.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-[#f5f3eb] border border-[#d6cfbe] rounded-md p-0.5 text-xs">
              {(['all', 'pending', 'reviewed'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterReviewed(v)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-semibold ${filterReviewed === v ? 'bg-[#8a816c] text-white' : 'text-[#6e685a] hover:bg-white/60'}`}
                >
                  {v === 'all' ? '全部' : v === 'pending' ? '未查阅' : '已查阅'}
                </button>
              ))}
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                <Inbox size={24} className="mx-auto mb-2 opacity-30" />
                <p>收件箱空空的，随时把感兴趣的项目扔进来</p>
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 bg-white border rounded-md px-3 py-2.5 group transition-all ${item.isReviewed ? 'border-gray-200 opacity-60' : 'border-[#e4decb] hover:border-amber-200 hover:shadow-xs'}`}
                >
                  <button
                    onClick={() => onUpdate(item.id, { isReviewed: !item.isReviewed })}
                    className="mt-0.5 shrink-0 cursor-pointer text-gray-300 hover:text-techo-teal transition-colors"
                    title={item.isReviewed ? '标为未查阅' : '标为已查阅'}
                  >
                    {item.isReviewed ? <CheckCircle2 size={15} className="text-techo-teal" /> : <Circle size={15} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-xs font-semibold ${item.isReviewed ? 'line-through text-gray-400' : 'text-[#3a3528]'}`}>
                        {item.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getCategoryStyle(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-gray-500 leading-snug">{item.notes}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-300 font-mono">
                        {item.createdAt.slice(0, 10)}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-techo-teal hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                        >
                          <ExternalLink size={9} />
                          {item.url.replace(/^https?:\/\//, '').slice(0, 40)}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer p-1 transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
