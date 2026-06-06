/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trash2,
  CalendarHeart,
  Sparkles,
  BookOpen,
  Ruler,
  Scale,
  Clock,
  Heart,
  PlusCircle,
  FileText,
  ClipboardList,
  Library,
  Star,
  ExternalLink
} from 'lucide-react';
import { ChildMilestone, ChildDiary, ChildDailyLog, ParentingResource } from '../types';

interface ParentingProps {
  milestones: ChildMilestone[];
  onAddMilestone: (m: Omit<ChildMilestone, 'id'>) => void;
  onDeleteMilestone: (id: string) => void;
  diaries: ChildDiary[];
  onAddDiary: (d: Omit<ChildDiary, 'id'>) => void;
  onDeleteDiary: (id: string) => void;
  childLogs: ChildDailyLog[];
  onAddChildLog: (l: Omit<ChildDailyLog, 'id'>) => void;
  onDeleteChildLog: (id: string) => void;
  resources: ParentingResource[];
  onAddResource: (r: Omit<ParentingResource, 'id'>) => void;
  onDeleteResource: (id: string) => void;
}

const moodPresets = [
  '😊 开心配合',
  '😴 疲惫安静',
  '🏃 活力十足',
  '🤔 好奇探索',
  '😤 情绪波动',
  '🤒 身体不适'
];

const RESOURCE_TYPES = [
  { value: 'app', label: 'App', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'book', label: '书籍', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'course', label: '课程', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'website', label: '网站', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { value: 'tool', label: '工具', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

function getResourceTypeStyle(type: string) {
  return RESOURCE_TYPES.find(t => t.value === type)?.color ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function ParentingSection({
  milestones,
  onAddMilestone,
  onDeleteMilestone,
  diaries = [],
  onAddDiary,
  onDeleteDiary,
  childLogs = [],
  onAddChildLog,
  onDeleteChildLog,
  resources = [],
  onAddResource,
  onDeleteResource,
}: ParentingProps) {

  const [subTab, setSubTab] = useState<'milestones' | 'diaries' | 'logs' | 'resources'>('milestones');

  // Milestone input states
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('2026-06-04');
  const [mNotes, setMNotes] = useState('');

  // Baby Diary input states
  const [dTitle, setDTitle] = useState('');
  const [dDate, setDDate] = useState('2026-06-04');
  const [dContent, setDContent] = useState('');
  const [dMood, setDMood] = useState('🥰 乖巧可爱');
  const [dHeight, setDHeight] = useState('');
  const [dWeight, setDWeight] = useState('');

  // Daily log input states
  const [lTime, setLTime] = useState('08:00');
  const [lType, setLType] = useState<ChildDailyLog['type']>('notes');
  const [lSpec, setLSpec] = useState('');
  const [lNotes, setLNotes] = useState('');

  // Resource input states
  const [rName, setRName] = useState('');
  const [rType, setRType] = useState<ParentingResource['type']>('app');
  const [rSubject, setRSubject] = useState('');
  const [rAgeRange, setRAgeRange] = useState('7-10岁');
  const [rRating, setRRating] = useState(0);
  const [rNotes, setRNotes] = useState('');
  const [rUrl, setRUrl] = useState('');

  const submitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim()) return;
    onAddResource({ name: rName.trim(), type: rType, subject: rSubject.trim() || undefined, ageRange: rAgeRange.trim() || undefined, rating: rRating, notes: rNotes.trim() || undefined, url: rUrl.trim() || undefined });
    setRName(''); setRSubject(''); setRNotes(''); setRUrl(''); setRRating(0);
  };

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (lNotes.trim()) {
      onAddChildLog({ time: lTime, type: lType, spec: lSpec.trim(), notes: lNotes.trim() });
      setLNotes('');
      setLSpec('');
    }
  };

  const submitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (mTitle.trim()) {
      onAddMilestone({
        title: mTitle.trim(),
        date: mDate,
        notes: mNotes.trim() || '宝宝真棒，继续加油！'
      });
      setMTitle('');
      setMNotes('');
    }
  };

  const submitDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (dTitle.trim() && dContent.trim()) {
      onAddDiary({
        title: dTitle.trim(),
        date: dDate,
        content: dContent.trim(),
        mood: dMood,
        height: dHeight.trim() || undefined,
        weight: dWeight.trim() || undefined
      });
      setDTitle('');
      setDContent('');
      setDHeight('');
      setDWeight('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-sans">
      {/* Visual Tab Switcher: Kokuyo Techo indexing style */}
      <div className="flex justify-between items-end mb-1 select-none px-2 shrink-0">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSubTab('milestones')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 border-x flex items-center gap-1.5 cursor-pointer ${
              subTab === 'milestones'
                ? 'bg-white border-techo-pink text-techo-pink font-extrabold shadow-xxs pb-2.5 z-10'
                : 'bg-gray-100/70 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Sparkles size={13} />
            <span>成长里程碑</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('diaries')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 border-x flex items-center gap-1.5 cursor-pointer ${
              subTab === 'diaries'
                ? 'bg-white border-techo-pink text-techo-pink font-extrabold shadow-xxs pb-2.5 z-10'
                : 'bg-gray-100/70 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <BookOpen size={13} />
            <span>亲子日记</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('logs')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 border-x flex items-center gap-1.5 cursor-pointer ${
              subTab === 'logs'
                ? 'bg-white border-techo-pink text-techo-pink font-extrabold shadow-xxs pb-2.5 z-10'
                : 'bg-gray-100/70 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <ClipboardList size={13} />
            <span>日常记录</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('resources')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 border-x flex items-center gap-1.5 cursor-pointer ${
              subTab === 'resources'
                ? 'bg-white border-techo-pink text-techo-pink font-extrabold shadow-xxs pb-2.5 z-10'
                : 'bg-gray-100/70 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Library size={13} />
            <span>学习资源库</span>
          </button>
        </div>
        <div className="text-[10px] text-gray-400 font-mono hidden sm:block">KOKUYO TECHO PARENTING</div>
      </div>

      <div className="bg-white border-2 border-[#d3cfc3] rounded-lg rounded-tl-none p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
        {/* Subtle decorative spiral punch holes */}
        <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-6 -ml-1 select-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#cbd5e1] border border-white shadow-inner" />
          ))}
        </div>

        <div className="pl-6 flex flex-col h-full flex-1">
          {subTab === 'milestones' ? (
            <div className="animate-fade-in flex flex-col h-full flex-1">
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6 select-none">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <CalendarHeart size={18} className="text-techo-pink" />
                  儿童成长重大里程碑 (Child Milestones)
                </h3>
                <span className="text-[10px] text-techo-pink font-bold font-mono">MEMORIAL STAMPS</span>
              </div>

              {/* Quick Add Milestone Form */}
              <form onSubmit={submitMilestone} className="bg-pink-50/20 border border-pink-100 p-4 rounded-md mb-6 space-y-3">
                <h4 className="text-xs font-bold text-techo-pink flex items-center gap-1">
                  <PlusCircle size={13} />
                  刻录宝宝高能里程碑
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">重大事件名称 (Milestone Title)</label>
                    <input
                      type="text"
                      value={mTitle}
                      onChange={e => setMTitle(e.target.value)}
                      placeholder="例如: 第一次开口清晰喊出爸爸"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">记录日期 (Date)</label>
                    <input
                      type="date"
                      value={mDate}
                      onChange={e => setMDate(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">心得体会与详细细节 (Notes)</label>
                    <input
                      type="text"
                      value={mNotes}
                      onChange={e => setMNotes(e.target.value)}
                      placeholder="挥舞着勺子对着爸爸大笑，爸爸顿时眼圈有些红啦..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 bg-techo-pink hover:bg-[#bd6372] text-white text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  + 新增成长里程碑
                </button>
              </form>

              {/* Milestone timeline list */}
              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1 flex-1">
                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="italic text-gray-400 text-xs">目前还没有录入成长里程碑。</p>
                    <p className="text-[10px] text-gray-300 mt-1">记录下宝宝的每一次发声、第一次翻身、第一次站立吧！</p>
                  </div>
                ) : (
                  milestones.map((item) => (
                    <div 
                      key={item.id} 
                      className="border-l-2 border-pink-200 pl-5 ml-3.5 relative group pb-2 font-sans"
                    >
                      {/* Decorative dot anchor */}
                      <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-techo-pink border-2 border-white ring-2 ring-pink-100 select-none" />
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="select-text">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-[#3c3830]">{item.title}</span>
                            <span className="text-[9px] font-mono text-techo-pink bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100 shrink-0">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 italic mt-0.5 leading-relaxed">
                            “ {item.notes} ”
                          </p>
                        </div>

                        <button 
                          onClick={() => onDeleteMilestone(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-all"
                          title="注销里程碑"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col h-full flex-1">
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6 select-none">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <FileText size={18} className="text-techo-pink" />
                  暖心育儿日记手账 (Baby Diaries & Memories)
                </h3>
                <span className="text-[10px] text-techo-pink font-bold font-mono">SWEET MEMORIES</span>
              </div>

              {/* Quick Add Diary Note Form */}
              <form onSubmit={submitDiary} className="bg-pink-50/10 border border-dashed border-[#e4decb]/80 p-4 rounded-md mb-6 space-y-3">
                <h4 className="text-xs font-bold text-techo-pink flex items-center gap-1.5">
                  <Heart size={13} className="fill-techo-pink" />
                  撰写新一页育儿日记
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">今日成长日记标题 (Diary Title)</label>
                    <input
                      type="text"
                      value={dTitle}
                      onChange={e => setDTitle(e.target.value)}
                      placeholder="如：带宝贝体验初夏草地野餐"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">记录日期 (Date)</label>
                    <input
                      type="date"
                      value={dDate}
                      onChange={e => setDDate(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">宝宝状态/心情 (Baby Mood)</label>
                    <select
                      value={dMood}
                      onChange={e => setDMood(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                    >
                      {moodPresets.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">身高 / Height (可选)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dHeight}
                        onChange={e => setDHeight(e.target.value)}
                        placeholder="例如: 75.2"
                        className="w-full bg-white border border-[#c2bdae] py-2 pl-2 pr-7 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                      />
                      <span className="absolute right-2 top-2 text-[9px] text-gray-400 font-bold">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">体重 / Weight (可选)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dWeight}
                        onChange={e => setDWeight(e.target.value)}
                        placeholder="例如: 10.3"
                        className="w-full bg-white border border-[#c2bdae] py-2 pl-2 pr-7 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                      />
                      <span className="absolute right-2 top-2 text-[9px] text-gray-400 font-bold">kg</span>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">日记暖心正文 (Content Description)</label>
                    <textarea
                      value={dContent}
                      onChange={e => setDContent(e.target.value)}
                      placeholder="书写关于宝宝今天的故事，成长点滴，好玩的小日常段子..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded font-sans text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 min-h-[70px] resize-y"
                      required
                    ></textarea>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 bg-techo-pink hover:bg-[#bd6372] text-white text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  + 刻录本篇日记
                </button>
              </form>

              {/* Diaries list - Kokuyo stationery style design */}
              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1 flex-1">
                {diaries.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded border-2 border-dashed border-gray-200">
                    <p className="italic text-gray-400 text-xs text-center">目前还没有撰写的育儿成长日记。</p>
                    <p className="text-[10px] text-gray-300 mt-1 text-center">用随手笔记，记录下宝宝每一天的成长感动和纯真欢笑吧！</p>
                  </div>
                ) : (
                  diaries.map((diary) => (
                    <div 
                      key={diary.id}
                      className="bg-[#fffdf7] border border-[#e2dec9] rounded-md p-4 shadow-xxs relative group hover:shadow-xs transition-shadow duration-150"
                    >
                      {/* Grid lined texture mock decoration */}
                      <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-r from-transparent to-[#f5f2df]/20" />
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 select-text">
                          {/* Heading row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-extrabold text-[#3a3528]">{diary.title}</span>
                            <span className="text-[9px] font-mono text-[#7d7159] bg-[#ebd8bb]/30 px-1.5 py-0.5 rounded border border-[#dacbae]/30">
                              📅 {diary.date}
                            </span>
                            <span className="text-[9.5px] bg-[#f9ebe1] text-amber-900 border border-[#edd7c2] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              {diary.mood}
                            </span>
                          </div>

                          {/* Stat indicators if present */}
                          {(diary.height || diary.weight) && (
                            <div className="flex gap-3 mb-2.5 text-[10px] text-gray-500 font-mono">
                              {diary.height && (
                                <span className="flex items-center gap-1 bg-gray-100/70 border border-gray-200 px-1.5 py-0.5 rounded">
                                  <Ruler size={10} className="text-gray-400" />
                                  <span>身高: {diary.height.endsWith('cm') ? diary.height : `${diary.height} cm`}</span>
                                </span>
                              )}
                              {diary.weight && (
                                <span className="flex items-center gap-1 bg-gray-100/70 border border-gray-200 px-1.5 py-0.5 rounded">
                                  <Scale size={10} className="text-gray-400" />
                                  <span>体重: {diary.weight.endsWith('kg') ? diary.weight : `${diary.weight} kg`}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Main diary content in simulated beautiful notebook lines */}
                          <p className="text-xs text-[#524c3e] leading-relaxed break-all bg-dashed-lines pl-1">
                            {diary.content}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteDiary(diary.id)}
                          className="text-[#968e7d] hover:text-red-500 transition-colors duration-150 p-1 rounded opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                          title="删除本日成长日记"
                        >
                          <Trash2 size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {subTab === 'resources' && (
            <div className="animate-fade-in flex flex-col h-full flex-1">
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6 select-none">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <Library size={18} className="text-techo-pink" />
                  学习资源库 (Learning Resources)
                </h3>
                <span className="text-[10px] text-techo-pink font-bold font-mono">RESOURCE LIBRARY</span>
              </div>

              <form onSubmit={submitResource} className="bg-pink-50/20 border border-pink-100 p-4 rounded-md mb-6 space-y-3">
                <h4 className="text-xs font-bold text-techo-pink flex items-center gap-1">
                  <PlusCircle size={13} /> 添加学习资源
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">资源名称 *</label>
                    <input type="text" value={rName} onChange={e => setRName(e.target.value)}
                      placeholder="如：可汗学院 Khan Academy"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">类型</label>
                    <select value={rType} onChange={e => setRType(e.target.value as ParentingResource['type'])}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400">
                      {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">科目/领域</label>
                    <input type="text" value={rSubject} onChange={e => setRSubject(e.target.value)}
                      placeholder="如：数学、英语、编程"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">适用年龄</label>
                    <input type="text" value={rAgeRange} onChange={e => setRAgeRange(e.target.value)}
                      placeholder="如：7-10岁"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">评分</label>
                    <div className="flex gap-1 pt-1">
                      {[1,2,3,4,5].map(s => (
                        <button type="button" key={s} onClick={() => setRRating(s)}
                          className={`text-base cursor-pointer transition-opacity ${s <= rRating ? 'opacity-100' : 'opacity-25'}`}>
                          <Star size={14} className={s <= rRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">链接（可选）</label>
                    <input type="text" value={rUrl} onChange={e => setRUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">备注（可选）</label>
                    <input type="text" value={rNotes} onChange={e => setRNotes(e.target.value)}
                      placeholder="使用感受、推荐理由..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-2 bg-techo-pink hover:bg-[#bd6372] text-white text-xs font-bold rounded cursor-pointer transition-colors">
                  + 添加到资源库
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
                {resources.length === 0 ? (
                  <div className="sm:col-span-2 text-center py-12">
                    <Library size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="italic text-gray-400 text-xs">还没有添加学习资源</p>
                  </div>
                ) : resources.map(r => (
                  <div key={r.id} className="bg-white border border-[#e8e4da] rounded-md p-3 group hover:border-pink-200 transition-colors relative">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#3a3528]">{r.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getResourceTypeStyle(r.type)}`}>
                          {RESOURCE_TYPES.find(t => t.value === r.type)?.label}
                        </span>
                      </div>
                      <button onClick={() => onDeleteResource(r.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 cursor-pointer p-0.5 transition-all shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      {r.subject && <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{r.subject}</span>}
                      {r.ageRange && <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{r.ageRange}</span>}
                      {r.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={10} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                          ))}
                        </span>
                      )}
                    </div>
                    {r.notes && <p className="text-[11px] text-gray-500 leading-snug mb-1">{r.notes}</p>}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-techo-teal hover:underline flex items-center gap-0.5 truncate">
                        <ExternalLink size={9} />
                        {r.url.replace(/^https?:\/\//, '').slice(0, 40)}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === 'logs' && (
            <div className="animate-fade-in flex flex-col h-full flex-1">
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6 select-none">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <ClipboardList size={18} className="text-techo-pink" />
                  宝宝每日生活记录 (Daily Log)
                </h3>
                <span className="text-[10px] text-techo-pink font-bold font-mono">DAILY TRACKER</span>
              </div>

              <form onSubmit={submitLog} className="bg-pink-50/20 border border-pink-100 p-4 rounded-md mb-6 space-y-3">
                <h4 className="text-xs font-bold text-techo-pink flex items-center gap-1">
                  <PlusCircle size={13} /> 新增记录
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">时间</label>
                    <input type="time" value={lTime} onChange={e => setLTime(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">类型</label>
                    <select value={lType} onChange={e => setLType(e.target.value as ChildDailyLog['type'])}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400">
                    <option value="feeding">🍱 饮食</option>
                      <option value="sleep">😴 睡眠</option>
                      <option value="activity">📚 学习/活动</option>
                      <option value="notes">📝 备注</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">规格（可选）</label>
                    <input type="text" value={lSpec} onChange={e => setLSpec(e.target.value)}
                      placeholder="如: 150ml / 2h"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">备注</label>
                    <input type="text" value={lNotes} onChange={e => setLNotes(e.target.value)}
                      placeholder="简短描述..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                      required />
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-2 bg-techo-pink hover:bg-[#bd6372] text-white text-xs font-bold rounded cursor-pointer transition-colors">
                  + 记录
                </button>
              </form>

              <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1">
                {childLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="italic text-gray-400 text-xs">暂无每日记录</p>
                  </div>
                ) : (
                  childLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 bg-white border border-[#e8e4da] rounded-md px-3 py-2 group hover:border-pink-200 transition-colors">
                      <span className="font-mono text-[11px] text-[#8a816c] shrink-0 pt-0.5">{log.time}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-techo-pink mr-2">{
                          log.type === 'feeding' ? '🍱 饮食' :
                          log.type === 'sleep' ? '😴 睡眠' :
                          log.type === 'activity' ? '📚 学习/活动' : '📝 备注'
                        }</span>
                        {log.spec && <span className="text-[10px] text-gray-400 mr-2">[{log.spec}]</span>}
                        <span className="text-xs text-[#524c3e]">{log.notes}</span>
                      </div>
                      <button onClick={() => onDeleteChildLog(log.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-all shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
