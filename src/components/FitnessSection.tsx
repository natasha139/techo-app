/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Dumbbell, Utensils, Scale, Trash2, Plus,
  TrendingDown, TrendingUp, Minus, Flame, Heart
} from 'lucide-react';
import { FitnessLog, PeriodLog } from '../types';

interface FitnessSectionProps {
  logs: FitnessLog[];
  onAdd: (item: Omit<FitnessLog, 'id'>) => void;
  onDelete: (id: string) => void;
  periodLogs: PeriodLog[];
  onAddPeriod: (date: string) => void;
  onDeletePeriod: (id: string) => void;
}

const EXERCISE_PRESETS = [
  '跑步', '快走', '骑车', '游泳', '瑜伽', '力量训练', '跳绳', 'HIIT', '羽毛球', '其他'
];

type FitnessTab = 'log' | 'weight' | 'meals' | 'period';

export default function FitnessSection({ logs, onAdd, onDelete, periodLogs, onAddPeriod, onDeletePeriod }: FitnessSectionProps) {
  const [activeTab, setActiveTab] = useState<FitnessTab>('log');

  const today = new Date().toISOString().slice(0, 10);

  // Log form
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [exercise, setExercise] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [meals, setMeals] = useState('');
  const [note, setNote] = useState('');

  // Period form
  const [periodDate, setPeriodDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exerciseFinal = exercise === '其他' ? customExercise.trim() : exercise;
    onAdd({
      date,
      weight: weight ? parseFloat(weight) : undefined,
      exercise: exerciseFinal || undefined,
      duration: duration ? parseInt(duration) : undefined,
      calories: calories ? parseInt(calories) : undefined,
      meals: meals.trim() || undefined,
      note: note.trim() || undefined,
    });
    setWeight('');
    setExercise('');
    setCustomExercise('');
    setDuration('');
    setCalories('');
    setMeals('');
    setNote('');
  };

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  // Weight trend data (only logs with weight)
  const weightLogs = sortedLogs.filter(l => l.weight).slice(0, 30).reverse();
  const latestWeight = weightLogs[weightLogs.length - 1]?.weight;
  const prevWeight = weightLogs[weightLogs.length - 2]?.weight;
  const weightDiff = latestWeight && prevWeight ? latestWeight - prevWeight : null;

  const tabs: { key: FitnessTab; label: string; icon: React.ReactNode }[] = [
    { key: 'log', label: '打卡记录', icon: <Dumbbell size={13} /> },
    { key: 'weight', label: '体重趋势', icon: <Scale size={13} /> },
    { key: 'meals', label: '饮食记录', icon: <Utensils size={13} /> },
    { key: 'period', label: '生理期', icon: <Heart size={13} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto font-sans">
      {/* Tab header */}
      <div className="flex justify-between items-end mb-1 select-none px-2">
        <div className="flex gap-1.5">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 border-x flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.key
                  ? 'bg-white border-techo-teal text-techo-teal font-extrabold shadow-xxs pb-2.5 z-10'
                  : 'bg-gray-100/70 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}>
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-400 font-mono hidden sm:block">HEALTH & FITNESS</div>
      </div>

      <div className="bg-white border-2 border-[#d3cfc3] rounded-lg rounded-tl-none p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Punch holes */}
        <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-6 -ml-1 select-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#cbd5e1] border border-white shadow-inner" />
          ))}
        </div>

        <div className="pl-6">
          {activeTab === 'log' && (
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <Dumbbell size={18} className="text-techo-teal" />
                  健康打卡 (Health Log)
                </h3>
                <span className="text-[10px] text-techo-teal font-bold font-mono">DAILY CHECK-IN</span>
              </div>

              <form onSubmit={handleSubmit} className="bg-teal-50/20 border border-teal-100 rounded-md p-4 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-techo-teal flex items-center gap-1">
                  <Plus size={12} /> 新增打卡
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">日期</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">体重 (kg)</label>
                    <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                      placeholder="如 58.5"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">运动类型</label>
                    <select value={exercise} onChange={e => setExercise(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400">
                      <option value="">无运动</option>
                      {EXERCISE_PRESETS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  {exercise === '其他' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">自定义运动</label>
                      <input type="text" value={customExercise} onChange={e => setCustomExercise(e.target.value)}
                        placeholder="运动名称"
                        className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">时长 (分钟)</label>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                      placeholder="如 30"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">消耗热量 (kcal)</label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                      placeholder="如 250"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">今日备注</label>
                    <input type="text" value={note} onChange={e => setNote(e.target.value)}
                      placeholder="身体感受、特别情况..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-2 bg-techo-teal hover:bg-techo-teal/80 text-white text-xs font-bold rounded cursor-pointer transition-colors">
                  + 完成打卡
                </button>
              </form>

              {/* Log list */}
              <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                {sortedLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <Dumbbell size={24} className="mx-auto mb-2 opacity-20" />
                    <p>还没有打卡记录，从今天开始吧</p>
                  </div>
                ) : sortedLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 bg-white border border-[#e8e4da] rounded-md px-3 py-2.5 group hover:border-teal-200 transition-colors">
                    <div className="shrink-0 text-center min-w-[40px]">
                      <div className="text-[10px] font-mono font-bold text-techo-teal">{log.date.slice(5)}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{log.date.slice(0, 4)}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-wrap gap-x-3 gap-y-1 items-center">
                      {log.weight && (
                        <span className="text-[11px] font-bold text-[#3a3528] flex items-center gap-1">
                          <Scale size={10} className="text-techo-teal" />{log.weight} kg
                        </span>
                      )}
                      {log.exercise && (
                        <span className="text-[11px] text-[#524c3e] flex items-center gap-1">
                          <Dumbbell size={10} className="text-techo-teal" />{log.exercise}
                          {log.duration && <span className="text-gray-400">{log.duration}min</span>}
                        </span>
                      )}
                      {log.calories && (
                        <span className="text-[11px] text-orange-600 flex items-center gap-0.5">
                          <Flame size={10} />{log.calories} kcal
                        </span>
                      )}
                      {log.note && <span className="text-[11px] text-gray-500 italic">{log.note}</span>}
                    </div>
                    <button onClick={() => onDelete(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer p-1 transition-all shrink-0">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'weight' && (
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <Scale size={18} className="text-techo-teal" />
                  体重趋势 (Weight Trend)
                </h3>
                {latestWeight && (
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-techo-teal">{latestWeight} kg</span>
                    {weightDiff !== null && (
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${weightDiff < 0 ? 'text-emerald-600' : weightDiff > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {weightDiff < 0 ? <TrendingDown size={12} /> : weightDiff > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
                        {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {weightLogs.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-xs">
                  <Scale size={28} className="mx-auto mb-3 opacity-20" />
                  <p>在打卡记录中填入体重，这里会自动生成趋势图</p>
                </div>
              ) : (
                <div>
                  {/* SVG line chart */}
                  {(() => {
                    const vals = weightLogs.map(l => l.weight!);
                    const minV = Math.min(...vals);
                    const maxV = Math.max(...vals);
                    const range = maxV - minV || 1;
                    const W = 600, H = 140, PAD = { t: 16, b: 28, l: 36, r: 12 };
                    const iW = W - PAD.l - PAD.r;
                    const iH = H - PAD.t - PAD.b;
                    const n = weightLogs.length;
                    const px = (i: number) => PAD.l + (n === 1 ? iW / 2 : (i / (n - 1)) * iW);
                    const py = (v: number) => PAD.t + iH - ((v - minV) / range) * iH;
                    const pts = weightLogs.map((l, i) => `${px(i)},${py(l.weight!)}`);
                    const polyline = pts.join(' ');
                    const areaPath = `M${px(0)},${H - PAD.b} ` +
                      pts.map(p => `L${p}`).join(' ') +
                      ` L${px(n - 1)},${H - PAD.b} Z`;
                    // y-axis labels
                    const yLabels = [minV, (minV + maxV) / 2, maxV];
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
                        <defs>
                          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4caf9a" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4caf9a" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        {/* grid lines */}
                        {yLabels.map((v, i) => (
                          <g key={i}>
                            <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)}
                              stroke="#e8e4da" strokeWidth="1" strokeDasharray="3 3" />
                            <text x={PAD.l - 4} y={py(v) + 3} textAnchor="end"
                              fontSize="8" fill="#a09888" fontFamily="monospace">
                              {v.toFixed(1)}
                            </text>
                          </g>
                        ))}
                        {/* area fill */}
                        <path d={areaPath} fill="url(#wg)" />
                        {/* line */}
                        <polyline points={polyline} fill="none" stroke="#4caf9a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                        {/* dots + date labels */}
                        {weightLogs.map((log, i) => (
                          <g key={log.id}>
                            <circle cx={px(i)} cy={py(log.weight!)} r="3"
                              fill={i === n - 1 ? '#4caf9a' : '#fff'}
                              stroke="#4caf9a" strokeWidth="2" />
                            {(n <= 12 || i % Math.ceil(n / 10) === 0 || i === n - 1) && (
                              <text x={px(i)} y={H - PAD.b + 10} textAnchor="middle"
                                fontSize="7" fill="#a09888" fontFamily="monospace">
                                {log.date.slice(5)}
                              </text>
                            )}
                          </g>
                        ))}
                      </svg>
                    );
                  })()}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: '最新', val: latestWeight?.toFixed(1) + ' kg', color: 'text-techo-teal' },
                      { label: '最低', val: Math.min(...weightLogs.map(l => l.weight!)).toFixed(1) + ' kg', color: 'text-emerald-600' },
                      { label: '最高', val: Math.max(...weightLogs.map(l => l.weight!)).toFixed(1) + ' kg', color: 'text-red-500' },
                    ].map(s => (
                      <div key={s.label} className="bg-[#f9f8f4] border border-[#e8e4da] rounded-md p-3 text-center">
                        <div className="text-[10px] text-gray-400 mb-1">{s.label}</div>
                        <div className={`text-sm font-bold ${s.color}`}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'meals' && (
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <Utensils size={18} className="text-techo-teal" />
                  饮食记录 (Meals)
                </h3>
                <span className="text-[10px] text-techo-teal font-bold font-mono">MEAL DIARY</span>
              </div>

              {/* Quick meal add */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!meals.trim()) return;
                onAdd({ date, meals: meals.trim(), note: note.trim() || undefined });
                setMeals(''); setNote('');
              }} className="bg-orange-50/20 border border-orange-100 rounded-md p-4 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-orange-700 flex items-center gap-1">
                  <Plus size={12} /> 记录今日饮食
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">日期</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">备注</label>
                    <input type="text" value={note} onChange={e => setNote(e.target.value)}
                      placeholder="感受、特别注意..."
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-300" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">饮食内容 *</label>
                    <textarea value={meals} onChange={e => setMeals(e.target.value)}
                      placeholder="早：燕麦粥+鸡蛋&#10;午：米饭+蔬菜+鱼&#10;晚：沙拉+鸡胸肉"
                      className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none h-[70px]"
                      required />
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded cursor-pointer transition-colors">
                  + 保存饮食记录
                </button>
              </form>

              <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                {sortedLogs.filter(l => l.meals).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <Utensils size={24} className="mx-auto mb-2 opacity-20" />
                    <p>还没有饮食记录</p>
                  </div>
                ) : sortedLogs.filter(l => l.meals).map(log => (
                  <div key={log.id} className="flex items-start gap-3 bg-white border border-[#e8e4da] rounded-md px-3 py-2.5 group hover:border-orange-200 transition-colors">
                    <div className="shrink-0 text-center min-w-[40px]">
                      <div className="text-[10px] font-mono font-bold text-orange-500">{log.date.slice(5)}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{log.date.slice(0, 4)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#524c3e] whitespace-pre-wrap leading-relaxed">{log.meals}</p>
                      {log.note && <p className="text-[11px] text-gray-400 italic mt-1">{log.note}</p>}
                    </div>
                    <button onClick={() => onDelete(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer p-1 transition-all shrink-0">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'period' && (
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-6">
                <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                  <Heart size={18} className="text-pink-400" />
                  生理期记录
                </h3>
                <span className="text-[10px] text-pink-400 font-bold font-mono">PERIOD LOG</span>
              </div>
              <form onSubmit={e => { e.preventDefault(); onAddPeriod(periodDate); }}
                className="bg-pink-50/30 border border-pink-100 rounded-md p-4 mb-6 flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">日期</label>
                  <input type="date" value={periodDate} onChange={e => setPeriodDate(e.target.value)}
                    className="w-full bg-white border border-[#c2bdae] p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-300" />
                </div>
                <button type="submit"
                  className="py-2 px-4 bg-pink-400 hover:bg-pink-500 text-white text-xs font-bold rounded cursor-pointer transition-colors whitespace-nowrap">
                  + 记录
                </button>
              </form>
              <div className="divide-y divide-[#eae6d8] overflow-y-auto max-h-[360px]">
                {[...periodLogs].sort((a, b) => b.date.localeCompare(a.date)).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <Heart size={24} className="mx-auto mb-2 opacity-20" />
                    <p>还没有记录</p>
                  </div>
                ) : [...periodLogs].sort((a, b) => b.date.localeCompare(a.date)).map((log, i, arr) => {
                  const prev = arr[i + 1];
                  const cycle = prev ? Math.round((new Date(log.date).getTime() - new Date(prev.date).getTime()) / 86400000) : null;
                  return (
                    <div key={log.id} className="flex items-center gap-3 py-2 px-1 group hover:bg-[#faf9f6]">
                      <span className="text-xs font-mono text-[#3a3528] flex-1">{log.date}</span>
                      {cycle !== null && (
                        <span className="text-[10px] text-gray-400">距上次 {cycle} 天</span>
                      )}
                      <button onClick={() => onDeletePeriod(log.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer p-1 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
