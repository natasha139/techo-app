/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  HelpCircle, 
  Edit, 
  Flame, 
  CheckCircle2, 
  Trash2, 
  PlusCircle, 
  Sparkles,
  TrendingUp,
  Smile,
  Save,
  X,
  Target,
  PenLine,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlannerCell, HabitTracker, WeeklySummary } from '../types';
import HabitTrendChart from './HabitTrendChart';

interface TechoGridProps {
  cells: PlannerCell[];
  onSaveCell: (dayIndex: number, hour: number, text: string, color: string, tag?: string) => void;
  onClearCell: (dayIndex: number, hour: number) => void;
  todayNotes: { [dayIndex: number]: string };
  onSaveTodayNote: (dayIndex: number, text: string) => void;
  username?: string;
  habits: HabitTracker[];
  onToggleHabit: (habitId: string, dayIdx: number) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
  weeklySummary: WeeklySummary;
  onSaveWeeklySummary: (summary: WeeklySummary) => void;
  weekOffset?: number;
}

const colorPresets = [
  { class: 'bg-teal-50/90 text-teal-900 border-teal-200 hover:bg-teal-100', name: '自我成长', bg: '#f0fdfa', border: '#99f6e4', color: 'teal' },
  { class: 'bg-blue-50/90 text-blue-900 border-blue-200 hover:bg-blue-100', name: '工作项目', bg: '#eff6ff', border: '#bfdbfe', color: 'blue' },
  { class: 'bg-orange-50/90 text-orange-900 border-orange-200 hover:bg-orange-100', name: '个人兴趣', bg: '#fff7ed', border: '#fed7aa', color: 'orange' },
  { class: 'bg-purple-50/90 text-purple-900 border-purple-200 hover:bg-purple-100', name: '自媒体/副副业', bg: '#faf5ff', border: '#e9d5ff', color: 'purple' },
  { class: 'bg-pink-50/90 text-pink-900 border-pink-200 hover:bg-pink-100', name: '亲子育儿', bg: '#fdf2f8', border: '#fbcfe8', color: 'pink' },
  { class: 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100', name: '日常事务', bg: '#fffbeb', border: '#fef3c7', color: 'amber' }
];

const growthTagPresets = [
  { id: 'deep_work', label: '深度工作', mark: '深', color: 'bg-blue-100 text-blue-900 border-blue-200' },
  { id: 'body', label: '身体', mark: '身', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  { id: 'input', label: '输入', mark: '读', color: 'bg-teal-100 text-teal-900 border-teal-200' },
  { id: 'output', label: '输出', mark: '写', color: 'bg-purple-100 text-purple-900 border-purple-200' },
  { id: 'family', label: '家庭', mark: '家', color: 'bg-pink-100 text-pink-900 border-pink-200' },
  { id: 'recovery', label: '恢复', mark: '息', color: 'bg-amber-100 text-amber-900 border-amber-200' },
  { id: 'spark', label: '灵感', mark: '灵', color: 'bg-orange-100 text-orange-900 border-orange-200' }
];

interface GridCellProps {
  dayIdx: number;
  hour: number;
  cell?: PlannerCell;
  isFocused?: boolean;
  onClick: (dayIdx: number, hour: number) => void;
  onMoveCell: (srcDayIdx: number, srcHour: number, destDayIdx: number, destHour: number) => void;
  habitBgColorClass?: string;
}

const GridCell = React.memo(({ 
  dayIdx, 
  hour, 
  cell, 
  isFocused,
  onClick,
  onMoveCell,
  habitBgColorClass
}: GridCellProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayIdx, hour }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const { dayIdx: srcDayIdx, hour: srcHour } = JSON.parse(dataStr);
        if (srcDayIdx !== dayIdx || srcHour !== hour) {
          onMoveCell(srcDayIdx, srcHour, dayIdx, hour);
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div 
      onClick={() => onClick(dayIdx, hour)}
      draggable={!!cell}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-[40px] px-1 py-0.5 transition-all duration-300 ease-out text-[11px] leading-tight flex flex-col justify-start relative group cursor-pointer overflow-hidden border-b border-[#eae6d8]/60 ${
        isFocused
          ? 'ring-2 ring-techo-teal ring-inset bg-amber-500/[0.08] shadow-xs z-20 font-bold border-teal-500/50'
          : isDragOver 
            ? 'bg-amber-100/90 ring-2 ring-dashed ring-amber-500/80 z-10' 
            : cell 
              ? `${cell.color} hover:opacity-95 active:cursor-grabbing cursor-grab` 
              : `${habitBgColorClass || 'hover:bg-[#fafaf3]'}`
      }`}
      title={cell ? `📌 [可拖拽移动] 点击编辑: 星期${['一', '二', '三', '四', '五', '六', '日'][dayIdx]} ${hour}:00` : `点击添加，或移动其他日程到此 ${hour}:00`}
    >
      {!cell && !isDragOver && (
        <span className="absolute right-1 top-1 text-[#b5a38a]/0 group-hover:text-[#b5a38a]/60 duration-200">
          <Plus size={10} />
        </span>
      )}

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-50/50 text-amber-700 pointer-events-none font-bold text-[9px] animate-pulse">
          🎯 松开移至此
        </div>
      )}

      {cell && !isDragOver && (
        <div className="w-full h-full relative flex flex-col justify-between animate-cell-pop">
          <span className="font-medium inline-block select-text break-words">
            {cell.text}
          </span>
          <div className="flex justify-between items-center select-none mt-0.5">
            <div className="flex items-center gap-0.5 min-w-0">
              <span className="text-[8px] text-[#4d483c]/50 bg-white/40 px-0.5 rounded border border-gray-200/30">☰ 拽</span>
              {cell.tag && (
                <span className={`text-[8px] px-0.5 rounded border bg-white/50 truncate max-w-[46px] ${
                  growthTagPresets.find(tag => tag.id === cell.tag)?.color || 'text-[#7d7768] border-[#d8d1bf]'
                }`}>
                  {growthTagPresets.find(tag => tag.id === cell.tag)?.mark || cell.tag}
                </span>
              )}
            </div>
            <span className="opacity-0 group-hover:opacity-100 duration-150 text-[9px] text-[#48453f] bg-white/70 px-1 rounded-sm border border-[#ccc]">
              编辑
            </span>
          </div>
        </div>
      )}
      {!cell && !isDragOver && (
        <div className="w-full h-full animate-fade-in" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.cell?.text === nextProps.cell?.text &&
    prevProps.cell?.color === nextProps.cell?.color &&
    prevProps.cell?.tag === nextProps.cell?.tag &&
    prevProps.dayIdx === nextProps.dayIdx &&
    prevProps.hour === nextProps.hour &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.habitBgColorClass === nextProps.habitBgColorClass
  );
});

GridCell.displayName = 'GridCell';

interface GridColumnProps {
  dayIdx: number;
  day: { dayName: string; text: string; dateStr: string; isToday: boolean };
  isSelected: boolean;
  hours: number[];
  cells: PlannerCell[];
  focusedHour: number | null;
  onCellClick: (dayIdx: number, hour: number) => void;
  onMoveCell: (srcDayIdx: number, srcHour: number, destDayIdx: number, destHour: number) => void;
  habitBgColorClass?: string;
}

const GridColumn = React.memo(({
  dayIdx,
  day,
  isSelected,
  hours,
  cells,
  focusedHour,
  onCellClick,
  onMoveCell,
  habitBgColorClass
}: GridColumnProps) => {
  return (
    <div 
      className={`col-span-2 border-r last:border-r-0 border-[#eae6d8] relative bg-cover bg-no-repeat divide-y divide-[#eae6d8]/60 transition-all duration-200 ${
        isSelected 
          ? 'bg-amber-500/[0.04]' 
          : day.isToday 
            ? 'bg-techo-pink/[0.01]' 
            : ''
      }`}
    >
      {hours.map((hour) => {
        const cellId = `${dayIdx}-${hour}`;
        const cell = cells.find(c => c.id === cellId);
        const isFocused = focusedHour === hour;
        
        return (
          <GridCell
            key={hour}
            dayIdx={dayIdx}
            hour={hour}
            cell={cell}
            isFocused={isFocused}
            onClick={onCellClick}
            onMoveCell={onMoveCell}
            habitBgColorClass={habitBgColorClass}
          />
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.dayIdx !== nextProps.dayIdx) return false;
  if (prevProps.day.isToday !== nextProps.day.isToday) return false;
  if (prevProps.focusedHour !== nextProps.focusedHour) return false;
  if (prevProps.habitBgColorClass !== nextProps.habitBgColorClass) return false;
  
  const prevRelevant = prevProps.cells.filter(c => c.id.startsWith(`${prevProps.dayIdx}-`));
  const nextRelevant = nextProps.cells.filter(c => c.id.startsWith(`${nextProps.dayIdx}-`));
  
  if (prevRelevant.length !== nextRelevant.length) return false;
  
  for (const prevCell of prevRelevant) {
    const nextCell = nextRelevant.find(c => c.id === prevCell.id);
    if (!nextCell || prevCell.text !== nextCell.text || prevCell.color !== nextCell.color || prevCell.tag !== nextCell.tag) {
      return false;
    }
  }
  
  return true;
});

GridColumn.displayName = 'GridColumn';

export default function TechoGrid({ 
  cells, 
  onSaveCell, 
  onClearCell, 
  todayNotes,
  onSaveTodayNote,
  username = 'Natasha',
  habits = [],
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  weeklySummary,
  onSaveWeeklySummary,
  weekOffset = 0,
}: TechoGridProps) {
  // Dynamic current week calculation
  const today = new Date();
  const currentYear = String(today.getFullYear());
  const chineseMonths = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const currentMonth = chineseMonths[today.getMonth()] + '月';
  const currentMonthNum = today.getMonth() + 1;
  const currentDayNum = today.getDate();
  const currentDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Get Monday of the target week (offset by weekOffset weeks)
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);

  const weekDayNames = [
    { dayName: '月', text: '周一' },
    { dayName: '火', text: '周二' },
    { dayName: '水', text: '周三' },
    { dayName: '木', text: '周四' },
    { dayName: '金', text: '周五' },
    { dayName: '土', text: '周六' },
    { dayName: '日', text: '周日' },
  ];
  const daysOfWeek = weekDayNames.map((d, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return {
      ...d,
      dateStr: `${m}.${dd}`,
      isToday: date.toDateString() === today.toDateString(),
      _date: date,
    };
  });

  // Week number (ISO) — use the target week's monday, not today
  const getISOWeek = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  };
  const weekNumber = getISOWeek(monday);

  // Week range label (e.g. "6月2日 – 8日" or cross-month "5月30日 – 6月5日")
  const mondayDate = daysOfWeek[0]._date;
  const sundayDate = daysOfWeek[6]._date;
  const weekRangeLabel = mondayDate.getMonth() === sundayDate.getMonth()
    ? `${mondayDate.getMonth() + 1}月${mondayDate.getDate()}日 – ${sundayDate.getDate()}日`
    : `${mondayDate.getMonth() + 1}月${mondayDate.getDate()}日 – ${sundayDate.getMonth() + 1}月${sundayDate.getDate()}日`;

  // Today's day-of-week index (0=Mon..6=Sun) within the current week, -1 if today not in this week
  const todayWeekIdx = daysOfWeek.findIndex(d => d.isToday);

  // --- HABIT STREAK & COLOR ASSOCIATIONS ---
  const dailyHabitStats = Array.from({ length: 7 }).map((_, dIdx) => {
    const total = habits.length;
    const done = habits.filter(h => h.history[dIdx] === true).length;
    const isDone = total > 0 && done > 0;
    const ratio = total > 0 ? done / total : 0;
    return { total, done, isDone, ratio };
  });

  // Calculate consecutive combo runs (streaks of active check-in days)
  const comboStreaks = (() => {
    let run = 0;
    const streaks = Array(7).fill(0);
    for (let d = 0; d < 7; d++) {
      if (dailyHabitStats[d].isDone) {
        run++;
        streaks[d] = run;
      } else {
        run = 0;
        streaks[d] = 0;
      }
    }
    
    // Smooth backfill so that all adjacent days in a completed streak share the max value of the run
    const maxStreaks = [...streaks];
    let currentMax = 0;
    for (let d = 6; d >= 0; d--) {
      if (streaks[d] > 0) {
        currentMax = Math.max(currentMax, streaks[d]);
        maxStreaks[d] = currentMax;
      } else {
        currentMax = 0;
      }
    }
    return maxStreaks;
  })();

  const getHabitBgClass = (dayIdx: number) => {
    const stat = dailyHabitStats[dayIdx];
    const streak = comboStreaks[dayIdx];
    if (stat.total === 0 || stat.done === 0) {
      return ''; // default hover class
    }

    // Combo streak of 3+ days: beautiful warm sunset gold
    if (streak >= 3) {
      if (stat.ratio === 1) {
        return 'bg-amber-400/[0.11] hover:bg-amber-400/[0.15] border-r border-amber-300/30';
      } else {
        return 'bg-amber-500/[0.05] hover:bg-amber-500/[0.08] border-r border-[#faeae0]/40';
      }
    }

    // Standard watercolor mint style
    if (stat.ratio === 1) {
      return 'bg-emerald-500/[0.09] hover:bg-emerald-500/[0.13] border-r border-emerald-300/20';
    } else if (stat.ratio >= 0.5) {
      return 'bg-emerald-500/[0.05] hover:bg-emerald-500/[0.08] border-r border-emerald-100/10';
    } else {
      return 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]';
    }
  };

  // Grid configuration: Hour representation
  const hours = Array.from({ length: 24 }).map((_, i) => i);
  // Default scroll to morning hours (e.g. 7:00)
  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTop = 240; // Approx 6:00 AM position (6 * 40px)
    }
  }, []);

  // Local state replicas of props synchronized via requestAnimationFrame to keep transitions buttery smooth during bulk operations
  const [renderedCells, setRenderedCells] = useState<PlannerCell[]>(cells);
  const [renderedTodayNotes, setRenderedTodayNotes] = useState<{ [dayIndex: number]: string }>(todayNotes);

  React.useEffect(() => {
    let animFrameId: number;
    animFrameId = requestAnimationFrame(() => {
      setRenderedCells(cells);
    });
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [cells]);

  React.useEffect(() => {
    let animFrameId: number;
    animFrameId = requestAnimationFrame(() => {
      setRenderedTodayNotes(todayNotes);
    });
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [todayNotes]);

  // Modal edit state
  const [editingSlot, setEditingSlot] = useState<{ dayIndex: number; hour: number } | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState(colorPresets[0].class);
  const [editTag, setEditTag] = useState<string>('deep_work');

  // Today Notes edit states
  const [editingNoteDay, setEditingNoteDay] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  // Selected Day on Mini Calendar
  const [selectedDay, setSelectedDay] = useState<number>(todayWeekIdx >= 0 ? todayWeekIdx + 1 : 1);
  const [selectedDayNote, setSelectedDayNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isSummaryEditing, setIsSummaryEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<WeeklySummary>(weeklySummary);

  React.useEffect(() => {
    setSummaryDraft(weeklySummary);
  }, [weeklySummary]);

  // --- CELEBRATION FEEDBACK STATE & SIMULATOR CRITERION ---
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(3);
  const [confettis, setConfettis] = useState<any[]>([]);

  const handleToggleHabitWithFeedback = React.useCallback((habitId: string, dIdx: number) => {
    // 1. Simulate habits to accurately check if the combo streak will be >= 3
    const simulatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const nextHistory = { ...h.history };
        nextHistory[dIdx] = !nextHistory[dIdx];
        return { ...h, history: nextHistory };
      }
      return h;
    });

    const simulatedStats = Array.from({ length: 7 }).map((_, d) => {
      const total = simulatedHabits.length;
      const done = simulatedHabits.filter(h => h.history[d] === true).length;
      const isDone = total > 0 && done > 0;
      return { isDone };
    });

    let run = 0;
    const streaks = Array(7).fill(0);
    for (let d = 0; d < 7; d++) {
      if (simulatedStats[d].isDone) {
        run++;
        streaks[d] = run;
      } else {
        run = 0;
        streaks[d] = 0;
      }
    }
    
    // Smooth backfill for simulated max streaks
    const simulatedMaxStreaks = [...streaks];
    let currentMax = 0;
    for (let d = 6; d >= 0; d--) {
      if (streaks[d] > 0) {
        currentMax = Math.max(currentMax, streaks[d]);
        simulatedMaxStreaks[d] = currentMax;
      } else {
        currentMax = 0;
      }
    }

    const simulatedMax = Math.max(...simulatedMaxStreaks);
    const isChecking = !habits.find(h => h.id === habitId)?.history[dIdx];

    if (isChecking && simulatedMax >= 3) {
      setCelebrationStreak(simulatedMax);
      
      const colors = ['#e09453', '#d97d8c', '#4b8f8c', '#7090b0', '#f1c40f', '#2ecc71', '#9b59b6'];
      const shapes = ['🌸', '✨', '💖', '⭐', '🎈', '🍬', '🍀', '🌟'];
      const items = Array.from({ length: 32 }).map((_, idx) => ({
        id: idx + Date.now(),
        x: Math.random() * 100, // horizontal start percentage
        size: Math.random() * 10 + 12, // 12px to 22px
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        duration: Math.random() * 2.0 + 1.6, // duration in seconds
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 80 // drift distance
      }));

      setConfettis(items);
      setCelebrationActive(true);
      
      // Auto dismiss
      const timeoutId = setTimeout(() => {
        setCelebrationActive(false);
      }, 3800);
    }

    onToggleHabit(habitId, dIdx);
  }, [habits, onToggleHabit]);

  // Keyboard focused hour inside selectedDay column
  const [keyboardFocusedHour, setKeyboardFocusedHour] = useState<number>(8); // Defaults to 8:00 AM

  // Smooth wrapper using requestAnimationFrame to schedule day changes without UI lag
  const updateSelectedDay = React.useCallback((dayIndex: number) => {
    requestAnimationFrame(() => {
      setSelectedDay(dayIndex);
    });
  }, []);

  React.useEffect(() => {
    setSelectedDayNote(renderedTodayNotes[selectedDay - 1] || '');
  }, [selectedDay, renderedTodayNotes]);

  const handleCellClick = React.useCallback((dayIndex: number, hour: number) => {
    const existing = renderedCells.find(c => c.id === `${dayIndex}-${hour}`);
    setEditingSlot({ dayIndex, hour });
    setEditText(existing ? existing.text : '');
    setEditColor(existing?.color || colorPresets[0].class);
    setEditTag(existing?.tag || 'deep_work');
  }, [renderedCells]);

  // Sync keyboard focus column with selectedDay dynamically
  React.useEffect(() => {
    // Keep keyboardFocusedHour within valid [0..23] boundary
    setKeyboardFocusedHour(prev => (prev < 0 ? 0 : prev > 23 ? 23 : prev));
  }, [selectedDay]);

  // Keep focused time block fully visible during keyboard navigation
  React.useEffect(() => {
    if (hourScrollRef.current) {
      const elementHeight = 40;
      const targetScrollTop = keyboardFocusedHour * elementHeight;
      const currentScrollTop = hourScrollRef.current.scrollTop;
      const viewportHeight = hourScrollRef.current.clientHeight || 460;

      // If active cell is lower than scroll boundary
      if (targetScrollTop + elementHeight > currentScrollTop + viewportHeight) {
        hourScrollRef.current.scrollTop = targetScrollTop + elementHeight - viewportHeight + 12;
      }
      // If active cell is higher than scroll boundary
      else if (targetScrollTop < currentScrollTop) {
        hourScrollRef.current.scrollTop = targetScrollTop - 12;
      }
    }
  }, [keyboardFocusedHour]);

  // Window-level global physical keyboard monitor
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing shortcuts if users are actively formatting note or adding task text
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || 
         activeEl.tagName === 'TEXTAREA' || 
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft': {
          e.preventDefault();
          setSelectedDay(prev => {
            const next = prev - 1;
            return next < 1 ? 7 : next;
          });
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          setSelectedDay(prev => {
            const next = prev + 1;
            return next > 7 ? 1 : next;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setKeyboardFocusedHour(prev => {
            const next = prev - 1;
            return next < 0 ? 23 : next;
          });
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setKeyboardFocusedHour(prev => {
            const next = prev + 1;
            return next > 23 ? 0 : next;
          });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const targetDayIdx = selectedDay - 1;
          handleCellClick(targetDayIdx, keyboardFocusedHour);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDay, keyboardFocusedHour, handleCellClick]);

  const handleMoveCell = React.useCallback((srcDayIdx: number, srcHour: number, destDayIdx: number, destHour: number) => {
    const sourceCell = renderedCells.find(c => c.id === `${srcDayIdx}-${srcHour}`);
    if (sourceCell) {
      // Snappily update local state replica to offer instant feedback
      const localFiltered = renderedCells
        .filter(c => c.id !== `${srcDayIdx}-${srcHour}`)
        .filter(c => c.id !== `${destDayIdx}-${destHour}`);
      const updatedLocal = [
        ...localFiltered,
        {
          id: `${destDayIdx}-${destHour}`,
          text: sourceCell.text,
          color: sourceCell.color,
          tag: sourceCell.tag
        }
      ];
      setRenderedCells(updatedLocal);

      // Trigger parent changes
      onClearCell(srcDayIdx, srcHour);
      onSaveCell(destDayIdx, destHour, sourceCell.text, sourceCell.color, sourceCell.tag);
    }
  }, [renderedCells, onClearCell, onSaveCell]);

  const handleSaveCellForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      if (editText.trim()) {
        onSaveCell(editingSlot.dayIndex, editingSlot.hour, editText, editColor, editTag);
      } else {
        onClearCell(editingSlot.dayIndex, editingSlot.hour);
      }
      setEditingSlot(null);
    }
  };

  const startEditNote = (dayIndex: number) => {
    updateSelectedDay(dayIndex + 1);
    setEditingNoteDay(dayIndex);
    setNoteText(renderedTodayNotes[dayIndex] || '');
  };

  const handleSaveNote = () => {
    if (editingNoteDay !== null) {
      onSaveTodayNote(editingNoteDay, noteText);
      setEditingNoteDay(null);
    }
  };

  const updateSummaryPriority = (index: number, value: string) => {
    setSummaryDraft(prev => {
      const priorities = [...prev.priorities];
      priorities[index] = value;
      return { ...prev, priorities };
    });
  };

  const handleSaveSummary = () => {
    const normalized: WeeklySummary = {
      theme: summaryDraft.theme.trim() || '给这一周留一个方向',
      priorities: Array.from({ length: 3 }).map((_, index) => summaryDraft.priorities[index]?.trim() || ''),
      practice: summaryDraft.practice.trim(),
      reminder: summaryDraft.reminder.trim(),
      reviewQuestion: summaryDraft.reviewQuestion.trim()
    };
    onSaveWeeklySummary(normalized);
    setIsSummaryEditing(false);
  };

  const handleCancelSummary = () => {
    setSummaryDraft(weeklySummary);
    setIsSummaryEditing(false);
  };

  const weeklyTagStats = growthTagPresets.map(tag => {
    const count = renderedCells.filter(cell => cell.tag === tag.id).length;
    return { ...tag, count };
  });
  const untaggedCount = renderedCells.filter(cell => !cell.tag).length;
  const totalTaggedSlots = weeklyTagStats.reduce((sum, tag) => sum + tag.count, 0);
  const totalGrowthSlots = totalTaggedSlots + untaggedCount;
  const topGrowthTag = weeklyTagStats.reduce((top, tag) => tag.count > top.count ? tag : top, weeklyTagStats[0]);

  return (
    <div id="techo-grid-container" className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      {/* LEFT COLUMN: Mini Calendar & Stats Info (3-cols on lg) */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Paper Planner Cover Badge */}
        <div className="bg-[#f5f3e9] border border-[#d6cfbe] p-4 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
          {/* Subtle perforations on the top */}
          <div className="absolute top-0 left-0 right-0 h-1 flex justify-around px-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] -mt-0.5" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] -mt-0.5" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] -mt-0.5" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] -mt-0.5" />
          </div>
          <div className="font-display tracking-[0.25em] text-md font-bold text-[#8a8069] mt-1 uppercase">
            JIBUN TECHO
          </div>
          <div className="h-[2px] w-12 bg-[#8a8069]/30 my-1"></div>
          <div className="text-xs text-[#8a816b] font-mono">自我成长手帐 {currentYear}</div>
          <div className="text-[10px] bg-[#8a816b]/10 text-[#8a816b] px-2 py-0.5 rounded-full font-mono font-bold mt-1.5 uppercase tracking-wider">
            ✍️ {username}'s Edition
          </div>
        </div>

        {/* Mini Calendar UI */}
        <div className="bg-white border-2 border-[#d3cfc3] p-4 rounded-lg shadow-xs relative">
          {/* Perforation holes detailing along left side */}
          <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-4 -ml-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#e2dfd5] border border-white mx-auto shadow-inner" />
            ))}
          </div>

          <div className="pl-3">
            <div className="flex items-center justify-between mb-3 border-b-2 border-[#eae6d8] pb-2">
              <span className="font-display font-semibold text-[#4a473e] text-sm flex items-center gap-1.5">
                <Calendar size={14} className="text-[#a19c8d]" />
                {currentYear} {currentMonth.replace('月', '')} 月 ({['January','February','March','April','May','June','July','August','September','October','November','December'][today.getMonth()]})
              </span>
              <div className="flex gap-1">
                <button type="button" className="p-0.5 hover:bg-[#eae6d8] rounded transition-colors text-[#6e685a]" disabled={true}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" className="p-0.5 hover:bg-[#eae6d8] rounded transition-colors text-[#6e685a]" disabled={true}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Mini calendar grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium font-mono select-none">
              {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                <div key={i} className={`p-1 font-sans ${i === 0 ? 'text-[#d97d8c]' : i === 6 ? 'text-techo-blue' : 'text-[#8c8577]'}`}>
                  {day}
                </div>
              ))}
              {/* Offset for first day of month */}
              {Array.from({ length: (() => { const d = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); return d === 0 ? 1 : d - 1 === -1 ? 6 : d - 1; })() }).map((_, i) => (
                <div key={`offset-${i}`} className="p-1" />
              ))}
              {Array.from({ length: currentDaysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const thisDate = new Date(today.getFullYear(), today.getMonth(), dayNum);
                const isCurrentWeek = thisDate >= mondayDate && thisDate <= sundayDate;
                const isToday = dayNum === currentDayNum;
                const isSelected = dayNum === selectedDay;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateSelectedDay(dayNum)}
                    className={`p-1 rounded-sm flex items-center justify-center transition-all cursor-pointer text-center outline-none ${
                      isToday 
                        ? `bg-techo-pink text-white font-black shadow-xs ring-2 ${isSelected ? 'ring-techo-blue' : 'ring-transparent'}` 
                        : isSelected
                          ? 'bg-[#ffe4b5] text-amber-900 font-extrabold border-2 border-amber-600 scale-115 shadow-xs z-10'
                          : isCurrentWeek 
                            ? 'bg-[#f4efe0] hover:bg-techo-teal/15 text-[#4a473e] font-semibold border border-[#d6cfb8]/50' 
                            : 'text-[#cbc4b8] hover:text-[#4a473e] hover:bg-[#eae6d8]/40'
                    }`}
                    title={`点击选中: ${currentMonthNum}月${dayNum}日 / Select ${['January','February','March','April','May','June','July','August','September','October','November','December'][today.getMonth()]} ${dayNum}`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Quick Memo & Instructions */}
            <div className="mt-4 p-3 border-2 border-[#eae6d8] rounded-md bg-[#fafaf6] text-[11px] text-[#7d7768] space-y-2">
              <div className="flex items-center justify-between border-b border-[#eae6d8] pb-1.5">
                <span className="font-display font-black text-xs text-[#4a473e] flex items-center gap-1 leading-none">
                  📅 {currentMonthNum}月{selectedDay}日 • {
                    (() => { const idx = daysOfWeek.findIndex(d => d._date.getDate() === selectedDay && d._date.getMonth() === today.getMonth()); return idx >= 0 ? `${daysOfWeek[idx].text}便签` : '日面快记/Memo'; })()
                  }
                </span>
                <span className="text-[9px] bg-techo-teal/15 text-techo-teal font-sans px-1 rounded-sm font-bold scale-95 origin-right">
                  {daysOfWeek.some(d => d._date.getDate() === selectedDay && d._date.getMonth() === today.getMonth()) ? '✨ 周视图联动' : '💭 自由写本'}
                </span>
              </div>
              
              <div className="space-y-1">
                <textarea
                  id={`side-note-input-${selectedDay}`}
                  value={selectedDayNote}
                  onChange={(e) => setSelectedDayNote(e.target.value)}
                  placeholder="写下这天的突发灵感、随手记、或重点规划..."
                  className="w-full text-xs p-1.5 bg-white border border-[#beb9ab] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal resize-none h-[64px] font-sans text-gray-700 leading-normal"
                />
                <div className="flex justify-between items-center">
                  <div className="min-h-4 flex items-center">
                    {saveSuccess ? (
                      <span className="text-[10px] text-emerald-600 font-extrabold animate-bounce flex items-center gap-0.5">
                        ✓ 记事已实时存入手帐!
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-gray-400">
                        {selectedDayNote ? `${selectedDayNote.length} 字` : '暂无写件 / Empty'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSaveTodayNote(selectedDay - 1, selectedDayNote);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }}
                    className="bg-techo-teal hover:bg-[#3d7a77] text-[10px] text-white py-1 px-2.5 rounded font-black cursor-pointer transition-colors active:scale-95"
                  >
                    保存该格
                  </button>
                </div>
              </div>

              <div className="pt-1.5 border-t border-dashed border-[#eae6d8] text-[9.5px] text-[#a59d8c] flex items-start gap-1">
                <span className="text-techo-teal font-black">💡 双联动:</span>
                <p className="leading-normal">
                  点击日历日期或<b>右侧周表头</b>皆可切换。若选中1~7号(第一周)，点击保存也会动态呈现在右下角！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 每日习惯追踪 (Daily Habit Tracker) Card */}
        <div className="bg-white border-2 border-[#d3cfc3] p-4 rounded-lg shadow-xs relative">
          {/* Perforation holes detailing along left side */}
          <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-4 -ml-1 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#e2dfd5] border border-white mx-auto shadow-inner" />
            ))}
          </div>

          <div className="pl-3">
            <div className="flex items-center justify-between mb-3 border-b-2 border-[#eae6d8] pb-2">
              <span className="font-display font-semibold text-[#4a473e] text-xs flex items-center gap-1.5">
                <Flame size={15} className={`${Math.max(0, ...comboStreaks) >= 3 ? 'text-amber-500 animate-pulse' : 'text-[#a19c8d]'}`} />
                <span>每日习惯追踪 / Habit Tracker</span>
              </span>
              {Math.max(0, ...comboStreaks) > 0 && (
                <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-bounce">
                  🔥 {Math.max(0, ...comboStreaks)}连击
                </span>
              )}
            </div>

            {/* Streak Motivation Info */}
            <div className={`p-2.5 rounded text-[10.5px] leading-relaxed mb-3 ${
              Math.max(0, ...comboStreaks) >= 3 
                ? 'bg-amber-500/10 border border-amber-200/50 text-amber-900 font-medium' 
                : 'bg-[#fafae6] border border-[#ece7cd] text-[#7d755c]'
            }`}>
              {Math.max(0, ...comboStreaks) >= 3 ? (
                <span>
                  🚀 <b>自律高燃！</b>已达成连续 <b>{Math.max(0, ...comboStreaks)}</b> 天习惯打卡连击。右侧 24H 时间网格已被点亮渲染，表露着自律高能！
                </span>
              ) : Math.max(0, ...comboStreaks) > 0 ? (
                <span>
                  ✨ 已开启连续 <b>{Math.max(0, ...comboStreaks)}</b> 天的打卡连击！打卡率越高，对应的周日程背景色渲染越深、质感越棒哦。
                </span>
              ) : (
                <span>
                  ❄️ 暂无活跃连击。通过标记以下打卡项，可在右侧周时间线上形成漂亮的<b>自律水彩网格</b>，开启自律连击！
                </span>
              )}
            </div>

            {/* D3-based dynamic habit Completion Rate Trend Line Chart */}
            <HabitTrendChart habits={habits} />

            {/* Habit list grid */}
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-4 bg-[#fbfbf9] rounded border border-dashed border-[#e4dfd3] text-[#a59d88] text-[11px]">
                  还没有自定义习惯项哦。在下方添加一个吧！
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                  <div className="grid grid-cols-10 text-[9.5px] text-[#8e8571] font-mono border-b border-[#eae6d8]/80 pb-1 font-bold text-center">
                    <div className="col-span-3 text-left pl-1">习惯名称</div>
                    {['一', '二', '三', '四', '五', '六', '日'].map((dText, idx) => (
                      <div 
                        key={idx} 
                        className={`transition-colors py-0.5 rounded ${
                          selectedDay - 1 === idx 
                            ? 'bg-[#ffe4b5] text-amber-900 font-extrabold outline-none ring-1 ring-amber-400' 
                            : ''
                        }`}
                        title={selectedDay - 1 === idx ? '当前选中日期天' : ''}
                      >
                        {dText}
                      </div>
                    ))}
                  </div>

                  {habits.map((habit) => {
                    return (
                      <div key={habit.id} className="grid grid-cols-10 items-center gap-y-1 py-1 hover:bg-[#faf9f5] rounded transition-colors group">
                        
                        {/* Habit Title with inline delete on hover */}
                        <div className="col-span-3 flex items-center justify-between min-w-0 pr-1 pl-1">
                          <span className="text-[11px] text-[#4a4539] font-medium truncate" title={habit.name}>
                            {habit.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-red-500 hover:text-red-750 hover:bg-red-50 rounded cursor-pointer"
                            title={`删除习惯: ${habit.name}`}
                          >
                            <Trash2 size={11} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Checkboxes per weekday */}
                        {Array.from({ length: 7 }).map((_, dIdx) => {
                          const checked = habit.history[dIdx] === true;
                          const isSelCol = (selectedDay - 1 === dIdx);
                          return (
                            <div key={dIdx} className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleHabitWithFeedback(habit.id, dIdx)}
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                  checked 
                                    ? comboStreaks[dIdx] >= 3
                                      ? 'bg-amber-500 border border-amber-600 text-white shadow-xxs scale-110'
                                      : 'bg-emerald-500 border border-emerald-600 text-white shadow-xxs'
                                    : isSelCol
                                      ? 'bg-white border-2 border-amber-400 hover:border-amber-500'
                                      : 'bg-white border border-[#beb9ab] hover:border-emerald-500'
                                }`}
                                title={`点击标记: 星期${['一', '二', '三', '四', '五', '六', '日'][dIdx]}`}
                              >
                                {checked && <CheckCircle2 size={10} strokeWidth={4} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Creator input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newHabitName.trim()) return;
                  onAddHabit(newHabitName.trim());
                  setNewHabitName('');
                }} 
                className="flex gap-1 pt-2 border-t border-dashed border-[#eae6d8]"
              >
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="➕ 增加新打卡项 (如：每日背单词)..."
                  className="flex-1 text-xs px-2 py-1 bg-white border border-[#beb9ab] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal placeholder-[#beb9ab]"
                />
                <button
                  type="submit"
                  className="bg-techo-teal hover:bg-[#3d7a77] text-white py-1 px-3 rounded font-black text-xs cursor-pointer transition-colors active:scale-95 flex items-center gap-0.5"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>添加</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 📖 手帐说明 (Guide) Card */}
        <div className="bg-[#fcfbfa] border border-[#d3cfc3] p-3.5 rounded-lg text-xs text-[#5c5647] space-y-1.5 shadow-xxs font-sans">
          <h4 className="font-display font-black text-xs text-[#4a473e] flex items-center gap-1.5 border-b border-[#eae6d8] pb-1.5">
            📖 手帐说明 (Guide)
          </h4>
          <ul className="space-y-1.5 text-[#5c5647] leading-relaxed list-disc list-inside">
            <li><b>24小时周计划网格</b>：右侧为核心的垂直时间轴，可以记录每小时的任务。</li>
            <li><b>轻量激活书写</b>：单击工作区任意格子即可快速输入、选择高亮分类并存入周表。</li>
            <li><b>经典国誉手帐配色</b>：采用精美奶油纸质底色与高质感荧光标注。</li>
            <li>
              <b>⌨️ 键盘高效联动</b>：
              <div className="pl-4 mt-1 space-y-1 font-sans text-[10px] text-[#716955] bg-[#fbfaf5] p-2 rounded border border-[#eae6d8]/60">
                <div>• <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-[9.5px]">←</kbd> / <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-[9.5px]">→</kbd> 键：横向切换选中日期列</div>
                <div>• <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-[9.5px]">↑</kbd> / <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-[9.5px]">↓</kbd> 键：纵向切换活动时间块</div>
                <div>• <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-[9.5px]">Enter</kbd> 键：快速唤醒所选时间格子编辑</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Highlight Color Presets Legend */}
        <div className="bg-white border border-[#d5cfbe] p-3 rounded-lg shadow-xxs">
          <h4 className="text-xs font-semibold text-[#5a554a] mb-2 font-display">🎨 荧光分类笔 legend</h4>
          <div className="space-y-1.5">
            {colorPresets.map((color, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-sm border ${color.class.split(' ')[2]} ${color.class.split(' ')[0]} inline-block`} />
                <span className="text-[#645f52]">{color.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 24-HOUR WEEK VIEW (9-cols on lg) */}
      <div className="lg:col-span-9 bg-white border-2 border-[#d3cfc3] rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[680px]">
        
        {/* WEEK VIEW HEADER: Current Week range */}
        <div className="bg-[#f5f3e9] px-4 py-3 border-b-2 border-[#e5e2d6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-[#8a816c] text-white text-xs px-2 py-0.5 rounded-sm font-mono tracking-wider font-semibold">
              {currentYear}
            </span>
            <h2 className="font-display font-bold text-[#48453f] text-md flex items-center gap-2">
              <span>{weekRangeLabel}</span>
              <span className="text-[#a19c8d] font-normal text-xs font-sans">(第 {weekNumber} 周)</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#827b68] font-medium bg-white/70 border border-[#e3dfd3] px-2 py-1 rounded">
            <Clock size={12} className="text-techo-blue animate-pulse" />
            {weekOffset === 0
              ? <span>当前时间线: {currentYear}.{String(currentMonthNum).padStart(2,'0')}.{String(currentDayNum).padStart(2,'0')} ({daysOfWeek.find(d => d.isToday)?.text || '本周'})</span>
              : <span>计划周: {weekRangeLabel} &nbsp;·&nbsp; 第 {weekNumber} 周</span>
            }
          </div>
        </div>

        {/* WEEKLY GROWTH SUMMARY: intention card before the time grid */}
        <div className="bg-[#fffdf8] border-b-2 border-[#eae6d8] px-4 py-3 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.45] techo-grid-bg" />
          <div className="relative grid grid-cols-1 xl:grid-cols-12 gap-3">
            <div className="xl:col-span-4 border border-[#d8d1bf] bg-white/80 rounded-md p-3 shadow-xxs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.18em] uppercase text-[#9a907d] font-bold">
                    <Sparkles size={11} className="text-techo-teal" />
                    Week Intention
                  </div>
                  {isSummaryEditing ? (
                    <input
                      value={summaryDraft.theme}
                      onChange={(e) => setSummaryDraft(prev => ({ ...prev, theme: e.target.value }))}
                      className="mt-1 w-full rounded border border-[#c7bfac] bg-[#fffefb] px-2 py-1 text-sm font-display font-black text-[#3f3a31] focus:outline-none focus:ring-1 focus:ring-techo-teal"
                      placeholder="本周主题"
                    />
                  ) : (
                    <h3 className="mt-1 text-base font-display font-black text-[#3f3a31] leading-snug">
                      {weeklySummary.theme}
                    </h3>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => isSummaryEditing ? handleCancelSummary() : setIsSummaryEditing(true)}
                  className="shrink-0 rounded border border-[#d8d1bf] bg-[#fbfaf5] p-1.5 text-[#6f6858] hover:bg-[#f0eadb] transition-colors"
                  title={isSummaryEditing ? '取消编辑' : '编辑本周成长摘要'}
                >
                  {isSummaryEditing ? <X size={13} /> : <PenLine size={13} />}
                </button>
              </div>

              <div className="mt-3 border-t border-dashed border-[#e2dccd] pt-2">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#9a907d] font-bold mb-1">
                  Practice
                </div>
                {isSummaryEditing ? (
                  <input
                    value={summaryDraft.practice}
                    onChange={(e) => setSummaryDraft(prev => ({ ...prev, practice: e.target.value }))}
                    className="w-full rounded border border-[#d8d1bf] bg-white px-2 py-1 text-xs text-[#514b40] focus:outline-none focus:ring-1 focus:ring-techo-teal"
                    placeholder="本周想练习的能力"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-[#514b40]">{weeklySummary.practice}</p>
                )}
              </div>
            </div>

            <div className="xl:col-span-5 border border-[#d8d1bf] bg-white/80 rounded-md p-3 shadow-xxs">
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.16em] uppercase text-[#9a907d] font-bold mb-2">
                <Target size={11} className="text-techo-pink" />
                Three Things That Matter
              </div>
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-[22px_1fr] gap-2 items-start">
                    <span className="h-5 rounded-sm bg-[#f4efe0] border border-[#ded6c4] text-[9px] font-mono font-black text-[#8a816c] flex items-center justify-center">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isSummaryEditing ? (
                      <input
                        value={summaryDraft.priorities[index] || ''}
                        onChange={(e) => updateSummaryPriority(index, e.target.value)}
                        className="w-full rounded border border-[#d8d1bf] bg-white px-2 py-1 text-xs text-[#514b40] focus:outline-none focus:ring-1 focus:ring-techo-teal"
                        placeholder={`重要事项 ${index + 1}`}
                      />
                    ) : (
                      <p className="min-h-5 text-xs leading-relaxed text-[#514b40] pt-0.5">
                        {weeklySummary.priorities[index] || <span className="italic text-[#bbb2a0]">留一个真正重要的位置</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-3 border border-[#d8d1bf] bg-[#fbfaf5]/90 rounded-md p-3 shadow-xxs flex flex-col gap-2">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#9a907d] font-bold mb-1">
                  Reminder
                </div>
                {isSummaryEditing ? (
                  <textarea
                    value={summaryDraft.reminder}
                    onChange={(e) => setSummaryDraft(prev => ({ ...prev, reminder: e.target.value }))}
                    className="w-full h-[54px] resize-none rounded border border-[#d8d1bf] bg-white px-2 py-1 text-xs leading-relaxed text-[#514b40] focus:outline-none focus:ring-1 focus:ring-techo-teal"
                    placeholder="给自己的提醒"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-[#514b40]">{weeklySummary.reminder}</p>
                )}
              </div>

              <div className="border-t border-dashed border-[#ded6c4] pt-2">
                <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#9a907d] font-bold mb-1">
                  Review Question
                </div>
                {isSummaryEditing ? (
                  <input
                    value={summaryDraft.reviewQuestion}
                    onChange={(e) => setSummaryDraft(prev => ({ ...prev, reviewQuestion: e.target.value }))}
                    className="w-full rounded border border-[#d8d1bf] bg-white px-2 py-1 text-xs text-[#514b40] focus:outline-none focus:ring-1 focus:ring-techo-teal"
                    placeholder="周末复盘问题"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-[#514b40]">{weeklySummary.reviewQuestion}</p>
                )}
              </div>

              {isSummaryEditing && (
                <button
                  type="button"
                  onClick={handleSaveSummary}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 rounded bg-[#8a816c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#716955] transition-colors"
                >
                  <Save size={12} />
                  保存本周摘要
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GROWTH TIME MIX: week-level tag distribution */}
        <div className="bg-[#fbfaf5] border-b-2 border-[#eae6d8] px-4 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="xl:w-[190px] shrink-0">
              <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.16em] text-[#9a907d] font-bold">
                <BarChart3 size={12} className="text-techo-blue" />
                Growth Time Mix
              </div>
              <div className="text-xs text-[#5d5648] mt-1 leading-relaxed">
                {totalGrowthSlots > 0 ? (
                  <span>本周已标记 <b>{totalGrowthSlots}</b> 个时段，重心偏向 <b>{topGrowthTag.label}</b>。</span>
                ) : (
                  <span>给时间块加标签后，这里会形成一条温柔的成长配比。</span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="h-3 rounded-full overflow-hidden border border-[#d8d1bf] bg-white flex">
                {totalGrowthSlots > 0 ? (
                  weeklyTagStats.map(tag => {
                    const width = `${(tag.count / totalGrowthSlots) * 100}%`;
                    return tag.count > 0 ? (
                      <div
                        key={tag.id}
                        className={`${tag.color} border-r border-white/70 last:border-r-0`}
                        style={{ width }}
                        title={`${tag.label}: ${tag.count} 个时段`}
                      />
                    ) : null;
                  })
                ) : (
                  <div className="w-full bg-[#f4efe0]" />
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {weeklyTagStats.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tag.color} ${
                      tag.count === 0 ? 'opacity-45' : ''
                    }`}
                  >
                    <span className="font-mono text-[9px]">{tag.mark}</span>
                    <span>{tag.label}</span>
                    <span className="font-mono text-[9px]">{tag.count}</span>
                  </span>
                ))}
                {untaggedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded border border-[#d8d1bf] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#8a816c]">
                    未标记 {untaggedCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TIME GRID OUTER CONTAINER */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          <AnimatePresence>
            {celebrationActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 z-45 overflow-hidden flex flex-col items-center justify-start pt-8 bg-amber-500/[0.03]"
              >
                {/* 1. Falling stationery confetti sparkles */}
                {confettis.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ 
                      y: -40, 
                      x: `${item.x}%`, 
                      opacity: 0, 
                      scale: 0.2, 
                      rotate: item.rotate 
                    }}
                    animate={{ 
                      y: '480px', 
                      x: `calc(${item.x}% + ${item.drift}px)`, 
                      opacity: [0, 1, 1, 0], 
                      scale: [0.2, 1, 1, 0.4],
                      rotate: item.rotate + 360 
                    }}
                    transition={{
                      duration: item.duration,
                      delay: item.delay,
                      ease: "easeOut"
                    }}
                    style={{
                      position: 'absolute',
                      fontSize: `${item.size}px`,
                      color: item.color,
                      transformOrigin: 'center',
                      textShadow: '0 1.5px 3px rgba(0,0,0,0.12)'
                    }}
                  >
                    {item.shape}
                  </motion.div>
                ))}

                {/* 2. Floating congratulations washi tape/badge */}
                <motion.div
                  initial={{ y: -80, scale: 0.7, opacity: 0, rotate: -2 }}
                  animate={{ y: 0, scale: 1, opacity: 1, rotate: [3, -2, 1, 0] }}
                  exit={{ y: -60, scale: 0.8, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 10,
                    delay: 0.1 
                  }}
                  className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-stone-900 px-5 py-2.5 rounded border-2 border-[#b0873a] shadow-md flex items-center gap-2 select-none relative"
                  style={{
                    boxShadow: '0 5px 12px -1px rgba(180, 135, 58, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                    backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12) 10px, transparent 10px, transparent 20px)'
                  }}
                >
                  {/* Left hand-drawn style clip */}
                  <span className="absolute -left-1.5 top-2 w-3.5 h-5 bg-stone-700/20 backdrop-blur-xs border-r border-white/20 transform -rotate-12 rounded-xs" />
                  {/* Right hand-drawn style clip */}
                  <span className="absolute -right-1.5 top-2 w-3.5 h-5 bg-stone-700/20 backdrop-blur-xs border-l border-white/20 transform rotate-12 rounded-xs" />

                  <span className="text-sm">🔥</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[8.5px] uppercase font-bold tracking-widest text-[#72541b]/90 font-mono leading-none">STREAK UNLOCKED!</span>
                    <span className="text-xs font-black font-sans text-stone-900 tracking-wide mt-0.5">自律高能！{celebrationStreak}天打卡连击达成！</span>
                  </div>
                  <span className="text-sm">✨</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Micro-Calendar Heatmap Bar (Weekly Status Linkage) */}
          <div className="grid grid-cols-15 border-b-2 border-[#eae6d8] bg-[#fdfdfb] select-none text-xs border-t border-[#eae6d8]">
            {/* Left corner label */}
            <div className="col-span-1 border-r border-[#eae6d8] py-2 text-[9px] text-[#8a8069] font-black flex flex-col items-center justify-center text-center bg-[#fbfaf6] leading-none">
              <span className="mb-0.5 text-[11px]">📊</span>
              <span>周度度量</span>
            </div>
            
            {/* 7 Days state indicators aligned exactly with column headers */}
            {daysOfWeek.map((day, idx) => {
              const dayCells = renderedCells.filter(c => c.id.startsWith(`${idx}-`));
              const taskCount = dayCells.length;
              const hasNote = !!renderedTodayNotes[idx];
              const isSelected = (selectedDay === idx + 1);
              
              // Calculate custom stationery heat colors
              let heatBgClass = 'bg-white text-[#8c8577] hover:bg-[#fafaf3]';
              let statusLabel = '写手账...';
              
              if (hasNote && taskCount >= 4) {
                heatBgClass = 'bg-[#fdf2f8] text-techo-pink border-b border-techo-pink hover:bg-[#fae1ee] font-medium';
                statusLabel = '极为充实 🌸';
              } else if (hasNote && taskCount > 0) {
                heatBgClass = 'bg-[#f0fdfa] text-techo-teal border-b border-[#4b8f8c]/40 hover:bg-[#ccfbf1] font-medium';
                statusLabel = '今日充实 🌿';
              } else if (hasNote) {
                heatBgClass = 'bg-[#fdf2f8]/70 text-[#c86273] hover:bg-[#fdeff5]';
                statusLabel = '有便签 📝';
              } else if (taskCount >= 4) {
                heatBgClass = 'bg-[#f0f4f8] text-techo-blue border-b border-techo-blue/30 hover:bg-[#e1ecf5]';
                statusLabel = `${taskCount}项任务 ⚡`;
              } else if (taskCount > 0) {
                heatBgClass = 'bg-[#fbfaf5] text-[#5e5a51] hover:bg-[#f3efdf] border-b border-[#dcd7c9]';
                statusLabel = `${taskCount}项活动`;
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateSelectedDay(idx + 1)}
                  className={`col-span-2 border-r last:border-r-0 border-[#eae6d8] py-1.5 px-1 flex flex-col justify-between items-center cursor-pointer transition-all focus:outline-none select-none text-center relative ${heatBgClass} ${
                    isSelected ? 'ring-2 ring-inset ring-amber-500 font-extrabold bg-[#fffbeb]' : ''
                  }`}
                  title={`点击速查 ${daysOfWeek[idx]._date.getMonth()+1}月${daysOfWeek[idx]._date.getDate()}日 (${day.text})\n包含 ${taskCount} 个计划时段，${hasNote ? '已' : '未'}录入日记便签。`}
                >
                  {/* Miniature Date indicator */}
                  <div className="w-full flex justify-between items-center text-[8.5px] text-gray-400 font-mono scale-95 origin-top mb-1">
                    <span>{day.dateStr}</span>
                    <span className="font-semibold">{day.text}</span>
                  </div>

                  {/* Micro Visual Stamps & Dots */}
                  <div className="flex gap-1 items-center justify-center my-0.5 h-3">
                    {hasNote && (
                      <span className="text-[10px] scale-110" title="今日手账：有随笔">
                        📝
                      </span>
                    )}
                    {taskCount > 0 ? (
                      <div className="flex gap-0.5 items-center">
                        {Array.from({ length: Math.min(3, taskCount) }).map((_, dIdx) => (
                          <span 
                            key={dIdx} 
                            className={`w-1.5 h-1.5 rounded-full inline-block ${
                              isSelected ? 'bg-amber-600' : hasNote ? 'bg-techo-pink' : 'bg-techo-teal'
                            }`} 
                          />
                        ))}
                        {taskCount > 3 && <span className="text-[8px] font-bold leading-none select-none font-mono">+</span>}
                      </div>
                    ) : !hasNote ? (
                      <span className="text-[8px] text-[#c1bcae]/50 italic tracking-widest scale-90">留白</span>
                    ) : null}
                  </div>

                  {/* Status short literal label */}
                  <span className="text-[8.5px] scale-90 origin-bottom font-medium leading-none truncate max-w-full block mt-0.5 opacity-90">
                    {statusLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Days Week labels header (Pinned) */}
          <div className="grid grid-cols-15 border-b border-[#eae6d8] bg-[#fbfaf6] text-center font-display font-semibold select-none border-t border-[#f5f3e9]">
            {/* Hour index column padding */}
            <div className="col-span-1 border-r border-[#eae6d8] py-2 text-[10px] text-[#9b9485] font-mono flex items-center justify-center">
              时间
            </div>
            {/* Days columns */}
            {daysOfWeek.map((day, idx) => {
              const isSelected = (selectedDay === idx + 1);
              return (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => updateSelectedDay(idx + 1)}
                  className={`col-span-2 border-r last:border-r-0 border-[#eae6d8] py-2 flex flex-col justify-center items-center cursor-pointer transition-all focus:outline-none select-none relative ${
                    isSelected 
                      ? 'bg-amber-50/70 text-amber-950 font-black relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-amber-600'
                      : day.isToday 
                        ? 'bg-techo-pink/5 hover:bg-techo-pink/10' 
                        : 'hover:bg-amber-50/30'
                  }`}
                  title={`点击查看/编辑: ${daysOfWeek[idx]._date.getMonth()+1}月${daysOfWeek[idx]._date.getDate()}日的今日笔记`}
                >
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-sans font-medium px-1 rounded-sm ${
                      day.isToday ? 'bg-techo-pink text-white font-semibold' : 'text-[#6e685a]'
                    }`}>
                      {day.text} ({day.dayName})
                    </span>
                  </div>
                  <div className={`text-xs font-mono mt-0.5 font-bold ${
                    isSelected 
                      ? 'text-amber-800' 
                      : day.isToday 
                        ? 'text-techo-pink font-extrabold' 
                        : 'text-[#48453f]'
                  }`}>
                    {day.dateStr}
                  </div>
                  
                  {/* Mini habit stamps */}
                  {habits.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-1">
                      {habits.map((h) => {
                        const isDone = h.history[idx];
                        return (
                          <span 
                            key={h.id} 
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              isDone 
                                ? comboStreaks[idx] >= 3 
                                  ? 'bg-amber-500 scale-110 ring-1 ring-amber-300' 
                                  : 'bg-emerald-400' 
                                : 'bg-gray-200/70'
                            }`}
                            title={`${h.name}: ${isDone ? '已打卡' : '未打卡'}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Core scrollable 24-hour workspace */}
          <div 
            ref={hourScrollRef}
            className="flex-1 overflow-y-auto techo-grid-bg relative bg-[#fdfdfb]"
            style={{ maxHeight: '460px' }}
          >
            <div className="grid grid-cols-15">
              
              {/* Hour Left Index Column */}
              <div className="col-span-1 border-r border-[#eae6d8] bg-[#fdfdfb] select-none text-center divide-y divide-[#eae6d8]/60">
                {hours.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-[40px] flex items-center justify-center text-[10px] font-bold font-mono text-[#787162]/80 border-b border-[#eae6d8]/60 relative"
                  >
                    {/* Hour line bar */}
                    {hour === 0 ? '0:00' : `${hour}:00`}
                    {/* Subtle dot representation */}
                    <div className="absolute right-0 h-[1px] w-2 bg-[#eae6d8]" />
                  </div>
                ))}
              </div>

              {/* 7 Days Grid Columns */}
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const day = daysOfWeek[dayIdx];
                const isSelected = (selectedDay === dayIdx + 1);
                return (
                  <GridColumn
                    key={dayIdx}
                    dayIdx={dayIdx}
                    day={day}
                    isSelected={isSelected}
                    hours={hours}
                    cells={renderedCells}
                    focusedHour={isSelected ? keyboardFocusedHour : null}
                    onCellClick={handleCellClick}
                    onMoveCell={handleMoveCell}
                    habitBgColorClass={getHabitBgClass(dayIdx)}
                  />
                );
              })}

            </div>
          </div>

          {/* BOTTOM REGION: TODAY'S NOTES AND FREE SPACE FOR EVERY DAY */}
          <div className="border-t-2 border-[#eae6d8] bg-[#fbfaf5]">
            <div className="grid grid-cols-15 border-b border-[#eae6d8] bg-[#f5f3e7] text-left">
              <div className="col-span-1 border-r border-[#eae6d8] py-1 text-[10px] text-center font-bold text-[#8c8577] flex items-center justify-center">
                今日 笔记
              </div>
              <div className="col-span-14 py-1 px-3 text-[10px] font-semibold text-[#6e685a] tracking-wider uppercase">
                ▼ 今日笔记 & 随手灵感记录栏 (Today's Notes / Free writing canvas)
              </div>
            </div>

            <div className="grid grid-cols-15 divide-x divide-[#eae6d8]">
              {/* Offset for index */}
              <div className="col-span-1 bg-[#fdfdfb] flex items-center justify-center text-[10px] text-center font-semibold text-[#aaa]">
                🍉
              </div>

              {daysOfWeek.map((day, idx) => {
                const noteVal = renderedTodayNotes[idx] || '';
                const isDayEditing = editingNoteDay === idx;
                const isSelected = (selectedDay === idx + 1);

                return (
                  <div 
                    key={idx} 
                    className={`col-span-2 p-2 min-h-[68px] relative text-[11px] leading-relaxed transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 shadow-inner'
                        : day.isToday 
                          ? 'bg-techo-pink/[0.03]' 
                          : 'bg-white'
                    } hover:bg-[#fafaf3]`}
                    onClick={() => startEditNote(idx)}
                  >
                    {isDayEditing ? (
                      <div className="flex flex-col gap-1 w-full h-full z-10" onClick={e => e.stopPropagation()}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full text-xs p-1 bg-white border border-[#beb9ab] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal resize-none h-[50px] font-sans"
                          placeholder="记录今日心情、待办、收获..."
                          autoFocus
                        />
                        <div className="flex justify-between items-center">
                          <button 
                            onClick={() => setEditingNoteDay(null)}
                            className="text-[9px] px-1 py-0.5 text-gray-500 hover:bg-gray-100 rounded border cursor-pointer"
                          >
                            取消
                          </button>
                          <button 
                            onClick={handleSaveNote}
                            className="text-[9px] px-1.5 py-0.5 bg-[#8a816c] text-white rounded hover:bg-[#776f5c] cursor-pointer"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col justify-between group">
                        <p className="text-[#555047] whitespace-pre-wrap select-text">
                          {noteVal ? noteVal : <span className="text-[#c1bcae]/80 italic">📝 记几笔...</span>}
                        </p>
                        <span className="opacity-0 group-hover:opacity-100 self-end text-[8px] text-[#a09a89] flex items-center gap-0.5 duration-150 font-sans mt-1 bg-[#eae6d8]/45 px-1 rounded animate-fade-in">
                          <Edit size={8} /> 写
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL FOR ADDING/EDITING WEEK PLAN CELLS */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs font-sans">
          <form 
            onSubmit={handleSaveCellForm}
            className="w-full max-w-md bg-[#fbfaf5] rounded-lg border-2 border-[#d3cfc3] shadow-xl overflow-hidden animate-fade-in"
          >
            <div className="relative bg-[#f5f3e9] px-6 py-4 border-b border-[#e5e2d6] flex items-center justify-between">
              <h3 className="font-display font-semibold text-[#48453f] text-sm mt-1">
                ✏️ 编辑日程: 周{['一', '二', '三', '四', '五', '六', '日'][editingSlot.dayIndex]} {editingSlot.hour}:00
              </h3>
              <button 
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-[#8e8573] hover:text-black hover:bg-[#e4e0d2] px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6e685a] mb-1">事件名称 / Plan Item</label>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#c5c0b0] rounded focus:outline-none focus:ring-2 focus:ring-techo-teal font-sans text-sm"
                  placeholder="例如: 🚀 开发 Cloudflare D1 边缘数据库"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6e685a] mb-1.5">荧光笔分类 / Highlighter color</label>
                <div className="grid grid-cols-3 gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditColor(preset.class)}
                      className={`px-2 py-1.5 rounded border text-left text-xs transition-all flex items-center gap-1.5 ${
                        editColor === preset.class 
                          ? 'border-gray-800 ring-2 ring-techo-teal font-bold' 
                          : 'border-transparent'
                      } ${preset.class}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-current inline-block shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6e685a] mb-1.5">成长标签 / Growth tag</label>
                <div className="grid grid-cols-4 gap-2">
                  {growthTagPresets.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setEditTag(tag.id)}
                      className={`px-2 py-1.5 rounded border text-left text-xs transition-all flex items-center gap-1.5 ${
                        editTag === tag.id
                          ? 'border-gray-800 ring-2 ring-techo-teal font-bold'
                          : 'border-transparent'
                      } ${tag.color}`}
                    >
                      <span className="w-4 h-4 rounded-sm bg-white/70 border border-current/20 flex items-center justify-center text-[9px] font-mono shrink-0">
                        {tag.mark}
                      </span>
                      <span className="truncate">{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-[#f5f3e9] px-5 py-3 border-t border-[#e5e2d6] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onClearCell(editingSlot.dayIndex, editingSlot.hour);
                  setEditingSlot(null);
                }}
                className="text-xs px-2.5 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer"
              >
                清空此格
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="text-xs px-4 py-1.5 bg-[#8a816c] hover:bg-[#736a56] text-white font-semibold rounded cursor-pointer"
                >
                  保存记录
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
