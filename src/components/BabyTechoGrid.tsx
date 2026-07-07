import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PlannerCell } from '../types';

type Goal = { id: string; text: string; done: boolean; scope: 'week' | 'month'; month?: string; week?: string };

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
  onCopyCell?: (fromDayIndex: number, fromHour: number, toDayIndex: number, toHour: number) => void;
}

const colorPresets = [
  { label: '作息/睡眠', bg: '#ecfeff', border: '#67e8f9', textClass: 'text-cyan-900' },
  { label: '饮食/喂奶', bg: '#fff7ed', border: '#fb923c', textClass: 'text-orange-900' },
  { label: '玩耍/活动', bg: '#fff1f2', border: '#fda4af', textClass: 'text-rose-900' },
  { label: '学习', bg: '#f0fdf4', border: '#4ade80', textClass: 'text-green-900' },
  { label: '网课', bg: '#eff6ff', border: '#60a5fa', textClass: 'text-blue-900' },
  { label: '运动', bg: '#f7fee7', border: '#a3e635', textClass: 'text-lime-900' },
  { label: '就医/健康', bg: '#f5f3ff', border: '#c084fc', textClass: 'text-violet-900' },
  { label: '其他', bg: '#fffbeb', border: '#fcd34d', textClass: 'text-amber-900' },
  { label: '深粉', bg: '#fce7f3', border: '#ec4899', textClass: 'text-pink-900' },
  { label: '深蓝', bg: '#dbeafe', border: '#2563eb', textClass: 'text-blue-900' },
  { label: '深绿', bg: '#dcfce7', border: '#16a34a', textClass: 'text-green-900' },
  { label: '深橙', bg: '#ffedd5', border: '#ea580c', textClass: 'text-orange-900' },
  { label: '深紫', bg: '#ede9fe', border: '#7c3aed', textClass: 'text-violet-900' },
  { label: '红', bg: '#fee2e2', border: '#dc2626', textClass: 'text-red-900' },
  { label: '青', bg: '#ccfbf1', border: '#0d9488', textClass: 'text-teal-900' },
  { label: '金', bg: '#fef9c3', border: '#ca8a04', textClass: 'text-yellow-900' },
];

type TodoItem = { text: string; done: boolean };
type BabyDailyNote = {
  morning: TodoItem[];
  noon: TodoItem[];
  evening: TodoItem[];
  outdoorMinutes: string;
  summary: string;
};
const SECTIONS = [
  { key: 'morning' as const, label: '早' },
  { key: 'noon' as const, label: '中' },
  { key: 'evening' as const, label: '晚' },
];

const parseBabyDailyNote = (raw = ''): BabyDailyNote => {
  const lines = raw.split('\n');
  const outdoorLine = lines.find(l => l.startsWith('@@outdoorMinutes='));
  const summaryLine = lines.find(l => l.startsWith('@@summary='));
  const morning: TodoItem[] = [], noon: TodoItem[] = [], evening: TodoItem[] = [];
  let cur: 'morning' | 'noon' | 'evening' = 'morning';
  let hasSections = false;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('@@section=')) { cur = (line.slice(10) as any) || 'morning'; hasSections = true; continue; }
    if (line.startsWith('@@')) continue;
    const item: TodoItem = { done: line.startsWith('[x]'), text: line.startsWith('[x]') ? line.slice(3) : line };
    if (cur === 'noon') noon.push(item);
    else if (cur === 'evening') evening.push(item);
    else morning.push(item);
  }
  return {
    morning, noon, evening,
    outdoorMinutes: outdoorLine ? outdoorLine.replace('@@outdoorMinutes=', '') : '',
    summary: summaryLine ? summaryLine.replace('@@summary=', '') : '',
  };
};

const serializeBabyDailyNote = (note: BabyDailyNote): string => {
  const toLines = (items: TodoItem[]) => items.filter(t => t.text.trim()).map(t => `${t.done ? '[x]' : ''}${t.text.trim()}`);
  const parts: string[] = [];
  const mLines = toLines(note.morning), nLines = toLines(note.noon), eLines = toLines(note.evening);
  if (mLines.length) parts.push('@@section=morning', ...mLines);
  if (nLines.length) parts.push('@@section=noon', ...nLines);
  if (eLines.length) parts.push('@@section=evening', ...eLines);
  if (note.outdoorMinutes.trim()) parts.push(`@@outdoorMinutes=${note.outdoorMinutes.trim()}`);
  if (note.summary.trim()) parts.push(`@@summary=${note.summary.trim()}`);
  return parts.join('\n');
};

function getWeekKey(weekOffset = 0): string {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
  return monday.toISOString().slice(0, 10);
}

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
    const note = parseBabyDailyNote(notes[idx] || '');
    const secHtml = (label: string, items: TodoItem[]) => items.length === 0 ? '' :
      `<div style="font-size:8px;color:#c06080;font-weight:700;margin-top:2px;">${label}</div>` +
      items.map(t => `<div>${t.done ? '✓ ' : '□ '}${t.text}</div>`).join('');
    const todos = [secHtml('早', note.morning), secHtml('中', note.noon), secHtml('晚', note.evening)].filter(Boolean).join('');
    const outdoor = note.outdoorMinutes ? `<br><strong>户外：</strong>${note.outdoorMinutes}分钟` : '';
    const summary = note.summary ? `<br><strong>总结：</strong>${note.summary}` : '';
    return `<td style="width:12%;vertical-align:top;padding:4px;border:1px solid #eae6d8;font-size:9px;color:#524c3e;">${todos}${outdoor}${summary}</td>`;
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
  onCopyCell,
}: BabyTechoGridProps) {
  const daysOfWeek = getCurrentWeekDays(weekOffset);
  const today = new Date();
  const hours = Array.from({ length: 24 }).map((_, i) => i);
  const currentWeekKey = getWeekKey(weekOffset);
  const currentMonthKey = currentWeekKey.slice(0, 7);
  const monthStr = `${currentMonthKey.slice(0, 4)}年${parseInt(currentMonthKey.slice(5, 7))}月`;

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
  const [editItems, setEditItems] = useState<{ text: string; done: boolean }[]>([{ text: '', done: false }]);
  const [editColorIdx, setEditColorIdx] = useState(0);
  const [showCopyPicker, setShowCopyPicker] = useState(false);
  const [copyTarget, setCopyTarget] = useState<{ dayIndex: number; hour: number }>({ dayIndex: 0, hour: 8 });
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [addPickerDay, setAddPickerDay] = useState(0);
  const [addPickerHour, setAddPickerHour] = useState(8);

  const [cellFontSize, setCellFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('babygrid-fontsize');
    return saved ? parseInt(saved) : 10;
  });
  const adjustFontSize = (delta: number) => {
    setCellFontSize(prev => {
      const next = Math.min(16, Math.max(8, prev + delta));
      localStorage.setItem('babygrid-fontsize', String(next));
      return next;
    });
  };

  const openCell = (dayIdx: number, hour: number) => {
    const existing = renderedCells.find(c => c.id.endsWith(`-${dayIdx}-${hour}`));
    const items = existing?.text
      ? existing.text.split('\n').filter(s => s.trim()).map(s => ({
          done: s.startsWith('[x]'),
          text: s.startsWith('[x]') ? s.slice(3) : s,
        }))
      : [{ text: '', done: false }];
    setEditItems(items.length ? items : [{ text: '', done: false }]);
    setEditColorIdx(existing?.color ? colorPresets.findIndex(cp => cp.bg === existing.color) : 0);
    setEditingSlot({ dayIndex: dayIdx, hour });
  };

  const saveCell = () => {
    if (!editingSlot) return;
    const joined = editItems
      .filter(it => it.text.trim())
      .map(it => (it.done ? '[x]' : '') + it.text.trim())
      .join('\n');
    if (joined) {
      onSaveCell(editingSlot.dayIndex, editingSlot.hour, joined, colorPresets[editColorIdx >= 0 ? editColorIdx : 0].bg);
    } else {
      onClearCell(editingSlot.dayIndex, editingSlot.hour);
    }
    setEditingSlot(null);
    setEditItems([{ text: '', done: false }]);
  };

  type EditingNote = { morning: TodoItem[]; noon: TodoItem[]; evening: TodoItem[] };
  const [editingDailyNotes, setEditingDailyNotes] = useState<{ [dayIdx: number]: EditingNote }>({});
  const [editingSummary, setEditingSummary] = useState<{ [dayIdx: number]: { outdoorMinutes: string; summary: string } }>({});

  const openDayNoteEditor = (idx: number) => {
    if (editingDailyNotes[idx]) return;
    const p = parseBabyDailyNote(renderedNotes[idx] || '');
    setEditingDailyNotes(prev => ({ ...prev, [idx]: {
      morning: p.morning.length ? p.morning : [{ text: '', done: false }],
      noon: p.noon.length ? p.noon : [{ text: '', done: false }],
      evening: p.evening.length ? p.evening : [{ text: '', done: false }],
    }}));
  };

  const saveDayNote = (idx: number) => {
    const editing = editingDailyNotes[idx];
    if (!editing) return;
    const existing = parseBabyDailyNote(renderedNotes[idx] || '');
    onSaveTodayNote(idx, serializeBabyDailyNote({ ...editing, outdoorMinutes: existing.outdoorMinutes, summary: existing.summary }));
    setEditingDailyNotes(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const openDaySummaryEditor = (idx: number) => {
    if (editingSummary[idx]) return;
    const parsed = parseBabyDailyNote(renderedNotes[idx] || '');
    setEditingSummary(prev => ({ ...prev, [idx]: { outdoorMinutes: parsed.outdoorMinutes, summary: parsed.summary } }));
  };

  const saveDaySummary = (idx: number) => {
    const editing = editingSummary[idx];
    if (!editing) return;
    const existing = parseBabyDailyNote(renderedNotes[idx] || '');
    const serialized = serializeBabyDailyNote({ morning: existing.morning, noon: existing.noon, evening: existing.evening, outdoorMinutes: editing.outdoorMinutes, summary: editing.summary });
    onSaveTodayNote(idx, serialized);
    setEditingSummary(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const updateDayNoteTodo = (dayIdx: number, sec: 'morning'|'noon'|'evening', todoIdx: number, field: 'text'|'done', value: string|boolean) => {
    setEditingDailyNotes(prev => {
      const note = { ...prev[dayIdx] };
      return { ...prev, [dayIdx]: { ...note, [sec]: note[sec].map((t, i) => i === todoIdx ? { ...t, [field]: value } : t) } };
    });
  };

  const addDayNoteTodo = (dayIdx: number, sec: 'morning'|'noon'|'evening') => {
    setEditingDailyNotes(prev => {
      const note = { ...prev[dayIdx] };
      return { ...prev, [dayIdx]: { ...note, [sec]: [...note[sec], { text: '', done: false }] } };
    });
  };

  const removeDayNoteTodo = (dayIdx: number, sec: 'morning'|'noon'|'evening', todoIdx: number) => {
    setEditingDailyNotes(prev => {
      const note = { ...prev[dayIdx] };
      const items = note[sec].filter((_, i) => i !== todoIdx);
      return { ...prev, [dayIdx]: { ...note, [sec]: items.length ? items : [{ text: '', done: false }] } };
    });
  };

  const toggleDayNoteTodoDirect = (idx: number, sec: 'morning'|'noon'|'evening', todoIdx: number) => {
    const parsed = parseBabyDailyNote(renderedNotes[idx] || '');
    onSaveTodayNote(idx, serializeBabyDailyNote({ ...parsed, [sec]: parsed[sec].map((t, i) => i === todoIdx ? { ...t, done: !t.done } : t) }));
  };

  const [editingSectionSlot, setEditingSectionSlot] = useState<{ dayIdx: number; sec: 'morning'|'noon'|'evening'; items: TodoItem[] } | null>(null);

  const saveSectionSlot = () => {
    if (!editingSectionSlot) return;
    const { dayIdx, sec, items } = editingSectionSlot;
    const existing = parseBabyDailyNote(renderedNotes[dayIdx] || '');
    onSaveTodayNote(dayIdx, serializeBabyDailyNote({ ...existing, [sec]: items }));
    setEditingSectionSlot(null);
  };

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
    const extra = goalScope === 'month' ? { month: currentMonthKey } : { week: currentWeekKey };
    onAddChildGoal?.({ text: goalInput.trim(), done: false, scope: goalScope, ...extra });
    setGoalInput('');
  };
  const toggleGoal = (id: string) => onToggleChildGoal?.(id);
  const deleteGoal = (id: string) => onDeleteChildGoal?.(id);

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
        <div className="no-print flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-pink-200 rounded px-1.5 py-1">
            <button onClick={() => adjustFontSize(-1)} className="w-5 h-5 flex items-center justify-center text-[#c06080] hover:bg-pink-50 rounded cursor-pointer font-bold text-sm leading-none">−</button>
            <span className="text-[10px] text-[#c06080]/60 font-mono w-5 text-center">{cellFontSize}</span>
            <button onClick={() => adjustFontSize(1)} className="w-5 h-5 flex items-center justify-center text-[#c06080] hover:bg-pink-50 rounded cursor-pointer font-bold text-sm leading-none">+</button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-pink-200 text-[#c06080] rounded hover:bg-pink-50 cursor-pointer transition-colors"
          >
            <Printer size={13} />
            打印 / 导出 PDF
          </button>
        </div>
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
                  {s === 'week' ? '本周目标' : `${parseInt(currentMonthKey.slice(5, 7))}月目标`}
                </button>
              ))}
            </div>

            {/* Add input */}
            <div className="flex gap-2 items-start">
              <textarea
                rows={2}
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addGoal(); }}
                placeholder={goalScope === 'week' ? '本周想完成什么？（Cmd+Enter）' : '本月大目标...（Cmd+Enter）'}
                className="flex-1 bg-white border border-pink-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none"
              />
              <button onClick={addGoal}
                className="px-2.5 py-1.5 bg-[#c06080] hover:bg-[#a04060] text-white rounded-md cursor-pointer transition-colors">
                <Plus size={13} />
              </button>
            </div>

            {/* Goals list */}
            {(() => {
              const filtered = goalScope === 'month'
                ? childGoals.filter(g => g.scope === 'month' && g.month === currentMonthKey)
                : childGoals.filter(g => g.scope === 'week' && g.week === currentWeekKey);
              return filtered.length === 0 ? (
                <p className="text-[11px] text-gray-300 text-center py-2">还没有{goalScope === 'week' ? '本周' : '本月'}目标</p>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {filtered.map(g => (
                  <div key={g.id} className="flex items-start gap-2 bg-white border border-pink-100 rounded-md px-2.5 py-1.5 group hover:border-pink-200 transition-colors">
                    {editingGoalId === g.id ? (
                      <>
                        <textarea
                          autoFocus
                          rows={2}
                          value={editingGoalText}
                          onChange={e => setEditingGoalText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) confirmEditGoal(g.id); if (e.key === 'Escape') { setEditingGoalId(null); setEditingGoalText(''); } }}
                          className="flex-1 text-xs px-1.5 py-0.5 border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 text-[#3a3528] resize-none"
                        />
                        <button onClick={() => confirmEditGoal(g.id)} className="shrink-0 text-emerald-500 hover:text-emerald-600 cursor-pointer mt-0.5">
                          <Check size={12} />
                        </button>
                        <button onClick={() => { setEditingGoalId(null); setEditingGoalText(''); }} className="shrink-0 text-gray-300 hover:text-gray-500 cursor-pointer mt-0.5">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => toggleGoal(g.id)} className="shrink-0 cursor-pointer text-gray-300 hover:text-[#c06080] transition-colors mt-0.5">
                          {g.done ? <CheckCircle2 size={14} className="text-[#c06080]" /> : <Circle size={14} />}
                        </button>
                        <span className={`flex-1 text-xs leading-snug whitespace-pre-wrap ${g.done ? 'line-through text-gray-300' : 'text-[#3a3528]'}`}>{g.text}</span>
                        <button onClick={() => { setEditingGoalId(g.id); setEditingGoalText(g.text); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#c06080] cursor-pointer transition-all shrink-0 mt-0.5">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => deleteGoal(g.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 cursor-pointer transition-all shrink-0 mt-0.5">
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              );
            })()}
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

        {/* Grid — only active hours */}
        {(() => {
          const activeHours = Array.from(
            new Set(renderedCells.map(c => {
              const parts = c.id.split('-');
              return Number(parts[parts.length - 1]);
            }))
          ).sort((a, b) => a - b);

          return (
            <div ref={hourScrollRef} className="print:overflow-visible">
              {activeHours.length === 0 && (
                <div className="py-8 text-center text-[11px] text-gray-400">还没有计划，点下方「+ 新增时段」开始添加</div>
              )}
              {(() => {
                const SECTION_DIVIDERS = [
                  { threshold: 9,  label: '早', sec: 'morning' as const, bg: '#fffbeb', text: '#b45309', line: '#fcd34d' },
                  { threshold: 14, label: '中', sec: 'noon' as const,    bg: '#f0fdf4', text: '#15803d', line: '#86efac' },
                  { threshold: 20, label: '晚', sec: 'evening' as const, bg: '#f5f3ff', text: '#7c3aed', line: '#c4b5fd' },
                ];
                const usedDivs = new Set<number>();
                return activeHours.map(hour => {
                  const divsBefore = SECTION_DIVIDERS.filter(d => !usedDivs.has(d.threshold) && hour >= d.threshold);
                  divsBefore.forEach(d => usedDivs.add(d.threshold));
                  return (
                    <React.Fragment key={hour}>
                      {divsBefore.map(d => (
                        <div key={`sec-${d.threshold}`} className="grid grid-cols-15 border-b border-[#eae6d8]" style={{ background: d.bg, borderTop: `1.5px solid ${d.line}` }}>
                          <div className="col-span-1 flex items-center justify-center py-1 border-r border-[#eae6d8]" style={{ color: d.text }}>
                            <span className="text-[9px] font-extrabold tracking-widest">{d.label}</span>
                          </div>
                          {daysOfWeek.map((_day, dayIdx) => {
                            const parsed = parseBabyDailyNote(renderedNotes[dayIdx] || '');
                            const isEditing = editingSectionSlot?.dayIdx === dayIdx && editingSectionSlot?.sec === d.sec;
                            return (
                              <div key={dayIdx} className="col-span-2 border-r last:border-r-0 border-[#eae6d8] p-0.5 min-h-[36px]" style={{ background: isEditing ? '#fff' : undefined }}>
                                {isEditing ? (
                                  <div className="flex flex-col gap-0.5">
                                    {editingSectionSlot!.items.map((todo, ti) => (
                                      <div key={ti} className="flex items-center gap-0.5">
                                        <button onClick={() => setEditingSectionSlot(prev => prev ? { ...prev, items: prev.items.map((t, i) => i === ti ? { ...t, done: !t.done } : t) } : null)}
                                          className={`w-2.5 h-2.5 shrink-0 rounded border flex items-center justify-center cursor-pointer ${todo.done ? 'bg-pink-400 border-pink-400 text-white' : 'border-pink-300'}`}>
                                          {todo.done && <Check size={6} />}
                                        </button>
                                        <input value={todo.text} onChange={e => setEditingSectionSlot(prev => prev ? { ...prev, items: prev.items.map((t, i) => i === ti ? { ...t, text: e.target.value } : t) } : null)}
                                          className="flex-1 min-w-0 border border-pink-100 rounded px-0.5 focus:outline-none bg-white" style={{ fontSize: cellFontSize }} />
                                        {editingSectionSlot!.items.length > 1 && (
                                          <button onClick={() => setEditingSectionSlot(prev => prev ? { ...prev, items: prev.items.filter((_, i) => i !== ti) } : null)}
                                            className="text-gray-300 hover:text-red-400 cursor-pointer"><X size={7} /></button>
                                        )}
                                      </div>
                                    ))}
                                    <button onClick={() => setEditingSectionSlot(prev => prev ? { ...prev, items: [...prev.items, { text: '', done: false }] } : null)}
                                      className="text-[8px] text-pink-400 cursor-pointer flex items-center"><Plus size={7} /></button>
                                    <div className="flex gap-0.5 justify-end mt-0.5">
                                      <button onClick={() => setEditingSectionSlot(null)} className="text-[8px] px-1 text-gray-400 border rounded cursor-pointer">取消</button>
                                      <button onClick={saveSectionSlot} className="text-[8px] px-1 bg-[#c06080] text-white rounded cursor-pointer">存</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="cursor-pointer group min-h-[28px]" onClick={() => {
                                    const ex = parseBabyDailyNote(renderedNotes[dayIdx] || '');
                                    setEditingSectionSlot({ dayIdx, sec: d.sec, items: ex[d.sec].length ? ex[d.sec] : [{ text: '', done: false }] });
                                  }}>
                                    {parsed[d.sec].filter(t => t.text.trim()).length === 0 ? (
                                      <span className="text-[8px] text-gray-300 opacity-0 group-hover:opacity-100">+</span>
                                    ) : parsed[d.sec].map((todo, ti) => (
                                      <div key={ti} className="flex items-center gap-0.5 mb-0.5">
                                        <button type="button" onClick={e => { e.stopPropagation(); toggleDayNoteTodoDirect(dayIdx, d.sec, ti); }}
                                          className={`w-2.5 h-2.5 shrink-0 rounded border flex items-center justify-center cursor-pointer ${todo.done ? 'bg-pink-400 border-pink-400 text-white' : 'border-pink-300'}`}>
                                          {todo.done && <Check size={6} />}
                                        </button>
                                        <span className={`leading-tight break-words ${todo.done ? 'line-through text-gray-400' : ''}`} style={{ fontSize: cellFontSize }}>{todo.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      <div className="grid grid-cols-15 border-b border-[#eae6d8]/60">
                        <div className={`col-span-1 border-r border-[#eae6d8] flex items-center justify-center text-[9px] font-mono font-bold select-none py-1 ${
                          hour >= 6 && hour <= 21 ? 'text-[#8c8577]' : 'text-[#c4c0b8]'
                        }`}>
                          {String(hour).padStart(2, '0')}
                        </div>
                        {daysOfWeek.map((day, dayIdx) => {
                          const cell = renderedCells.find(c => c.id.endsWith(`-${dayIdx}-${hour}`));
                          return (
                            <div
                              key={dayIdx}
                              onClick={() => openCell(dayIdx, hour)}
                              className={`col-span-2 border-r last:border-r-0 border-[#eae6d8] min-h-10 cursor-pointer hover:bg-pink-50/50 transition-colors relative group ${day.isToday ? 'bg-pink-50/30' : ''}`}
                              style={cell ? { backgroundColor: cell.color, borderLeft: `2px solid ${colorPresets.find(cp => cp.bg === cell.color)?.border || '#fbcfe8'}` } : {}}
                            >
                              {cell && (
                                <div className="px-1 py-0.5 leading-snug font-medium text-[#3c3830]" style={{ fontSize: cellFontSize }}>
                                  {cell.text.split('\n').filter(Boolean).map((seg, i) => {
                                    const done = seg.startsWith('[x]');
                                    const label = done ? seg.slice(3) : seg;
                                    return (
                                      <div key={i} className={`break-words ${done ? 'line-through text-gray-400' : ''}`}>{label}</div>
                                    );
                                  })}
                                </div>
                              )}
                              {!cell && (
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 text-[10px] text-pink-400 select-none">+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                });
              })()}

              {/* Add new hour slot */}
              <div className="px-3 py-2 border-t border-[#eae6d8]">
                {!showAddPicker ? (
                  <button
                    type="button"
                    onClick={() => setShowAddPicker(true)}
                    className="text-[10px] text-pink-400 hover:text-pink-600 cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={11} /> 新增时段
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-500">选择日期和时段：</span>
                    <select
                      value={addPickerDay}
                      onChange={e => setAddPickerDay(Number(e.target.value))}
                      className="border border-pink-200 rounded px-1.5 py-0.5 text-xs focus:outline-none bg-white"
                    >
                      {daysOfWeek.map((d, i) => (
                        <option key={i} value={i}>{d.text} {d.dateStr}</option>
                      ))}
                    </select>
                    <select
                      value={addPickerHour}
                      onChange={e => setAddPickerHour(Number(e.target.value))}
                      className="border border-pink-200 rounded px-1.5 py-0.5 text-xs focus:outline-none bg-white"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setShowAddPicker(false); openCell(addPickerDay, addPickerHour); }}
                      className="text-[10px] font-bold text-white bg-pink-400 hover:bg-pink-500 rounded px-2 py-0.5 cursor-pointer"
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPicker(false)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Outdoor + summary row */}
        <div className="border-t-2 border-[#eae6d8] bg-[#fbfaf5]">
          <div className="grid grid-cols-15 border-b border-[#eae6d8] bg-[#fdf6f0]">
            <div className="col-span-1 border-r border-[#eae6d8] py-1 text-[10px] text-center font-bold text-[#8c8577] flex items-center justify-center">总结</div>
            <div className="col-span-14 py-1 px-3 text-[10px] font-semibold text-[#c06080]/70 tracking-wider">
              🌿 户外时长 &amp; 今日总结
            </div>
          </div>
          <div className="grid grid-cols-15 divide-x divide-[#eae6d8]">
            <div className="col-span-1 bg-[#fdfdfb] flex items-center justify-center text-base">🌞</div>
            {daysOfWeek.map((day, idx) => {
              const editing = editingSummary[idx];
              const parsed = parseBabyDailyNote(renderedNotes[idx] || '');
              return (
                <div key={idx} className={`col-span-2 p-1.5 min-h-[52px] text-[10px] ${day.isToday ? 'bg-pink-50/40' : 'bg-white'}`}>
                  {editing ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editing.outdoorMinutes}
                          onChange={e => setEditingSummary(prev => ({ ...prev, [idx]: { ...prev[idx], outdoorMinutes: e.target.value } }))}
                          placeholder="0"
                          className="w-10 border border-green-200 rounded px-1 py-0.5 text-[10px] focus:outline-none bg-white text-center"
                        />
                        <span className="text-[9px] text-gray-400">分钟</span>
                      </div>
                      <input
                        value={editing.summary}
                        onChange={e => setEditingSummary(prev => ({ ...prev, [idx]: { ...prev[idx], summary: e.target.value } }))}
                        placeholder="今日总结..."
                        className="w-full border border-pink-100 rounded px-1 py-0.5 text-[10px] focus:outline-none bg-white"
                      />
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <button onClick={() => setEditingSummary(prev => { const n = { ...prev }; delete n[idx]; return n; })} className="text-[9px] px-1 py-0.5 text-gray-400 hover:bg-gray-100 rounded border cursor-pointer">取消</button>
                        <button onClick={() => saveDaySummary(idx)} className="text-[9px] px-1.5 py-0.5 bg-[#c06080] text-white rounded hover:bg-[#a04060] cursor-pointer">存</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => openDaySummaryEditor(idx)}>
                      {parsed.outdoorMinutes ? (
                        <span className="text-[10px] text-green-700 font-semibold">🌿 {parsed.outdoorMinutes}min</span>
                      ) : (
                        <span className="text-[9px] text-gray-300">户外—</span>
                      )}
                      {parsed.summary ? (
                        <span className="text-[10px] text-[#524c3e] leading-snug">{parsed.summary}</span>
                      ) : (
                        <span className="text-[9px] text-gray-300">总结—</span>
                      )}
                    </div>
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
          <div className="bg-white rounded-xl shadow-xl border border-pink-200 p-5 w-80 space-y-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#c06080]">
                🌱 {daysOfWeek[editingSlot.dayIndex].text} {String(editingSlot.hour).padStart(2, '0')}:00
              </h4>
              <button onClick={() => setEditingSlot(null)} className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5">
              {editItems.map((item, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...editItems];
                      next[i] = { ...next[i], done: !next[i].done };
                      setEditItems(next);
                    }}
                    className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-colors ${item.done ? 'bg-pink-400 border-pink-400 text-white' : 'border-pink-300 hover:border-pink-400'}`}
                  >
                    {item.done && <Check size={9} />}
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={e => {
                      const next = [...editItems];
                      next[i] = { ...next[i], text: e.target.value };
                      setEditItems(next);
                    }}
                    placeholder={`第 ${i + 1} 项...`}
                    autoFocus={i === 0}
                    className={`flex-1 border border-pink-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300 font-sans ${item.done ? 'line-through text-gray-400' : ''}`}
                  />
                  {editItems.length > 1 && (
                    <button type="button" onClick={() => setEditItems(editItems.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 cursor-pointer">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEditItems([...editItems, { text: '', done: false }])}
                className="text-[10px] text-pink-400 hover:text-pink-600 cursor-pointer flex items-center gap-0.5 pl-5"
              >
                <Plus size={10} /> 添加一条
              </button>
            </div>
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
                <>
                  <button
                    onClick={() => { onClearCell(editingSlot.dayIndex, editingSlot.hour); setEditingSlot(null); }}
                    className="py-2 px-3 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    清除
                  </button>
                  {onCopyCell && (
                    <button
                      onClick={() => setShowCopyPicker(p => !p)}
                      className="py-2 px-3 text-xs font-bold text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      复制到
                    </button>
                  )}
                </>
              )}
              <button onClick={saveCell} className="flex-1 py-2 text-xs font-bold bg-[#c06080] text-white rounded-lg hover:bg-[#a04060] cursor-pointer">
                保存
              </button>
            </div>
            {showCopyPicker && onCopyCell && (
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 space-y-2">
                <p className="text-[10px] font-bold text-blue-600">复制到哪一天的哪个时段？</p>
                <div className="flex gap-2">
                  <select
                    value={copyTarget.dayIndex}
                    onChange={e => setCopyTarget(prev => ({ ...prev, dayIndex: Number(e.target.value) }))}
                    className="flex-1 border border-blue-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                  >
                    {daysOfWeek.map((d, i) => (
                      <option key={i} value={i}>{d.text} {d.dateStr}</option>
                    ))}
                  </select>
                  <select
                    value={copyTarget.hour}
                    onChange={e => setCopyTarget(prev => ({ ...prev, hour: Number(e.target.value) }))}
                    className="flex-1 border border-blue-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    onCopyCell(editingSlot.dayIndex, editingSlot.hour, copyTarget.dayIndex, copyTarget.hour);
                    setShowCopyPicker(false);
                  }}
                  className="w-full py-1.5 text-xs font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  确认复制
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
