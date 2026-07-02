import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PlannerCell } from '../types';

type Goal = { id: string; text: string; done: boolean; scope: 'week' | 'month' };

interface BabyTechoGridProps {
  cells: PlannerCell[];
  onSaveCell: (dayIndex: number, hour: number, text: string, color: string) => void;
  onClearCell: (dayIndex: number, hour: number) => void;
  todayNotes: { [dayIndex: number]: string };
  onSaveTodayNote: (dayIndex: number, text: string) => void;
  childName?: string;
  weekOffset?: number;
  childGoals?: Goal[];
  onAddChildGoal?: (goal: Omit<Goal, 'id'>) => void;
  onToggleChildGoal?: (id: string) => void;
  onDeleteChildGoal?: (id: string) => void;
  onEditChildGoal?: (id: string, text: string) => void;
}

const colorPresets = [
  { label: '作息/睡眠', bg: '#f0fdfa', border: '#99f6e4', textClass: 'text-teal-900' },
  { label: '饮食/喂奶', bg: '#fff7ed', border: '#fed7aa', textClass: 'text-orange-900' },
  { label: '玩耍/活动', bg: '#fdf2f8', border: '#fbcfe8', textClass: 'text-pink-900' },
  { label: '学习', bg: '#f0fdf4', border: '#86efac', textClass: 'text-green-900' },
  { label: '网课', bg: '#eff6ff', border: '#bfdbfe', textClass: 'text-blue-900' },
  { label: '就医/健康', bg: '#faf5ff', border: '#e9d5ff', textClass: 'text-purple-900' },
  { label: '其他', bg: '#fffbeb', border: '#fef3c7', textClass: 'text-amber-900' },
];

function getCurrentWeekDays(weekOffset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const isToday = d.toDateString() === today.toDateString();
    return {
      text: weekNames[i],
      dateStr: `${month}.${date}`,
      isToday,
    };
  });
}

function buildPrintHtml(
  cells: PlannerCell[],
  notes: { [k: number]: string },
  days: { text: string; dateStr: string; isToday: boolean }[],
  childName: string,
  monthStr: string
): string {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const colorMap: Record<string, string> = {
    '#f0fdfa': '#99f6e4',
    '#fff7ed': '#fed7aa',
    '#fdf2f8': '#fbcfe8',
    '#eff6ff': '#bfdbfe',
    '#faf5ff': '#e9d5ff',
    '#fffbeb': '#fef3c7',
  };

  const dayHeaders = days.map(d =>
    `<th style="width:12%;padding:4px 2px;font-size:10px;font-weight:700;text-align:center;background:${d.isToday ? '#fce7f3' : '#fdf6f0'};border:1px solid #eae6d8;">
      <div>${d.text}</div><div style="font-size:8px;color:#8c8577;">${d.dateStr}</div>
    </th>`
  ).join('');

  const rows = hours.map(hour => {
    const hourLabel = `<td style="width:4%;text-align:center;font-size:9px;font-weight:700;color:${hour >= 6 && hour <= 21 ? '#8c8577' : '#c4c0b8'};border:1px solid #eae6d8;padding:1px;">${String(hour).padStart(2, '0')}</td>`;
    const dayCells = days.map((_, dayIdx) => {
      const cell = cells.find(c => c.id.endsWith(`-${dayIdx}-${hour}`));
      const bg = cell ? cell.color : 'transparent';
      const borderLeft = cell ? `3px solid ${colorMap[cell.color] || '#fbcfe8'}` : '1px solid #eae6d8';
      const text = cell ? `<span style="font-size:9px;font-weight:500;color:#3c3830;">${cell.text}</span>` : '';
      return `<td style="width:12%;height:28px;background:${bg};border:1px solid #eae6d8;border-left:${borderLeft};padding:1px 2px;vertical-align:top;">${text}</td>`;
    }).join('');
    return `<tr>${hourLabel}${dayCells}</tr>`;
  }).join('');

  const notesCells = days.map((_, idx) => {
    const note = notes[idx] || '';
    return `<td style="width:12%;vertical-align:top;padding:4px;border:1px solid #eae6d8;font-size:9px;color:#524c3e;white-space:pre-wrap;">${note}</td>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>${childName}周计划 - ${monthStr}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; background: white; }
  h1 { font-size: 13px; color: #c06080; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<h1>🌱 ${childName}的周计划 &nbsp;<span style="font-size:10px;color:#8c8577;font-weight:400;">${monthStr}</span></h1>
<table>
  <thead>
    <tr>
      <th style="width:4%;padding:4px 2px;font-size:9px;font-weight:700;text-align:center;background:#fdf6f0;border:1px solid #eae6d8;">时间</th>
      ${dayHeaders}
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr>
      <td style="width:4%;text-align:center;font-size:9px;font-weight:700;color:#8c8577;border:1px solid #eae6d8;padding:2px;background:#fdf6f0;">备注</td>
      ${notesCells}
    </tr>
  </tbody>
</table>
</body>
</html>`;
}

export default function BabyTechoGrid({
  cells,
  onSaveCell,
  onClearCell,
  todayNotes,
  onSaveTodayNote,
  childName = '小树',
  weekOffset = 0,
  childGoals = [],
  onAddChildGoal,
  onToggleChildGoal,
  onDeleteChildGoal,
  onEditChildGoal,
}: BabyTechoGridProps) {
  const daysOfWeek = getCurrentWeekDays(weekOffset);
  const today = new Date();
  const hours = Array.from({ length: 24 }).map((_, i) => i);
  const monthStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  const hourScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTop = 240;
    }
  }, []);

  const [renderedCells, setRenderedCells] = useState<PlannerCell[]>(cells);
  const [renderedNotes, setRenderedNotes] = useState<{ [k: number]: string }>(todayNotes);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRenderedCells(cells));
    return () => cancelAnimationFrame(id);
  }, [cells]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRenderedNotes(todayNotes));
    return () => cancelAnimationFrame(id);
  }, [todayNotes]);

  const [editingSlot, setEditingSlot] = useState<{ dayIndex: number; hour: number } | null>(null);
  const [editText, setEditText] = useState('');
  const [editColorIdx, setEditColorIdx] = useState(0);

  const openCell = (dayIdx: number, hour: number) => {
    const existing = renderedCells.find(c => c.id.endsWith(`-${dayIdx}-${hour}`));
    setEditText(existing?.text || '');
    setEditColorIdx(existing?.color ? colorPresets.findIndex(cp => cp.bg === existing.color) : 0);
    setEditingSlot({ dayIndex: dayIdx, hour });
  };

  const saveCell = () => {
    if (!editingSlot) return;
    if (editText.trim()) {
      onSaveCell(editingSlot.dayIndex, editingSlot.hour, editText.trim(), colorPresets[editColorIdx >= 0 ? editColorIdx : 0].bg);
    } else {
      onClearCell(editingSlot.dayIndex, editingSlot.hour);
    }
    setEditingSlot(null);
    setEditText('');
  };

  const [editingNoteDay, setEditingNoteDay] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  // Goals state
  const [goalScope, setGoalScope] = useState<'week' | 'month'>('week');
  const [goalInput, setGoalInput] = useState('');
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');

  const confirmEditGoal = (id: string) => {
    if (editingGoalText.trim()) onEditChildGoal?.(id, editingGoalText.trim());
    setEditingGoalId(null);
    setEditingGoalText('');
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    onAddChildGoal?.({ text: goalInput.trim(), done: false, scope: goalScope });
    setGoalInput('');
  };
  const toggleGoal = (id: string) => onToggleChildGoal?.(id);
  const deleteGoal = (id: string) => onDeleteChildGoal?.(id);

  const startEditNote = (idx: number) => {
    setNoteText(renderedNotes[idx] || '');
    setEditingNoteDay(idx);
  };

  const saveNote = () => {
    if (editingNoteDay === null) return;
    onSaveTodayNote(editingNoteDay, noteText);
    setEditingNoteDay(null);
  };

  const handlePrint = () => {
    const el = document.getElementById('baby-print-target');
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.id = '__baby_print_clone__';
    clone.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:white;z-index:99999;';
    document.body.appendChild(clone);
    document.body.classList.add('printing-baby');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-baby');
      clone.remove();
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-0" id="baby-print-target">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#fdf2f8] border border-pink-200 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-base">🌱</span>
          <div>
            <span className="font-display font-extrabold text-sm text-[#c06080]">{childName}的周计划</span>
            <span className="ml-2 text-[10px] text-[#c06080]/70 font-mono">{monthStr}</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-pink-200 text-[#c06080] rounded hover:bg-pink-50 cursor-pointer transition-colors"
        >
          <Printer size={13} />
          打印 / 导出 PDF
        </button>
      </div>

      {/* Goals Panel */}
      <div className="no-print border border-t-0 border-pink-200 bg-[#fffbfd]">
        <button
          onClick={() => setGoalsExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-[#c06080] hover:bg-pink-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">🎯 {childName}的目标计划</span>
          {goalsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {goalsExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Scope tabs */}
            <div className="flex items-center gap-1 bg-pink-50 border border-pink-100 p-0.5 rounded-md w-fit text-xs">
              {(['week', 'month'] as const).map(s => (
                <button key={s} onClick={() => setGoalScope(s)}
                  className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${goalScope === s ? 'bg-[#c06080] text-white' : 'text-[#c06080]/70 hover:bg-pink-100'}`}>
                  {s === 'week' ? '本周目标' : '本月目标'}
                </button>
              ))}
            </div>

            {/* Add input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                placeholder={goalScope === 'week' ? '本周想完成什么？' : '本月大目标...'}
                className="flex-1 bg-white border border-pink-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300"
              />
              <button onClick={addGoal}
                className="px-2.5 py-1.5 bg-[#c06080] hover:bg-[#a04060] text-white rounded-md cursor-pointer transition-colors">
                <Plus size={13} />
              </button>
            </div>

            {/* Goals list */}
            {childGoals.filter(g => g.scope === goalScope).length === 0 ? (
              <p className="text-[11px] text-gray-300 text-center py-2">还没有{goalScope === 'week' ? '本周' : '本月'}目标</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {childGoals.filter(g => g.scope === goalScope).map(g => (
                  <div key={g.id} className="flex items-center gap-2 bg-white border border-pink-100 rounded-md px-2.5 py-1.5 group hover:border-pink-200 transition-colors">
                    {editingGoalId === g.id ? (
                      <>
                        <input
                          autoFocus
                          value={editingGoalText}
                          onChange={e => setEditingGoalText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEditGoal(g.id); if (e.key === 'Escape') { setEditingGoalId(null); setEditingGoalText(''); } }}
                          className="flex-1 text-xs px-1.5 py-0.5 border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 text-[#3a3528]"
                        />
                        <button onClick={() => confirmEditGoal(g.id)} className="shrink-0 text-emerald-500 hover:text-emerald-600 cursor-pointer">
                          <Check size={12} />
                        </button>
                        <button onClick={() => { setEditingGoalId(null); setEditingGoalText(''); }} className="shrink-0 text-gray-300 hover:text-gray-500 cursor-pointer">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => toggleGoal(g.id)} className="shrink-0 cursor-pointer text-gray-300 hover:text-[#c06080] transition-colors">
                          {g.done ? <CheckCircle2 size={14} className="text-[#c06080]" /> : <Circle size={14} />}
                        </button>
                        <span className={`flex-1 text-xs leading-snug ${g.done ? 'line-through text-gray-300' : 'text-[#3a3528]'}`}>{g.text}</span>
                        <button onClick={() => { setEditingGoalId(g.id); setEditingGoalText(g.text); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#c06080] cursor-pointer transition-all shrink-0">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => deleteGoal(g.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer transition-all shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-t-0 border-[#d3cfc3] rounded-b-lg overflow-hidden print:overflow-visible">
        {/* Day headers */}
        <div className="grid grid-cols-15 border-b border-[#eae6d8] bg-[#fdf6f0] sticky top-0 z-10">
          <div className="col-span-1 border-r border-[#eae6d8] py-2 text-[10px] text-center font-bold text-[#8c8577]">时间</div>
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={`col-span-2 py-2 text-center border-r last:border-r-0 border-[#eae6d8] ${
                day.isToday ? 'bg-pink-50' : ''
              }`}
            >
              <div className={`text-[11px] font-extrabold ${day.isToday ? 'text-[#c06080]' : 'text-[#3c3830]'}`}>{day.text}</div>
              <div className={`text-[9px] font-mono ${day.isToday ? 'text-[#c06080]' : 'text-[#8c8577]'}`}>{day.dateStr}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div ref={hourScrollRef} className="overflow-y-auto max-h-[480px] print:overflow-visible print:max-h-none">
          <div className="grid grid-cols-15">
            {/* Hour labels */}
            <div className="col-span-1 border-r border-[#eae6d8]">
              {hours.map(hour => (
                <div
                  key={hour}
                  className={`h-10 flex items-center justify-center text-[9px] font-mono font-bold border-b border-[#eae6d8]/60 select-none ${
                    hour >= 6 && hour <= 21 ? 'text-[#8c8577]' : 'text-[#c4c0b8]'
                  }`}
                >
                  {String(hour).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {daysOfWeek.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`col-span-2 border-r last:border-r-0 border-[#eae6d8] divide-y divide-[#eae6d8]/60 ${
                  day.isToday ? 'bg-pink-50/30' : ''
                }`}
              >
                {hours.map(hour => {
                  const cell = renderedCells.find(c => c.id.endsWith(`-${dayIdx}-${hour}`));
                  return (
                    <div
                      key={hour}
                      onClick={() => openCell(dayIdx, hour)}
                      className="h-10 cursor-pointer hover:bg-pink-50/50 transition-colors relative group"
                      style={cell ? { backgroundColor: cell.color, borderLeft: `2px solid ${colorPresets.find(cp => cp.bg === cell.color)?.border || '#fbcfe8'}` } : {}}
                    >
                      {cell && (
                        <span className="block px-1 py-0.5 text-[10px] leading-tight font-medium text-[#3c3830] truncate">
                          {cell.text}
                        </span>
                      )}
                      {!cell && (
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 text-[10px] text-pink-400 select-none">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Notes row */}
        <div className="border-t-2 border-[#eae6d8] bg-[#fbfaf5]">
          <div className="grid grid-cols-15 border-b border-[#eae6d8] bg-[#fdf6f0]">
            <div className="col-span-1 border-r border-[#eae6d8] py-1 text-[10px] text-center font-bold text-[#8c8577] flex items-center justify-center">备注</div>
            <div className="col-span-14 py-1 px-3 text-[10px] font-semibold text-[#c06080]/70 tracking-wider">
              🌱 {childName}每日备注
            </div>
          </div>
          <div className="grid grid-cols-15 divide-x divide-[#eae6d8]">
            <div className="col-span-1 bg-[#fdfdfb] flex items-center justify-center text-base">🌸</div>
            {daysOfWeek.map((day, idx) => {
              const noteVal = renderedNotes[idx] || '';
              const isEditing = editingNoteDay === idx;
              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && startEditNote(idx)}
                  className={`col-span-2 p-2 min-h-[68px] relative text-[11px] leading-relaxed cursor-pointer transition-all ${
                    day.isToday ? 'bg-pink-50/40' : 'bg-white'
                  } hover:bg-pink-50/30`}
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="w-full text-xs p-1 bg-white border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none h-[50px] font-sans"
                        placeholder="今日备注..."
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <button onClick={() => setEditingNoteDay(null)} className="text-[9px] px-1 py-0.5 text-gray-500 hover:bg-gray-100 rounded border cursor-pointer">取消</button>
                        <button onClick={saveNote} className="text-[9px] px-1.5 py-0.5 bg-[#c06080] text-white rounded hover:bg-[#a04060] cursor-pointer">保存</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#524c3e] whitespace-pre-wrap">{noteVal}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cell edit modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditingSlot(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-pink-200 p-5 w-80 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#c06080]">
                🌱 {daysOfWeek[editingSlot.dayIndex].text} {String(editingSlot.hour).padStart(2, '0')}:00
              </h4>
              <button onClick={() => setEditingSlot(null)} className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">✕</button>
            </div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="记录活动内容..."
              className="w-full border border-pink-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none h-20 font-sans"
              autoFocus
            />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500">活动类型</p>
              <div className="grid grid-cols-3 gap-1.5">
                {colorPresets.map((cp, i) => (
                  <button
                    key={i}
                    onClick={() => setEditColorIdx(i)}
                    className={`text-[10px] py-1 px-1.5 rounded border font-medium transition-all cursor-pointer ${
                      editColorIdx === i ? 'ring-2 ring-pink-400 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: cp.bg, borderColor: cp.border }}
                  >
                    {cp.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {renderedCells.find(c => c.id.endsWith(`-${editingSlot.dayIndex}-${editingSlot.hour}`)) && (
                <button
                  onClick={() => { onClearCell(editingSlot.dayIndex, editingSlot.hour); setEditingSlot(null); }}
                  className="flex-1 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                  清除
                </button>
              )}
              <button onClick={saveCell} className="flex-1 py-2 text-xs font-bold bg-[#c06080] text-white rounded-lg hover:bg-[#a04060] cursor-pointer">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
