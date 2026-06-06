/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, BookOpen, Film, Heart, Plus, Trash2, Calendar, Coffee, CheckCircle } from 'lucide-react';
import { HobbyCollectionItem } from '../types';

interface HobbiesProps {
  items: HobbyCollectionItem[];
  onAddItem: (item: Omit<HobbyCollectionItem, 'id'>) => void;
  onUpdateItem: (id: string, updated: Partial<HobbyCollectionItem>) => void;
  onDeleteItem: (id: string) => void;
}

export default function HobbiesSection({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}: HobbiesProps) {
  
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'book' | 'movie' | 'hobby'>('book');
  const [creator, setCreator] = useState('');
  const [lastDate, setLastDate] = useState('2026-06-01');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddItem({
        title: title.trim(),
        type,
        creator: creator.trim() || '未标明',
        lastDate,
        description: description.trim() || '随手记录心得体会...',
        rating
      });
      // reset
      setTitle('');
      setCreator('');
      setDescription('');
      setRating(5);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm font-sans relative">
      <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4">
        <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
          <Heart size={16} className="text-[#e29453]" />
          个人兴趣收藏夹 (书单 & 影单 / Hobbies & Favorites)
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-[#e29453] text-white px-2.5 py-1.5 rounded-md font-semibold hover:bg-[#c97f3e] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          {isAdding ? '收起面板' : '搜集或推荐'}
        </button>
      </div>

      {/* QUICK ADD CARD FORM */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#fcfbf7] border-2 border-[#eae6d8] p-4 rounded-lg mb-5 space-y-3">
          <h4 className="text-xs font-bold text-[#5c564a] pb-1 border-b border-[#eae6d8]">📚 书单 / 影单 / 收藏入账</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">资源类型 / Category</label>
              <div className="flex gap-2">
                {(['book', 'movie', 'hobby'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 text-center py-1 rounded text-xs select-none border cursor-pointer font-semibold ${
                      type === t 
                        ? 'bg-techo-teal text-white border-techo-teal' 
                        : 'bg-white text-[#686355] border-[#d3cebe]'
                    }`}
                  >
                    {t === 'book' ? '📖 书单' : t === 'movie' ? '🎬 影单' : '🎨 兴趣'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">书籍名称 / 作品标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 银翼杀手 2049"
                className="w-full text-xs p-1.5 bg-white border border-[#c2bdae] rounded"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">作者 / 导演 / 流派</label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="例如: 丹尼斯·维伦纽瓦"
                className="w-full text-xs p-1.5 bg-white border border-[#c2bdae] rounded"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">最近品味/练习日期</label>
              <input
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-[#c2bdae] rounded"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">星级评分 / Star Rating</label>
              <div className="flex gap-1 py-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star size={18} fill={rating >= starVal ? 'currentColor' : 'none'} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-[#7d7768] mb-0.5">精美心得 / Notes & Feelings</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="书籍概要或高潮观感, 体验如何..."
                className="w-full text-xs p-2 bg-white border border-[#c2bdae] rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#eae6d8]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs bg-gray-100 px-3 py-1.5 border hover:bg-gray-200 text-gray-700"
            >
              取消
            </button>
            <button
              type="submit"
              className="text-xs bg-[#8a816c] hover:bg-[#736a56] text-white px-4 py-1.5 font-semibold cursor-pointer"
            >
              收入收藏
            </button>
          </div>
        </form>
      )}

      {/* HORIZONTAL SCROLLABLE COLLECTION MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="md:col-span-3 bg-[#faf9f4] rounded-lg p-8 text-center text-[#9b9485] border border-dashed border-[#d2cbba] italic">
            目前还没有搜集和收录任何书单与影单。立即点击右上角新增。
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="group bg-[#fcfbf9] border-2 border-[#dcd8cc] hover:border-[#aaa] shadow-xxs rounded-lg p-4 relative overflow-hidden transition-all duration-200 select-text hover:shadow-xs hover:scale-[1.01] flex flex-col justify-between"
            >
              {/* Top stationery tag layout */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#eae6d8] pb-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-sans tracking-wide ${
                    item.type === 'book' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                    item.type === 'movie' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    'bg-orange-50 text-orange-900 border border-orange-200'
                  }`}>
                    {item.type === 'book' ? '📖 BOOK 书籍' : item.type === 'movie' ? '🎬 MOVIE 电影' : '🎨 CRAFT 兴趣'}
                  </span>
                  
                  {/* Delete Button on hovering */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-0.5 rounded transition-opacity cursor-pointer self-center"
                    title="注销本章"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <h4 className="font-display font-bold text-xs text-[#3b3834] truncate mb-1">
                  {item.title}
                </h4>

                <p className="text-[10px] text-[#8e8574] mb-3 flex items-center gap-1.5">
                  <Coffee size={10} className="shrink-0" />
                  <span className="truncate">{item.creator}</span>
                </p>

                {/* Star rating and dates */}
                <div className="flex items-center justify-between mb-3 bg-white/70 border border-[#f0ede5] p-1.5 rounded text-[10px]">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={10.5} 
                        fill={item.rating >= i + 1 ? 'currentColor' : 'none'} 
                        className="cursor-pointer"
                        onClick={() => onUpdateItem(item.id, { rating: i + 1 })}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 font-mono text-[9px] flex items-center gap-0.5 shrink-0">
                    <Calendar size={9} />
                    {item.lastDate}
                  </span>
                </div>

                {/* Short review notes */}
                <p className="text-[11px] text-[#5c564c] leading-relaxed line-clamp-3 bg-[#faf9f4] p-2 border border-[#f3eee0] rounded font-sans antialiased text-left italic">
                  “ {item.description} ”
                </p>
              </div>

              {/* Dynamic tag modification overlay slider (Just simple clicking to alter stars directly) */}
              <div className="mt-3 text-[9px] text-[#cbd5e1] group-hover:text-[#a19985] duration-150 text-right select-none select-none">
                * 鼠标可直接在星星上按压重定评分
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
