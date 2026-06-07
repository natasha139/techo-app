/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Heart,
  MessageSquareCode,
  Baby,
  Database,
  Settings,
  BookOpen,
  RefreshCw,
  User,
  Grid,
  CheckCircle,
  HelpCircle,
  Palette,
  Type,
  Key,
  Inbox,
  Activity
} from 'lucide-react';

import {
  WishItem,
  SkillNode,
  WorkTarget,
  HobbyCollectionItem,
  SideHustleContent,
  FinancialMetric,
  ChildMilestone,
  ChildDailyLog,
  PlannerCell,
  D1SyncLog,
  DiaryNote,
  HabitTracker,
  ChildDiary,
  WeeklySummary,
  InboxItem,
  FitnessLog,
  ParentingResource
} from './types';

import {
  initialWishes,
  initialSkills,
  initialWorkTargets,
  initialHobbies,
  initialSideHustles,
  initialFinancialMetrics,
  initialMilestones,
  initialChildLogs,
  initialPlannerCells,
  initialDiaryNotes,
  initialChildDiaries,
  initialWeeklySummary
} from './data';

import { api } from './api';
import SyncModal from './components/SyncModal';
import TechoGrid from './components/TechoGrid';
import BabyTechoGrid from './components/BabyTechoGrid';
import SelfGrowthSection from './components/SelfGrowthSection';
import WorkSection from './components/WorkSection';
import HobbiesSection from './components/HobbiesSection';
import MediaSideHustleSection from './components/MediaSideHustleSection';
import ParentingSection from './components/ParentingSection';
import D1Console from './components/D1Console';
import DiarySection from './components/DiarySection';
import InboxSection from './components/InboxSection';
import FitnessSection from './components/FitnessSection';
import ProjectNav from './components/ProjectNav';

export const TECH_THEMES = [
  {
    id: 'classic',
    name: '精装古织 (Classic Linen)',
    description: '日本经典国誉纸质米黄，温润护手、怀旧舒雅。',
    colors: {
      '--color-techo-cream': '#fbfaf5',
      '--color-techo-cream-darker': '#f5f3e9',
      '--color-techo-blue': '#7090b0',
      '--color-techo-pink': '#d97d8c',
      '--color-techo-orange': '#e09453',
      '--color-techo-teal': '#4b8f8c',
      '--page-bg': '#edeae1',
      '--card-border': '#d3cfc3',
      '--sidebar-active-bg': '#8a816c',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#d5cfbe',
    }
  },
  {
    id: 'sakura',
    name: '赏樱限定 (Sakura Blossom)',
    description: '限定春日柔和浅粉，洋溢着满怀唯美的梦幻感。',
    colors: {
      '--color-techo-cream': '#fffcfc',
      '--color-techo-cream-darker': '#fcf0f2',
      '--color-techo-blue': '#829cb5',
      '--color-techo-pink': '#d47b8a',
      '--color-techo-orange': '#de927c',
      '--color-techo-teal': '#be7791',
      '--page-bg': '#f3e1e4',
      '--card-border': '#dfcbcf',
      '--sidebar-active-bg': '#d47b8a',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#e6ccd0',
    }
  },
  {
    id: 'indigo',
    name: '静谧港口 (Slate Denim)',
    description: '深邃单宁靛蓝与北欧冰川色，予人严谨清爽之感。',
    colors: {
      '--color-techo-cream': '#fcfdfe',
      '--color-techo-cream-darker': '#edf3f8',
      '--color-techo-blue': '#4c7499',
      '--color-techo-pink': '#c77281',
      '--color-techo-orange': '#cfa580',
      '--color-techo-teal': '#537d94',
      '--page-bg': '#d8e4ef',
      '--card-border': '#c2d4e6',
      '--sidebar-active-bg': '#507599',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#c1d0de',
    }
  },
  {
    id: 'forest',
    name: '抹茶初阳 (Matcha Forest)',
    description: '仲夏清香抹茶与松针墨竹，舒散清爽的写意森林。',
    colors: {
      '--color-techo-cream': '#fffefc',
      '--color-techo-cream-darker': '#f2f6f1',
      '--color-techo-blue': '#6da2a6',
      '--color-techo-pink': '#d1949c',
      '--color-techo-orange': '#caa175',
      '--color-techo-teal': '#3f7c70',
      '--page-bg': '#dfeade',
      '--card-border': '#ccd5c7',
      '--sidebar-active-bg': '#3f7c70',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#ccd6c7',
    }
  },
  {
    id: 'lavender',
    name: '紫韵熏香 (Lavender Mist)',
    description: '浪漫紫罗兰迷雾，优雅、安静与独特的知性气息。',
    colors: {
      '--color-techo-cream': '#fafafc',
      '--color-techo-cream-darker': '#f0ecf5',
      '--color-techo-blue': '#7a8ebb',
      '--color-techo-pink': '#cf8ea3',
      '--color-techo-orange': '#caa582',
      '--color-techo-teal': '#8575ba',
      '--page-bg': '#e6dee9',
      '--card-border': '#ccc3d4',
      '--sidebar-active-bg': '#8473ba',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#c7bdd1',
    }
  },
  {
    id: 'leather',
    name: '奢华黑熔 (Obsidian Gold)',
    description: '高级黑曜皮革封面配烫金，黑金色泽，低调高贵。',
    colors: {
      '--color-techo-cream': '#1d1c1a',
      '--color-techo-cream-darker': '#252422',
      '--color-techo-blue': '#818cf8',
      '--color-techo-pink': '#f472b6',
      '--color-techo-orange': '#fbbe24',
      '--color-techo-teal': '#dfca9f',
      '--page-bg': '#141312',
      '--card-border': '#353330',
      '--sidebar-active-bg': '#dfca9f',
      '--sidebar-active-text': '#1d1c1a',
      '--spine-bg': '#2b2a27',
    }
  },
  {
    id: 'coral',
    name: '珊瑚夕照 (Coral Dusk)',
    description: '温柔珊瑚橙与杏粉，傍晚余晖般的暖意与活力。',
    colors: {
      '--color-techo-cream': '#fffaf7',
      '--color-techo-cream-darker': '#fdf0e8',
      '--color-techo-blue': '#8fa8c0',
      '--color-techo-pink': '#e07060',
      '--color-techo-orange': '#e8855a',
      '--color-techo-teal': '#c0624a',
      '--page-bg': '#f5e0d5',
      '--card-border': '#e8cfc4',
      '--sidebar-active-bg': '#d96848',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#e8c4b4',
    }
  },
  {
    id: 'midnight',
    name: '深海午夜 (Midnight Ink)',
    description: '深邃午夜蓝与星空银，沉稳专注的夜间书写氛围。',
    colors: {
      '--color-techo-cream': '#1a1f2e',
      '--color-techo-cream-darker': '#222840',
      '--color-techo-blue': '#6b9fd4',
      '--color-techo-pink': '#e879a0',
      '--color-techo-orange': '#f0a050',
      '--color-techo-teal': '#5bbcb0',
      '--page-bg': '#111624',
      '--card-border': '#2a3148',
      '--sidebar-active-bg': '#5bbcb0',
      '--sidebar-active-text': '#111624',
      '--spine-bg': '#1e2438',
    }
  },
  {
    id: 'lemon',
    name: '春日柠檬 (Lemon Zest)',
    description: '清新柠檬黄与嫩草绿，明亮轻快的春日能量感。',
    colors: {
      '--color-techo-cream': '#fefef8',
      '--color-techo-cream-darker': '#f8f9e8',
      '--color-techo-blue': '#7ab0a0',
      '--color-techo-pink': '#d4986a',
      '--color-techo-orange': '#d4a820',
      '--color-techo-teal': '#6a9a50',
      '--page-bg': '#eef2d8',
      '--card-border': '#d8e0b8',
      '--sidebar-active-bg': '#6a9a50',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#d4ddb0',
    }
  },
  {
    id: 'rose-gold',
    name: '玫瑰金尘 (Rose Gold)',
    description: '细腻玫瑰金与象牙白，现代优雅的轻奢质感。',
    colors: {
      '--color-techo-cream': '#fdf8f5',
      '--color-techo-cream-darker': '#f8eeea',
      '--color-techo-blue': '#9aacba',
      '--color-techo-pink': '#c47e7e',
      '--color-techo-orange': '#c99070',
      '--color-techo-teal': '#b07878',
      '--page-bg': '#ede0d8',
      '--card-border': '#d8c8c0',
      '--sidebar-active-bg': '#b07878',
      '--sidebar-active-text': '#ffffff',
      '--spine-bg': '#d4bdb4',
    }
  },
];

const initialHabits: HabitTracker[] = [
  { id: 'h1', name: '💧 每日饮水 2L', history: { 0: true, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false } },
  { id: 'h2', name: '📖 书籍阅读 30min', history: { 0: true, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false } },
  { id: 'h3', name: '🏃 户外慢跑 3km', history: { 0: false, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false } },
  { id: 'h4', name: '🧘 正念冥想 10min', history: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false } },
];

function makeD1Log(type: D1SyncLog['type'], message: string, sql?: string): D1SyncLog {
  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    type,
    message,
    sql,
  };
}

export default function App() {

  // -- SYNC CODE AUTH --
  const [syncCode, setSyncCode] = useState<string>(() => localStorage.getItem('techo_sync_code') || '');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const todayNotesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- TOP NAV BAR VISUALS --
  const [subHeaderTab, setSubHeaderTab] = useState<'year' | 'month' | 'week'>('week');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // -- CUSTOMIZER VISUAL CONFIGURATIONS --
  const [activeThemeId, setActiveThemeId] = useState<string>(() => localStorage.getItem('techo_theme_id') || 'classic');
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('techo_font_family') || 'sans');
  const [gridOpacity, setGridOpacity] = useState<number>(() => {
    const val = localStorage.getItem('techo_grid_opacity');
    return val ? parseInt(val) : 40;
  });
  const [username, setUsername] = useState<string>(() => localStorage.getItem('techo_username') || 'Natasha');
  const [appTitle, setAppTitle] = useState<string>(() => localStorage.getItem('techo_app_title') || '自我手帐');
  const [avatarUrl, setAvatarUrl] = useState<string>(() => localStorage.getItem('techo_avatar') || '');

  // Daily quote
  const QUOTES = [
    '种一棵树最好的时间是十年前，其次是现在。',
    '你不需要看到整段楼梯，只需要迈出第一步。',
    '慢慢来，比较快。',
    '每一个你所羡慕的结果，背后都有你看不见的坚持。',
    '不是因为有希望才坚持，而是坚持了才有希望。',
    '生活不是等待风暴过去，而是学会在雨中起舞。',
    '你今天的努力，是明天最好的铺垫。',
    '成长是一件安静的事，不必声张。',
    '把每一天都活成你最想要的样子。',
    '做一个有温度的人，温暖自己，也温暖别人。',
    '专注当下，其余的自会到来。',
    '你已经比昨天的自己更好了。',
    'The secret of getting ahead is getting started.',
    'Small steps every day lead to big changes.',
    'Be the energy you want to attract.',
    'Progress, not perfection.',
  ];
  const todayQuoteIdx = new Date().getDate() % QUOTES.length;
  const [customQuote, setCustomQuote] = useState<string>(() => {
    const saved = localStorage.getItem('techo_quote');
    if (!saved) return '';
    try { const p = JSON.parse(saved); return p.date === new Date().toISOString().slice(0,10) ? p.text : ''; } catch { return ''; }
  });
  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');
  const displayQuote = customQuote || QUOTES[todayQuoteIdx];
  const [appSubtitle, setAppSubtitle] = useState<string>(() => localStorage.getItem('techo_app_subtitle') || 'Self-Growth Hand Planner • inspired by Kokuyo');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [coverBg, setCoverBg] = useState<string>('');
  const [editionLabel, setEditionLabel] = useState<string>('');

  const handleThemeChange = (themeId: string) => {
    setActiveThemeId(themeId);
    saveSetting('theme_id', themeId);
  };

  const handleFontChange = (font: string) => {
    setFontFamily(font);
    saveSetting('font_family', font);
  };

  const handleGridOpacityChange = (opacity: number) => {
    setGridOpacity(opacity);
    saveSetting('grid_opacity', String(opacity));
  };

  const handleUsernameChange = (name: string) => {
    setUsername(name.slice(0, 15) || 'Natasha');
    saveSetting('username', name.slice(0, 15) || 'Natasha');
  };

  // -- MAIN CONTENT TAB SELECTOR --
  const [activeTab, setActiveTab] = useState<'week' | 'self_growth' | 'work' | 'hobby' | 'media' | 'parenting' | 'diary' | 'inbox' | 'fitness' | 'database'>('week');
  const [weekPlan, setWeekPlan] = useState<'mine' | 'baby'>('mine');
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0=当周, 1=下周, 2=下下周...
  const babyTodayNotesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- STATE ENGINES --
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [workTargets, setWorkTargets] = useState<WorkTarget[]>([]);
  const [hobbies, setHobbies] = useState<HobbyCollectionItem[]>([]);
  const [shContents, setShContents] = useState<SideHustleContent[]>([]);
  const [finance, setFinance] = useState<FinancialMetric[]>([]);
  const [milestones, setMilestones] = useState<ChildMilestone[]>([]);
  const [childLogs, setChildLogs] = useState<ChildDailyLog[]>([]);
  const [cells, setCells] = useState<PlannerCell[]>([]);
  const [babyCells, setBabyCells] = useState<PlannerCell[]>([]);
  const [babyTodayNotes, setBabyTodayNotes] = useState<{ [k: number]: string }>({});
  const [diaryNotes, setDiaryNotes] = useState<DiaryNote[]>([]);
  const [habits, setHabits] = useState<HabitTracker[]>([]);
  const [childDiaries, setChildDiaries] = useState<ChildDiary[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>(initialWeeklySummary);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([]);
  const [parentingResources, setParentingResources] = useState<ParentingResource[]>([]);
  
  // Today's Notes local state for days Mon-Sun (Indices 0 - 6)
  const [todayNotes, setTodayNotes] = useState<{ [dayIndex: number]: string }>({
    0: '复盘上一周 D1 KV 开发细节。今天和团队进行技术审计。',
    1: '晨跑身体轻盈。下午安静看会DDIA！',
    2: '宝宝今天大动表现很棒，能够平稳扶小床挺起身子了。',
    3: '开发手帐周视图网格中考量性能，用 React.memo 减少重绘点阵。',
    4: '周五下班。晚上全家去商场附近吃顿蒸汽海鲜粤菜。',
    5: '全天亲子露营，天气晴朗，风吹草动特别惬意。',
    6: '周日手纸复盘，感觉整个人越来越清爽，继续加油！'
  });

  // DB Sync logs state
  const [d1Logs, setD1Logs] = useState<D1SyncLog[]>([
    makeD1Log('info', '等待同步码登录...'),
  ]);

  const pushLog = useCallback((type: D1SyncLog['type'], message: string, sql?: string) => {
    setD1Logs(prev => [...prev, makeD1Log(type, message, sql)].slice(-60));
  }, []);

  // -- API DATA LOADER --
  const loadAllData = useCallback(async (sc: string) => {
    setIsLoadingData(true);
    pushLog('info', `正在连接 Cloudflare D1 (sync_code: ${sc})...`);
    try {
      const [
        wishData, skillData, workData, hobbyData, shData, diaryData,
        milestoneData, childLogData, childDiaryData,
        cellData, habitData, summaryData, financeData,
        inboxData, fitnessData, parentingResourceData, settingsData,
      ] = await Promise.all([
        api.wishes.list(sc),
        api.skills.list(sc),
        api.work.list(sc),
        api.hobbies.list(sc),
        api.sideHustles.list(sc),
        api.diary.list(sc),
        api.milestones.list(sc),
        api.childLogs.list(sc),
        api.childDiaries.list(sc),
        api.cells.list(sc),
        api.habits.list(sc),
        api.weeklySummary.get(sc),
        api.finance.list(sc),
        api.inbox.list(sc),
        api.fitness.list(sc),
        api.parentingResources.list(sc),
        api.settings.getAll(sc),
      ]);

      setWishes(wishData.map((w: any) => ({ id: w.id, order: w.ord, content: w.content, isCompleted: w.is_completed === 1, category: w.category })));
      setSkills(skillData);
      setWorkTargets(workData);
      setHobbies(hobbyData);
      setShContents(shData);
      setDiaryNotes(diaryData);
      setMilestones(milestoneData);
      setChildLogs(childLogData);
      setChildDiaries(childDiaryData);
      setCells(cellData.filter((c: PlannerCell) => !c.id.startsWith('baby_')));
      setBabyCells(cellData.filter((c: PlannerCell) => c.id.startsWith('baby_')));
      setHabits(habitData);
      setFinance(financeData);
      setInboxItems(inboxData);
      setFitnessLogs(fitnessData);
      setParentingResources(parentingResourceData);

      if (summaryData) {
        setWeeklySummary({ ...initialWeeklySummary, ...summaryData });
        if (summaryData.todayNotes && Object.keys(summaryData.todayNotes).length) {
          setTodayNotes(summaryData.todayNotes);
        } else {
          setTodayNotes({});
        }
        if (summaryData.babyTodayNotes && Object.keys(summaryData.babyTodayNotes).length) {
          setBabyTodayNotes(summaryData.babyTodayNotes);
        } else {
          setBabyTodayNotes({});
        }
      } else {
        setTodayNotes({});
        setBabyTodayNotes({});
      }

      pushLog('success', `✅ 全部数据加载完成。wishes:${wishData.length} skills:${skillData.length} habits:${habitData.length}`);

      // Apply persisted appearance settings from D1
      if (settingsData) {
        if (settingsData.app_title) setAppTitle(settingsData.app_title);
        if (settingsData.app_subtitle) setAppSubtitle(settingsData.app_subtitle);
        if (settingsData.username) setUsername(settingsData.username);
        if (settingsData.theme_id) setActiveThemeId(settingsData.theme_id);
        if (settingsData.font_family) setFontFamily(settingsData.font_family);
        if (settingsData.grid_opacity !== undefined) setGridOpacity(Number(settingsData.grid_opacity));
        if (settingsData.avatar_url) setAvatarUrl(settingsData.avatar_url);
        if (settingsData.custom_quote) setCustomQuote(settingsData.custom_quote);
        if (settingsData.cover_bg) setCoverBg(settingsData.cover_bg);
        if (settingsData.edition_label) setEditionLabel(settingsData.edition_label);
      }
    } catch (e: any) {
      pushLog('error', `加载失败: ${e.message}`);
    } finally {
      setIsLoadingData(false);
    }
  }, [pushLog]);

  useEffect(() => {
    if (syncCode) loadAllData(syncCode);
  }, [syncCode, loadAllData]);

  // -- API MUTATION HELPERS --
  const apiCall = useCallback(async (
    operation: () => Promise<any>,
    table: string,
    sql?: string
  ) => {
    try {
      await operation();
      pushLog('query', `D1 ${table} 写入成功。`, sql);
    } catch (e: any) {
      pushLog('error', `D1 ${table} 写入失败: ${e.message}`);
    }
  }, [pushLog]);

  const saveSetting = useCallback((key: string, value: string) => {
    if (!syncCode) return;
    api.settings.set(syncCode, { [key]: value }).catch(() => {});
  }, [syncCode]);

  // -- TRIGGERS CRUD MUTATIONS --

  // 1. Weekly Grid Cells
  const handleSaveCell = (dayIndex: number, hour: number, text: string, color: string, tag?: string) => {
    const id = `${dayIndex}-${hour}`;
    const item = { id, text, color, tag };
    const rest = cells.filter(c => c.id !== id);
    setCells([...rest, item]);
    apiCall(() => api.cells.upsert(syncCode, item), 'planner_cells',
      `INSERT OR REPLACE INTO planner_cells (id, text, color, tag) VALUES ('${id}', ...)`);
  };

  const handleClearCell = (dayIndex: number, hour: number) => {
    const id = `${dayIndex}-${hour}`;
    setCells(prev => prev.filter(c => c.id !== id));
    apiCall(() => api.cells.delete(syncCode, id), 'planner_cells',
      `DELETE FROM planner_cells WHERE id = '${id}'`);
  };

  const handleSaveTodayNote = (dayIndex: number, text: string) => {
    const updated = { ...todayNotes, [dayIndex]: text };
    setTodayNotes(updated);
    // debounce 1s — today notes 高频输入，避免每次击键都写 D1
    if (todayNotesDebounceRef.current) clearTimeout(todayNotesDebounceRef.current);
    todayNotesDebounceRef.current = setTimeout(() => {
      apiCall(() => api.weeklySummary.save(syncCode, { ...weeklySummary, todayNotes: updated }), 'weekly_summary',
        `UPDATE weekly_summary SET today_notes = ? WHERE sync_code = ?`);
    }, 1000);
  };

  const handleSaveWeeklySummary = (summary: WeeklySummary) => {
    setWeeklySummary(summary);
    apiCall(() => api.weeklySummary.save(syncCode, { ...summary, todayNotes, babyTodayNotes }), 'weekly_summary',
      `INSERT OR REPLACE INTO weekly_summary (...) VALUES (...)`);
  };

  // Baby week plan handlers
  const handleSaveBabyCell = (dayIndex: number, hour: number, text: string, color: string) => {
    const id = `baby_${dayIndex}-${hour}`;
    const item = { id, text, color };
    setBabyCells(prev => [...prev.filter(c => c.id !== id), item]);
    apiCall(() => api.cells.upsert(syncCode, item), 'planner_cells (baby)',
      `INSERT OR REPLACE INTO planner_cells (id, text, color) VALUES ('${id}', ...)`);
  };

  const handleClearBabyCell = (dayIndex: number, hour: number) => {
    const id = `baby_${dayIndex}-${hour}`;
    setBabyCells(prev => prev.filter(c => c.id !== id));
    apiCall(() => api.cells.delete(syncCode, id), 'planner_cells (baby)',
      `DELETE FROM planner_cells WHERE id = '${id}'`);
  };

  const handleSaveBabyTodayNote = (dayIndex: number, text: string) => {
    const updated = { ...babyTodayNotes, [dayIndex]: text };
    setBabyTodayNotes(updated);
    if (babyTodayNotesDebounceRef.current) clearTimeout(babyTodayNotesDebounceRef.current);
    babyTodayNotesDebounceRef.current = setTimeout(() => {
      apiCall(() => api.weeklySummary.save(syncCode, { ...weeklySummary, todayNotes, babyTodayNotes: updated }), 'weekly_summary');
    }, 1000);
  };

  // Habits
  const handleToggleHabit = (habitId: string, dayIdx: number) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      return { ...h, history: { ...h.history, [dayIdx]: !h.history[dayIdx] } };
    });
    setHabits(updated);
    const item = updated.find(h => h.id === habitId)!;
    apiCall(() => api.habits.upsert(syncCode, item), 'habits',
      `UPDATE habits SET history = ? WHERE id = '${habitId}'`);
  };

  const handleAddHabit = (name: string) => {
    const newHabit: HabitTracker = {
      id: `h_${Date.now()}`,
      name: name.trim() || '未命名的习惯',
      history: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
    };
    setHabits(prev => [...prev, newHabit]);
    apiCall(() => api.habits.upsert(syncCode, newHabit), 'habits',
      `INSERT INTO habits (id, name, history) VALUES ('${newHabit.id}', ...)`);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    apiCall(() => api.habits.delete(syncCode, id), 'habits',
      `DELETE FROM habits WHERE id = '${id}'`);
  };

  // 2. Wishes
  const handleToggleWish = (id: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, isCompleted: !w.isCompleted } : w);
    setWishes(updated);
    const item = updated.find(w => w.id === id)!;
    apiCall(() => api.wishes.upsert(syncCode, item), 'wishes',
      `UPDATE wishes SET is_completed = ? WHERE id = '${id}'`);
  };

  const handleEditWish = (id: string, content: string, category: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, content, category } : w);
    setWishes(updated);
    const item = updated.find(w => w.id === id)!;
    apiCall(() => api.wishes.upsert(syncCode, item), 'wishes',
      `UPDATE wishes SET content = ?, category = ? WHERE id = '${id}'`);
  };

  const handleAddWish = (content: string, category: string) => {
    const existingEmpty = wishes.find(w => !w.content);
    let updated: WishItem[];
    if (existingEmpty) {
      updated = wishes.map(w => w.id === existingEmpty.id ? { ...w, content, category, isCompleted: false } : w);
    } else {
      updated = [...wishes, { id: `wish_${Date.now()}`, order: wishes.length + 1, content, isCompleted: false, category }];
    }
    setWishes(updated);
    const item = updated.find(w => w.content === content && w.category === category)!;
    apiCall(() => api.wishes.upsert(syncCode, item), 'wishes',
      `INSERT OR REPLACE INTO wishes (...) VALUES (...)`);
  };

  const handleDeleteWish = (id: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, content: '', isCompleted: false } : w);
    setWishes(updated);
    const item = updated.find(w => w.id === id)!;
    apiCall(() => api.wishes.upsert(syncCode, item), 'wishes',
      `UPDATE wishes SET content = '' WHERE id = '${id}'`);
  };

  // 3. Skills
  const handleToggleSkillGoal = (skillId: string, goalId: string) => {
    const updated = skills.map(skill => {
      if (skill.id !== skillId) return skill;
      const updatedSub = skill.subGoals.map(g => g.id === goalId ? { ...g, isDone: !g.isDone } : g);
      const allDone = updatedSub.every(g => g.isDone);
      const status: SkillNode['status'] = allDone ? 'mastered' : skill.status === 'not_started' ? 'learning' : skill.status;
      return { ...skill, subGoals: updatedSub, status };
    });
    setSkills(updated);
    const item = updated.find(s => s.id === skillId)!;
    apiCall(() => api.skills.upsert(syncCode, item), 'skills',
      `UPDATE skill_subgoals SET is_done = ? WHERE id = '${goalId}'`);
  };

  const handleAddSkill = (skillName: string, category: string = '成长') => {
    const newSkill: SkillNode = { id: `skill_${Date.now()}`, skillName, status: 'learning', subGoals: [], category };
    setSkills(prev => [...prev, newSkill]);
    apiCall(() => api.skills.upsert(syncCode, newSkill), 'skills',
      `INSERT INTO skills (id, skill_name, category) VALUES ('${newSkill.id}', ...)`);
  };

  const handleAddSubgoal = (skillId: string, name: string) => {
    const updated = skills.map(skill => {
      if (skill.id !== skillId) return skill;
      return { ...skill, subGoals: [...skill.subGoals, { id: `sub_${Date.now()}`, name, isDone: false }] };
    });
    setSkills(updated);
    const item = updated.find(s => s.id === skillId)!;
    apiCall(() => api.skills.upsert(syncCode, item), 'skills',
      `INSERT INTO skill_subgoals (skill_id, name) VALUES ('${skillId}', ...)`);
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
    apiCall(() => api.skills.delete(syncCode, id), 'skills',
      `DELETE FROM skills WHERE id = '${id}'`);
  };

  const handleDeleteSubgoal = (skillId: string, subgoalId: string) => {
    const updated = skills.map(s => {
      if (s.id !== skillId) return s;
      return { ...s, subGoals: s.subGoals.filter(sub => sub.id !== subgoalId) };
    });
    setSkills(updated);
    const item = updated.find(s => s.id === skillId)!;
    apiCall(() => api.skills.upsert(syncCode, item), 'skills',
      `DELETE FROM skill_subgoals WHERE id = '${subgoalId}'`);
  };

  const handleUpdateSkillStatus = (id: string, status: any) => {
    const updated = skills.map(s => s.id === id ? { ...s, status } : s);
    setSkills(updated);
    const item = updated.find(s => s.id === id)!;
    apiCall(() => api.skills.upsert(syncCode, item), 'skills',
      `UPDATE skills SET status = '${status}' WHERE id = '${id}'`);
  };

  // 4. Work
  const handleAddWorkTarget = (target: Omit<WorkTarget, 'id'>) => {
    const item = { ...target, id: `wt_${Date.now()}` };
    setWorkTargets(prev => [...prev, item]);
    apiCall(() => api.work.upsert(syncCode, item), 'work_targets');
  };

  const handleUpdateWorkTarget = (id: string, updatedFields: Partial<WorkTarget>) => {
    const updated = workTargets.map(wt => wt.id === id ? { ...wt, ...updatedFields } : wt);
    setWorkTargets(updated);
    const item = updated.find(wt => wt.id === id)!;
    apiCall(() => api.work.upsert(syncCode, item), 'work_targets');
  };

  const handleDeleteWorkTarget = (id: string) => {
    setWorkTargets(prev => prev.filter(wt => wt.id !== id));
    apiCall(() => api.work.delete(syncCode, id), 'work_targets');
  };

  // 5. Hobbies
  const handleAddHobby = (item: Omit<HobbyCollectionItem, 'id'>) => {
    const newItem = { ...item, id: `h_${Date.now()}` };
    setHobbies(prev => [...prev, newItem]);
    apiCall(() => api.hobbies.upsert(syncCode, newItem), 'hobbies');
  };

  const handleUpdateHobby = (id: string, updatedFields: Partial<HobbyCollectionItem>) => {
    const updated = hobbies.map(h => h.id === id ? { ...h, ...updatedFields } : h);
    setHobbies(updated);
    const item = updated.find(h => h.id === id)!;
    apiCall(() => api.hobbies.upsert(syncCode, item), 'hobbies');
  };

  const handleDeleteHobby = (id: string) => {
    setHobbies(prev => prev.filter(h => h.id !== id));
    apiCall(() => api.hobbies.delete(syncCode, id), 'hobbies');
  };

  // 6. Side Hustle
  const handleAddSHContent = (c: Omit<SideHustleContent, 'id'>) => {
    const item = { ...c, id: `sh_${Date.now()}` };
    setShContents(prev => [...prev, item]);
    apiCall(() => api.sideHustles.upsert(syncCode, item), 'side_hustles');
  };

  const handleDeleteSHContent = (id: string) => {
    setShContents(prev => prev.filter(sh => sh.id !== id));
    apiCall(() => api.sideHustles.delete(syncCode, id), 'side_hustles');
  };

  const handleUpdateSHContentStatus = (id: string, status: any) => {
    const updated = shContents.map(sh => sh.id === id ? { ...sh, status } : sh);
    setShContents(updated);
    const item = updated.find(sh => sh.id === id)!;
    apiCall(() => api.sideHustles.upsert(syncCode, item), 'side_hustles');
  };

  const handleAddFinance = (f: Omit<FinancialMetric, 'id'>) => {
    const item = { ...f, id: `fm_${Date.now()}` };
    setFinance(prev => [...prev, item]);
    apiCall(() => api.finance.upsert(syncCode, item), 'financial_metrics');
  };

  const handleDeleteFinance = (id: string) => {
    setFinance(prev => prev.filter(f => f.id !== id));
    apiCall(() => api.finance.delete(syncCode, id), 'financial_metrics');
  };

  // 7. Parenting
  const handleAddChildMilestone = (m: Omit<ChildMilestone, 'id'>) => {
    const item = { ...m, id: `cm_${Date.now()}` };
    setMilestones(prev => [...prev, item]);
    apiCall(() => api.milestones.upsert(syncCode, item), 'child_milestones');
  };

  const handleDeleteChildMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    apiCall(() => api.milestones.delete(syncCode, id), 'child_milestones');
  };

  const handleAddChildLog = (l: Omit<ChildDailyLog, 'id'>) => {
    const item = { ...l, id: `cl_${Date.now()}` };
    setChildLogs(prev => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
    apiCall(() => api.childLogs.upsert(syncCode, item), 'child_logs');
  };

  const handleDeleteChildLog = (id: string) => {
    setChildLogs(prev => prev.filter(l => l.id !== id));
    apiCall(() => api.childLogs.delete(syncCode, id), 'child_logs');
  };

  const handleAddChildDiary = (d: Omit<ChildDiary, 'id'>) => {
    const item = { ...d, id: `cd_${Date.now()}` };
    setChildDiaries(prev => [item, ...prev]);
    apiCall(() => api.childDiaries.upsert(syncCode, item), 'child_diaries');
  };

  const handleDeleteChildDiary = (id: string) => {
    setChildDiaries(prev => prev.filter(d => d.id !== id));
    apiCall(() => api.childDiaries.delete(syncCode, id), 'child_diaries');
  };

  // 8. Diary
  const handleAddDiary = (note: Omit<DiaryNote, 'id'>) => {
    const item = { ...note, id: `note_${Date.now()}` };
    setDiaryNotes(prev => [...prev, item]);
    apiCall(() => api.diary.upsert(syncCode, item), 'diary_notes');
  };

  const handleUpdateDiary = (id: string, updatedFields: Partial<DiaryNote>) => {
    const updated = diaryNotes.map(n => n.id === id ? { ...n, ...updatedFields } : n);
    setDiaryNotes(updated);
    const item = updated.find(n => n.id === id)!;
    apiCall(() => api.diary.upsert(syncCode, item), 'diary_notes');
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryNotes(prev => prev.filter(n => n.id !== id));
    apiCall(() => api.diary.delete(syncCode, id), 'diary_notes');
  };

  // 9. Inbox
  const handleAddInbox = (item: Omit<InboxItem, 'id'>) => {
    const newItem: InboxItem = { ...item, id: `inbox_${Date.now()}` };
    setInboxItems(prev => [newItem, ...prev]);
    apiCall(() => api.inbox.upsert(syncCode, newItem), 'inbox_items');
  };

  const handleUpdateInbox = (id: string, fields: Partial<InboxItem>) => {
    const updated = inboxItems.map(i => i.id === id ? { ...i, ...fields } : i);
    setInboxItems(updated);
    const item = updated.find(i => i.id === id)!;
    apiCall(() => api.inbox.upsert(syncCode, item), 'inbox_items');
  };

  const handleDeleteInbox = (id: string) => {
    setInboxItems(prev => prev.filter(i => i.id !== id));
    apiCall(() => api.inbox.delete(syncCode, id), 'inbox_items');
  };

  // 10. Fitness
  const handleAddFitness = (log: Omit<FitnessLog, 'id'>) => {
    const item: FitnessLog = { ...log, id: `fit_${Date.now()}` };
    setFitnessLogs(prev => [item, ...prev]);
    apiCall(() => api.fitness.upsert(syncCode, item), 'fitness_logs');
  };

  const handleUpdateFitness = (id: string, fields: Partial<FitnessLog>) => {
    const updated = fitnessLogs.map(l => l.id === id ? { ...l, ...fields } : l);
    setFitnessLogs(updated);
    const item = updated.find(l => l.id === id)!;
    apiCall(() => api.fitness.upsert(syncCode, item), 'fitness_logs');
  };

  const handleDeleteFitness = (id: string) => {
    setFitnessLogs(prev => prev.filter(l => l.id !== id));
    apiCall(() => api.fitness.delete(syncCode, id), 'fitness_logs');
  };

  // 11. Parenting Resources
  const handleAddParentingResource = (r: Omit<ParentingResource, 'id'>) => {
    const item: ParentingResource = { ...r, id: `pr_${Date.now()}` };
    setParentingResources(prev => [item, ...prev]);
    apiCall(() => api.parentingResources.upsert(syncCode, item), 'parenting_resources');
  };

  const handleDeleteParentingResource = (id: string) => {
    setParentingResources(prev => prev.filter(r => r.id !== id));
    apiCall(() => api.parentingResources.delete(syncCode, id), 'parenting_resources');
  };

  // -- REAL D1 SYNC (reload from API) --
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    pushLog('info', '正在重新拉取 Cloudflare D1 最新数据...');
    try {
      await loadAllData(syncCode);
      pushLog('success', '✅ 数据同步完成。所有状态已更新为服务端最新值。');
    } catch (e: any) {
      pushLog('error', `同步失败: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // -- AUTH HANDLER --
  const handleSyncLogin = (code: string, uname: string) => {
    localStorage.setItem('techo_sync_code', code);
    setUsername(uname);
    setSyncCode(code);
  };

  const currentTheme = TECH_THEMES.find(t => t.id === activeThemeId) || TECH_THEMES[0];
  const themeStyles = {
    ...currentTheme.colors,
    '--color-techo-grid': `rgba(220, 215, 201, ${gridOpacity / 100})`,
    backgroundColor: currentTheme.colors['--page-bg'],
    color: (activeThemeId === 'leather' || activeThemeId === 'midnight') ? '#eae5d8' : 'inherit',
  } as React.CSSProperties;

  const selectedFontClass =
    fontFamily === 'sans' ? 'font-sans' :
    fontFamily === 'display' ? 'font-display' :
    fontFamily === 'mono' ? 'font-mono' :
    fontFamily === 'rounded' ? 'font-sans' :
    fontFamily === 'condensed' ? 'font-display' :
    fontFamily === 'handwriting' ? 'font-serif' :
    'font-serif';

  return (
    <>
      {!syncCode && <SyncModal onSuccess={handleSyncLogin} />}
      <ProjectNav current="techo" />
    <div
      style={themeStyles}
      className={`min-h-screen py-4 px-2 sm:px-6 flex flex-col ${selectedFontClass} select-none antialiased md:py-6 transition-colors duration-500`}
    >
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-5">

        {/* Loading overlay */}
        {isLoadingData && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-[#d3cfc3] px-8 py-6 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#8a816c] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-[#3c3830]">正在加载手帐数据...</p>
              <p className="text-[10px] text-[#8e8574]">从 Cloudflare D1 同步中</p>
            </div>
          </div>
        )}
        <header className="bg-white border-2 border-[#d3cfc3] rounded-lg px-4 py-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative">
          {/* Subtle physical notebook spine binding effect on the left rail */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 flex flex-col justify-between py-1 bg-[#d5cfbe] border-r border-[#bebaaa] rounded-l-lg overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mx-auto shadow-inner" />
            ))}
          </div>

          <div className="flex items-center gap-3 pl-3">
            <label className="w-8 h-8 rounded-full bg-[#8a816c] flex items-center justify-center text-white shrink-0 shadow-xxs cursor-pointer overflow-hidden hover:opacity-80 transition-opacity" title="点击上传头像">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="font-display font-black text-sm">自</span>
              }
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const url = ev.target?.result as string;
                  setAvatarUrl(url);
                  saveSetting('avatar_url', url);
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            <div>
              <div className="flex items-center gap-2">
                {editingTitle ? (
                  <input autoFocus value={appTitle} onChange={e => setAppTitle(e.target.value)}
                    onBlur={() => { setEditingTitle(false); saveSetting('app_title', appTitle); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setEditingTitle(false); saveSetting('app_title', appTitle); } }}
                    className="font-display font-extrabold text-lg text-[#3c3830] tracking-wide bg-transparent border-b border-techo-teal outline-none w-36" />
                ) : (
                  <h1 className="font-display font-extrabold text-lg text-[#3c3830] tracking-wide cursor-text hover:text-techo-teal transition-colors"
                    onDoubleClick={() => setEditingTitle(true)} title="双击编辑">{appTitle}</h1>
                )}
              </div>
              {editingSubtitle ? (
                <input autoFocus value={appSubtitle} onChange={e => setAppSubtitle(e.target.value)}
                  onBlur={() => { setEditingSubtitle(false); saveSetting('app_subtitle', appSubtitle); }}
                  onKeyDown={e => { if (e.key === 'Enter') { setEditingSubtitle(false); saveSetting('app_subtitle', appSubtitle); } }}
                  className="text-[10px] text-[#8e8574] font-medium tracking-wide bg-transparent border-b border-techo-teal/50 outline-none w-72" />
              ) : (
                <p className="text-[10px] text-[#8e8574] font-medium tracking-wide cursor-text hover:text-techo-teal transition-colors"
                  onDoubleClick={() => setEditingSubtitle(true)} title="双击编辑">{appSubtitle}</p>
              )}
            </div>
          </div>

          {/* QUICK TIME PRESENTS NAVS */}
          <div className="flex items-center gap-1.5 bg-[#fbfaf5] border border-[#d6cfbe] p-1 rounded-md text-xs select-none">
            <button
              onClick={() => setSubHeaderTab('year')}
              className={`px-3 py-1 rounded transition-all font-semibold cursor-pointer ${
                subHeaderTab === 'year' 
                  ? 'bg-[#8a816c] text-white shadow-xxs' 
                  : 'text-[#6e685a] hover:bg-[#eae6d8]'
              }`}
            >
              年计划
            </button>
            <button
              onClick={() => setSubHeaderTab('month')}
              className={`px-3 py-1 rounded transition-all font-semibold cursor-pointer ${
                subHeaderTab === 'month' 
                  ? 'bg-[#8a816c] text-white shadow-xxs' 
                  : 'text-[#6e685a] hover:bg-[#eae6d8]'
              }`}
            >
              月计划
            </button>
            <button
              onClick={() => setSubHeaderTab('week')}
              className={`px-3 py-1 rounded transition-all font-semibold cursor-pointer ${
                subHeaderTab === 'week' 
                  ? 'bg-[#8a816c] text-white shadow-xxs' 
                  : 'text-[#6e685a] hover:bg-[#eae6d8]'
              }`}
            >
              周计划 (主)
            </button>
          </div>

          {/* PALETTE CUSTOMIZER NAV BUTTON */}
          <button
            onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isCustomizerOpen 
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xxs' 
                : 'bg-[#fbfaf5] border border-[#d6cfbe] text-[#6e685a] hover:bg-[#eae6d8]'
            }`}
            title="个性定制手账封面皮质、纸墨配色与印章署名"
          >
            <Palette size={13} className={isCustomizerOpen ? 'animate-bounce' : ''} />
            <span>封面与纸质定制</span>
          </button>

          {/* USER CONFIG PROFILE AND METRICS STATUS CARD */}
          <div className="flex items-center gap-3 pr-2 relative">
            
            <div className="flex flex-col items-end text-right select-none">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {syncCode ? (
                  <button
                    onClick={() => navigator.clipboard.writeText(syncCode).catch(() => {})}
                    title="点击复制同步码"
                    className="text-[10px] text-gray-500 font-bold font-mono hover:text-techo-teal cursor-pointer transition-colors"
                  >
                    同步码: {syncCode}
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500 font-bold font-mono">D1 未连接</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#48453f] font-mono leading-none">{username}</span>
            </div>

            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-[#faf5e8] border border-[#cbd5e1] hover:border-techo-teal/60 cursor-pointer flex items-center justify-center text-[#8a816c] transition-all overflow-hidden"
              title="用户配置与选项"
            >
              <User size={16} />
            </button>

            {/* Profile Dropdown Simulation */}
            {isProfileOpen && (
              <div className="absolute right-0 top-10 mt-1 w-44 bg-white border-2 border-[#d3cfc3] rounded-md shadow-lg z-50 p-2 text-xs font-sans divide-y divide-gray-100">
                <div className="p-2">
                  <p className="font-bold text-[#3a3833]">手记作者 {username}</p>
                  <p className="text-[9px] text-gray-400">D1 Schema: Registered</p>
                </div>
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => { setActiveTab('database'); setIsProfileOpen(false); }}
                    className="w-full text-left p-1.5 hover:bg-[#fafaf3] rounded flex items-center gap-1.5 text-[#555047]"
                  >
                    <Database size={12} />
                    配置 D1 CLI 命令行
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(syncCode).catch(() => {});
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left p-1.5 hover:bg-[#fafaf3] rounded flex items-center gap-1.5 text-[#555047]"
                  >
                    <Key size={12} />
                    复制同步码 {syncCode}
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('techo_sync_code');
                      setSyncCode('');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left p-1.5 hover:bg-rose-50 text-red-600 rounded flex items-center gap-1.5"
                  >
                    ✕ 退出 / 切换同步码
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ==================== INDEPENDENT STATIONERY CUSTOMIZER STUDIO ==================== */}
        {isCustomizerOpen && (
          <div className="bg-white border-2 border-[var(--card-border,#d3cfc3)] rounded-lg p-5 shadow-sm animate-fade-in space-y-4 relative overflow-hidden">
            {/* Spine binding rings for stationery flavor */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 flex flex-col justify-between py-3 bg-[#d5cfbe] border-r border-[#bebaaa]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mx-auto shadow-inner" />
              ))}
            </div>
            
            <div className="pl-4">
              <div className="flex items-center justify-between border-b pb-2 border-techo-cream-darker mb-3">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-techo-teal animate-spin-slow" />
                  <h3 className="font-display font-extrabold text-sm text-[#3c3830]">
                    🎨 自我手帐・纸墨美化研制所 (Techo Customizer Studio)
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCustomizerOpen(false)}
                  className="text-xs text-[#8e8574] hover:text-red-700 font-bold cursor-pointer transition-colors"
                >
                  【 收起面板 ✕ 】
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                
                {/* Theme Jacket / Skins */}
                <div className="md:col-span-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6e685a] flex items-center gap-1">
                    📖 封面皮质与内页纸张 (Leather Cover & Sheets)
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {TECH_THEMES.map((theme) => {
                      const isSelected = activeThemeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleThemeChange(theme.id)}
                          className={`p-2 rounded border text-left text-xs transition-all relative ${
                            isSelected 
                              ? 'border-[#8a816c] ring-2 ring-amber-500 bg-[#fbfaf5]' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {/* Color Preview Dots */}
                            <div className="flex gap-1 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.colors['--page-bg'] }} />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.colors['--color-techo-cream'] }} />
                            </div>
                            <span className="font-bold truncate text-[#444]">{theme.name}</span>
                          </div>
                          <p className="text-[9.5px] text-gray-400 line-clamp-1 leading-none">{theme.description}</p>
                          {isSelected && (
                            <span className="absolute right-1.5 top-1 px-1 bg-[#8a816c] text-white rounded text-[8px] font-black">
                              ON
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6e685a] flex items-center gap-1">
                    <Type size={11} /> 书写字型笔迹 (Typographic Font)
                  </span>
                  <div className="space-y-1 select-none">
                    {[
                      { id: 'sans', name: '自然书体 (Inter Font)', preview: '经典无衬线' },
                      { id: 'display', name: '几何现代 (Outfit Tech)', preview: '创意几何流' },
                      { id: 'mono', name: '极客等宽 (Geek Code)', preview: '等宽程序员' },
                      { id: 'serif', name: '文艺宋体 (Lora Serif)', preview: '古雅宋纸风' },
                      { id: 'rounded', name: '圆润可爱 (Rounded)', preview: '柔和圆润感' },
                      { id: 'condensed', name: '紧凑标题 (Condensed)', preview: '紧凑有力度' },
                      { id: 'handwriting', name: '手写笔迹 (Handwriting)', preview: '手账涂鸦风' },
                    ].map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleFontChange(font.id)}
                        className={`w-full p-1 text-left rounded text-xs border transition-all ${
                          fontFamily === font.id 
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold' 
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center scale-95">
                          <span>{font.name}</span>
                          <span className="text-[9px] text-[#8e8574] italic">{font.preview}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hand Signature Name & Grid Opacity */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#6e685a]">
                      ✍️ 制定手账署名 (Owner Signature)
                    </label>
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Natasha"
                      maxLength={15}
                      className="w-full text-xs px-2.5 py-1 bg-white border border-[#cbe1de] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal font-sans text-[#444]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#6e685a]">
                      <label>📏 网格线深浅: {gridOpacity}%</label>
                      <button 
                        onClick={() => handleGridOpacityChange(gridOpacity === 40 ? 0 : 40)}
                        className="text-[9.5px] text-techo-teal hover:underline"
                      >
                        {gridOpacity === 0 ? '一键复原' : '纯净免格'}
                      </button>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={gridOpacity}
                      onChange={(e) => handleGridOpacityChange(parseInt(e.target.value))}
                      className="w-full accent-techo-teal h-1 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                      <span>极简白板 (0%)</span>
                      <span>清晰网格 (100%)</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* DAILY QUOTE BANNER */}
        <div className="bg-white border border-[#d3cfc3] rounded-lg px-5 py-3 shadow-xs flex items-center gap-3 min-h-[52px]">
          <span className="text-lg select-none shrink-0">✨</span>
          {editingQuote ? (
            <div className="flex-1 flex gap-2 items-center">
              <input
                autoFocus
                type="text"
                value={quoteInput}
                onChange={e => setQuoteInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const text = quoteInput.trim();
                    setCustomQuote(text);
                    if (text) saveSetting('custom_quote', text);
                    else api.settings.delete(syncCode, 'custom_quote').catch(() => {});
                    setEditingQuote(false);
                  }
                  if (e.key === 'Escape') setEditingQuote(false);
                }}
                placeholder="输入你今天的座右铭或励志语..."
                className="flex-1 text-sm text-[#48453f] bg-transparent border-b border-techo-teal outline-none font-sans italic"
              />
              <button onClick={() => {
                const text = quoteInput.trim();
                setCustomQuote(text);
                if (text) saveSetting('custom_quote', text);
                else api.settings.delete(syncCode, 'custom_quote').catch(() => {});
                setEditingQuote(false);
              }} className="text-[10px] px-2 py-1 bg-techo-teal text-white rounded cursor-pointer font-bold">保存</button>
              <button onClick={() => setEditingQuote(false)} className="text-[10px] px-2 py-1 border border-gray-200 rounded cursor-pointer text-gray-400">取消</button>
            </div>
          ) : (
            <>
              <p className="flex-1 text-sm text-[#48453f] italic font-medium leading-snug">{displayQuote}</p>
              <button
                onClick={() => { setQuoteInput(customQuote); setEditingQuote(true); }}
                className="shrink-0 text-[10px] text-gray-300 hover:text-techo-teal transition-colors cursor-pointer px-1.5 py-1 rounded hover:bg-techo-teal/5"
                title="自定义今日语句"
              >✏️ 自定义</button>
              {customQuote && (
                <button onClick={() => { setCustomQuote(''); api.settings.delete(syncCode, 'custom_quote').catch(() => {}); }}
                  className="shrink-0 text-[10px] text-gray-300 hover:text-red-400 transition-colors cursor-pointer px-1"
                  title="恢复每日自动语句">↺</button>
              )}
            </>
          )}
        </div>

        {/* YEAR OR MONTH SIMULATED PLAN OVERLAYS */}
        {subHeaderTab !== 'week' && (
          <div className="bg-[#fcfbf9] border border-[#cbd5e0] p-4 rounded-lg text-center font-sans space-y-2 animate-fade-in shadow-xxs">
            <h4 className="text-sm font-bold text-[#3c3830]">
              📅 日本国誉自我手帐 — {subHeaderTab === 'year' ? '年计划模块 (Yearly Vision)' : '月计划月球记录栏 (Monthly Lunar)'}
            </h4>
            <p className="text-xs text-gray-500">
               目前已经为您默认选中最核心的 <span className="text-techo-teal font-extrabold">“周计划 24 小时垂直时间轴”</span> 体系。月度/年度概览正在与 D1 进行全维映射。
            </p>
            <button 
              onClick={() => setSubHeaderTab('week')}
              className="text-xs px-3 py-1 bg-techo-teal text-white font-bold rounded cursor-pointer"
            >
              返回周计划垂直轴
            </button>
          </div>
        )}

        {/* ==================== 2. SIDEBAR RAIL AND WORKSPACE GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SIDEBAR NAVIGATION (2-cols on lg) */}
          <aside className="lg:col-span-2 bg-[#f5f3eb] border border-[#d6cfbe] p-2.5 rounded-lg flex flex-col gap-1.5 shadow-xxs">
            <div className="text-[10px] text-gray-500 font-bold px-2 py-1 uppercase select-none tracking-widest border-b border-[#eae6d8] mb-1 font-display">
              📒 纸页板块目录
            </div>

            <button
              onClick={() => setActiveTab('week')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'week' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Calendar size={14} className="text-techo-blue" />
              <span>主周计划 (24H)</span>
            </button>

            <button
              onClick={() => setActiveTab('self_growth')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'self_growth' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Sparkles size={14} className="text-techo-teal" />
              <span>成长・愿望技能树</span>
            </button>

            <button
              onClick={() => setActiveTab('work')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'work' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Briefcase size={14} className="text-[#e29453]" />
              <span>工作・项目目标 OKR</span>
            </button>

            <button
              onClick={() => setActiveTab('hobby')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'hobby' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Heart size={14} className="text-techo-pink" />
              <span>个人兴趣・书影收单</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'media' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <MessageSquareCode size={14} className="text-purple-600" />
              <span>自媒体・副业运营</span>
            </button>

            <button
              onClick={() => setActiveTab('parenting')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'parenting' 
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold' 
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Baby size={14} className="text-[#e09453]" />
              <span>养育孩子・生息守护</span>
            </button>

            <button
              onClick={() => setActiveTab('diary')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'diary'
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold'
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <BookOpen size={14} className="text-techo-teal" />
              <span>随笔・心境日记本</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold'
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Inbox size={14} className="text-amber-500" />
              <span className="flex-1">信息收集箱</span>
              {inboxItems.filter(i => !i.isReviewed).length > 0 && (
                <span className="text-[9px] font-bold bg-amber-400 text-white px-1 rounded-full leading-none py-0.5">
                  {inboxItems.filter(i => !i.isReviewed).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fitness')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'fitness'
                  ? 'bg-white border-l-4 border-techo-teal text-[#333] shadow-xs font-bold'
                  : 'text-[#6e685a] hover:bg-white/60 hover:text-black'
              }`}
            >
              <Activity size={14} className="text-emerald-500" />
              <span>健康・运动打卡</span>
            </button>

            <div className="h-[1px] bg-[#eae6d8] my-1.5" />

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full p-2 text-xs font-semibold rounded text-left flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'database' 
                  ? 'bg-white border-l-4 border-orange-500 text-orange-400 shadow-xs font-bold' 
                  : 'text-orange-950 hover:bg-orange-100/40 text-orange-800'
              }`}
            >
              <Database size={14} className="text-orange-500 animate-pulse" />
              <span>D1 数据库管理</span>
            </button>
          </aside>

          {/* MAIN WORKSHEET CONTENT WINDOW (10-cols on lg) */}
          <main className="lg:col-span-10">
            {activeTab === 'week' && (
              <div className="flex flex-col gap-3">
                {/* 我的 / 小树 切换 */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#f5f3eb] border border-[#d6cfbe] p-1 rounded-md text-xs select-none">
                    <button
                      onClick={() => setWeekPlan('mine')}
                      className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                        weekPlan === 'mine' ? 'bg-[#8a816c] text-white shadow-xs' : 'text-[#6e685a] hover:bg-[#eae6d8]'
                      }`}
                    >
                      我的计划
                    </button>
                    <button
                      onClick={() => setWeekPlan('baby')}
                      className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                        weekPlan === 'baby' ? 'bg-[#c06080] text-white shadow-xs' : 'text-[#6e685a] hover:bg-[#eae6d8]'
                      }`}
                    >
                      🌱 小树的计划
                    </button>
                  </div>
                  {/* 多周切换 */}
                  <div className="flex items-center gap-1 bg-[#f5f3eb] border border-[#d6cfbe] p-1 rounded-md text-xs select-none">
                    <button
                      onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                      disabled={weekOffset === 0}
                      className="px-2 py-1 rounded font-bold text-[#6e685a] hover:bg-[#eae6d8] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      ‹
                    </button>
                    <span className="px-2 py-1 font-semibold text-[#48453f]">
                      {weekOffset === 0 ? '本周' : weekOffset === 1 ? '下周' : weekOffset < 5 ? `${weekOffset}周后` : `${Math.round(weekOffset / 4)}个月后`}
                    </span>
                    <button
                      onClick={() => setWeekOffset(prev => Math.min(12, prev + 1))}
                      disabled={weekOffset >= 12}
                      className="px-2 py-1 rounded font-bold text-[#6e685a] hover:bg-[#eae6d8] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      ›
                    </button>
                    {weekOffset > 0 && (
                      <button
                        onClick={() => setWeekOffset(0)}
                        className="px-2 py-0.5 text-[9px] font-bold text-techo-teal hover:underline cursor-pointer"
                      >
                        回本周
                      </button>
                    )}
                  </div>
                </div>

                {weekPlan === 'mine' && (
                  <TechoGrid
                    cells={cells}
                    onSaveCell={handleSaveCell}
                    onClearCell={handleClearCell}
                    todayNotes={todayNotes}
                    onSaveTodayNote={handleSaveTodayNote}
                    username={username}
                    habits={habits}
                    onToggleHabit={handleToggleHabit}
                    onAddHabit={handleAddHabit}
                    onDeleteHabit={handleDeleteHabit}
                    weeklySummary={weeklySummary}
                    onSaveWeeklySummary={handleSaveWeeklySummary}
                    weekOffset={weekOffset}
                    onSaveSetting={saveSetting}
                    initialCoverBg={coverBg}
                    initialEditionLabel={editionLabel}
                  />
                )}

                {weekPlan === 'baby' && (
                  <BabyTechoGrid
                    cells={babyCells}
                    onSaveCell={handleSaveBabyCell}
                    onClearCell={handleClearBabyCell}
                    todayNotes={babyTodayNotes}
                    onSaveTodayNote={handleSaveBabyTodayNote}
                    childName="小树"
                    weekOffset={weekOffset}
                  />
                )}
              </div>
            )}

            {activeTab === 'self_growth' && (
              <SelfGrowthSection
                wishes={wishes}
                skills={skills}
                onToggleWish={handleToggleWish}
                onEditWish={handleEditWish}
                onAddWish={handleAddWish}
                onDeleteWish={handleDeleteWish}
                onToggleSkillGoal={handleToggleSkillGoal}
                onAddSkill={handleAddSkill}
                onAddSubgoal={handleAddSubgoal}
                onDeleteSkill={handleDeleteSkill}
                onDeleteSubgoal={handleDeleteSubgoal}
                onUpdateSkillStatus={handleUpdateSkillStatus}
              />
            )}

            {activeTab === 'work' && (
              <WorkSection
                targets={workTargets}
                onAddTarget={handleAddWorkTarget}
                onUpdateTarget={handleUpdateWorkTarget}
                onDeleteTarget={handleDeleteWorkTarget}
              />
            )}

            {activeTab === 'hobby' && (
              <HobbiesSection
                items={hobbies}
                onAddItem={handleAddHobby}
                onUpdateItem={handleUpdateHobby}
                onDeleteItem={handleDeleteHobby}
              />
            )}

            {activeTab === 'media' && (
              <MediaSideHustleSection
                contents={shContents}
                finance={finance}
                onAddContent={handleAddSHContent}
                onDeleteContent={handleDeleteSHContent}
                onUpdateContentStatus={handleUpdateSHContentStatus}
                onAddFinance={handleAddFinance}
                onDeleteFinance={handleDeleteFinance}
              />
            )}

            {activeTab === 'parenting' && (
              <ParentingSection
                milestones={milestones}
                onAddMilestone={handleAddChildMilestone}
                onDeleteMilestone={handleDeleteChildMilestone}
                diaries={childDiaries}
                onAddDiary={handleAddChildDiary}
                onDeleteDiary={handleDeleteChildDiary}
                childLogs={childLogs}
                onAddChildLog={handleAddChildLog}
                onDeleteChildLog={handleDeleteChildLog}
                resources={parentingResources}
                onAddResource={handleAddParentingResource}
                onDeleteResource={handleDeleteParentingResource}
              />
            )}

            {activeTab === 'diary' && (
              <DiarySection
                diaryNotes={diaryNotes}
                username={username}
                onAddDiary={handleAddDiary}
                onUpdateDiary={handleUpdateDiary}
                onDeleteDiary={handleDeleteDiary}
              />
            )}

            {activeTab === 'inbox' && (
              <InboxSection
                items={inboxItems}
                onAdd={handleAddInbox}
                onUpdate={handleUpdateInbox}
                onDelete={handleDeleteInbox}
              />
            )}

            {activeTab === 'fitness' && (
              <FitnessSection
                logs={fitnessLogs}
                onAdd={handleAddFitness}
                onUpdate={handleUpdateFitness}
                onDelete={handleDeleteFitness}
              />
            )}

            {activeTab === 'database' && (
              <D1Console
                logs={d1Logs}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
                activeState={{
                  wishes,
                  skills,
                  workTargets,
                  hobbies,
                  shContents,
                  finance,
                  milestones,
                  childLogs,
                  cells,
                  diaryNotes
                }}
              />
            )}
          </main>

        </div>

        {/* ==================== 3. SYSTEM FOOTER ==================== */}
        <footer className="mt-auto bg-white border-2 border-[#d3cfc3] rounded-lg p-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8e8574] font-medium shadow-xxs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-0.5 animate-pulse" />
            <span className="font-bold text-[#48453f]">D1 数据库：已连接 (Live Connected)</span>
            <span className="text-gray-300"> | </span>
            <span>表迁移正常: ok</span>
          </div>

          <div className="mt-1 sm:mt-0 flex items-center gap-3 font-mono text-[10px]">
            <span>托管于 Cloudflare Workers & Cloud Run Containers</span>
            <span className="text-gray-350">•</span>
            <span>自我手帐 Web S3-v2</span>
          </div>
        </footer>

      </div>
    </div>
    </>
  );
}
