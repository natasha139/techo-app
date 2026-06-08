import React, { useState } from 'react';
import { Bell, Plus, Trash2, Check, Settings } from 'lucide-react';

export interface Reminder {
  id: string;
  title: string;
  date: string;
  advanceDays: number;
  note: string;
  isDone: boolean;
  createdAt: string;
}

interface Props {
  reminders: Reminder[];
  barkUrl: string;
  onAdd: (r: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveBarkUrl: (url: string) => void;
}

export default function RemindersSection({ reminders, barkUrl, onAdd, onToggle, onDelete, onSaveBarkUrl }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [barkInput, setBarkInput] = useState(barkUrl);
  const [form, setForm] = useState({ title: '', date: '', advanceDays: 1, note: '' });

  const today = new Date().toISOString().split('T')[0];

  const pending = reminders.filter(r => !r.isDone && r.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = reminders.filter(r => r.isDone || r.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return;
    onAdd({ title: form.title.trim(), date: form.date, advanceDays: form.advanceDays, note: form.note.trim(), isDone: false });
    setForm({ title: '', date: '', advanceDays: 1, note: '' });
    setShowForm(false);
  };

  const daysUntil = (date: string) => Math.round((new Date(date).getTime() - new Date(today).getTime()) / 86400000);

  const badge = (date: string, isDone: boolean) => {
    if (isDone) return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">已完成</span>;
    const d = daysUntil(date);
    if (d < 0) return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">已过期</span>;
    if (d === 0) return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold animate-pulse">今天</span>;
    if (d === 1) return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">明天</span>;
    return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{d}天后</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#8a816c]" />
          <h2 className="font-extrabold text-sm text-[#3c3830]">计划提醒</h2>
          {pending.length > 0 && (
            <span className="text-[9px] font-bold bg-[#8a816c] text-white px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-[#eae6d8] text-[#8e8574] transition-colors"
            title="Bark 推送设置"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#8a816c] hover:bg-[#7a7260] text-white rounded font-bold transition-colors"
          >
            <Plus size={12} /> 新增提醒
          </button>
        </div>
      </div>

      {/* Bark Settings */}
      {showSettings && (
        <div className="bg-[#f5f3eb] border border-[#d6cfbe] rounded-lg p-3 space-y-2">
          <p className="text-[11px] font-bold text-[#6e685a]">Bark 推送 URL</p>
          <p className="text-[10px] text-[#8e8574]">打开 Bark app → 点击设备 → 复制推送链接（格式：https://api.day.app/xxxxxxxx）</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={barkInput}
              onChange={e => setBarkInput(e.target.value)}
              placeholder="https://api.day.app/xxxxxxxx"
              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-[#d6cfbe] rounded focus:outline-none focus:ring-1 focus:ring-[#8a816c]/40 text-[#3c3830] font-mono"
            />
            <button
              onClick={() => { onSaveBarkUrl(barkInput.trim()); setShowSettings(false); }}
              className="text-xs px-3 py-1.5 bg-[#4b8f8c] hover:bg-[#3d7a77] text-white rounded font-bold transition-colors"
            >
              保存
            </button>
          </div>
          {barkUrl && <p className="text-[10px] text-emerald-600 font-medium">✓ 已配置，Cron 每天早上 8:00 北京时间推送</p>}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white border border-[#d6cfbe] rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#6e685a]">提醒标题</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="如：复诊体检、续保、缴费..."
                className="w-full text-xs px-2.5 py-1.5 bg-[#fbfaf5] border border-[#d6cfbe] rounded focus:outline-none focus:ring-1 focus:ring-[#8a816c]/40 text-[#3c3830]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6e685a]">事件日期</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full text-xs px-2.5 py-1.5 bg-[#fbfaf5] border border-[#d6cfbe] rounded focus:outline-none focus:ring-1 focus:ring-[#8a816c]/40 text-[#3c3830]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6e685a]">提前提醒（天）</label>
              <select
                value={form.advanceDays}
                onChange={e => setForm(f => ({ ...f, advanceDays: Number(e.target.value) }))}
                className="w-full text-xs px-2.5 py-1.5 bg-[#fbfaf5] border border-[#d6cfbe] rounded focus:outline-none focus:ring-1 focus:ring-[#8a816c]/40 text-[#3c3830]"
              >
                <option value={1}>提前 1 天</option>
                <option value={2}>提前 2 天</option>
                <option value={3}>提前 3 天</option>
                <option value={7}>提前 1 周</option>
                <option value={14}>提前 2 周</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#6e685a]">备注（可选）</label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="地点、注意事项..."
                className="w-full text-xs px-2.5 py-1.5 bg-[#fbfaf5] border border-[#d6cfbe] rounded focus:outline-none focus:ring-1 focus:ring-[#8a816c]/40 text-[#3c3830]"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 border border-[#d6cfbe] rounded text-[#6e685a] hover:bg-[#f5f3eb] transition-colors">取消</button>
            <button onClick={handleAdd} className="text-xs px-3 py-1.5 bg-[#8a816c] hover:bg-[#7a7260] text-white rounded font-bold transition-colors">添加</button>
          </div>
        </div>
      )}

      {/* Pending list */}
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map(r => (
            <div key={r.id} className="bg-white border border-[#d6cfbe] rounded-lg px-3 py-2.5 flex items-center gap-3">
              <button onClick={() => onToggle(r.id)} className="shrink-0 w-5 h-5 rounded-full border-2 border-[#8a816c] hover:bg-[#8a816c]/10 transition-colors flex items-center justify-center" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3c3830]">{r.title}</span>
                  {badge(r.date, r.isDone)}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-[#8e8574]">{r.date}</span>
                  <span className="text-[10px] text-[#b0a890]">提前{r.advanceDays}天提醒</span>
                  {r.note && <span className="text-[10px] text-[#6e685a] truncate">{r.note}</span>}
                </div>
              </div>
              <button onClick={() => onDelete(r.id)} className="shrink-0 p-1 rounded hover:bg-red-50 text-[#c5bfb0] hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {pending.length === 0 && !showForm && (
        <div className="text-center py-8 text-[#b0a890] text-xs">
          <Bell size={24} className="mx-auto mb-2 opacity-30" />
          <p>暂无待办提醒</p>
          <p className="text-[10px] mt-1">添加看医生、缴费、续保等重要日程</p>
        </div>
      )}

      {/* Done / past */}
      {past.length > 0 && (
        <details className="group">
          <summary className="text-[11px] text-[#8e8574] font-bold cursor-pointer hover:text-[#3c3830] select-none py-1 list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            已完成 / 已过期（{past.length}）
          </summary>
          <div className="mt-2 space-y-1.5">
            {past.map(r => (
              <div key={r.id} className="bg-[#fafaf5] border border-[#e8e4da] rounded-lg px-3 py-2 flex items-center gap-3 opacity-60">
                <div className="shrink-0 w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center">
                  <Check size={10} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#3c3830] line-through">{r.title}</span>
                    {badge(r.date, r.isDone)}
                  </div>
                  <span className="text-[10px] text-[#8e8574]">{r.date}</span>
                </div>
                <button onClick={() => onDelete(r.id)} className="shrink-0 p-1 rounded hover:bg-red-50 text-[#c5bfb0] hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
