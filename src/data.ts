/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  DiaryNote,
  ChildDiary,
  WeeklySummary
} from './types';

export const initialWeeklySummary: WeeklySummary = {
  theme: '稳定输出，不把生活切碎',
  priorities: [
    '完成 D1 数据同步最小闭环',
    '写完一篇「自我手帐」创作笔记',
    '给宝宝做一次完整户外观察记录'
  ],
  practice: '深度工作 90 分钟，不中途换任务',
  reminder: '慢一点也没关系，重要的是不要断。',
  reviewQuestion: '我有没有真的留出安静时间？'
};

// Default initial dataset to populated State in Kokuyo Techo Style
export const initialWishes: WishItem[] = [
  { id: 'w1', order: 1, content: '熟练掌握 Cloudflare D1 边缘数据库开发', isCompleted: false, category: '成长' },
  { id: 'w2', order: 2, content: '构建一个基于 React 19 + Tailwind CSS 极美手帐并上线', isCompleted: true, category: '成长' },
  { id: 'w3', order: 3, content: '搭建一个自媒体技术博客获得 1000 位订阅者', isCompleted: false, category: '自媒体' },
  { id: 'w4', order: 4, content: '给宝宝写 50 篇成长手记并录制成长视频集锦', isCompleted: false, category: '养育' },
  { id: 'w5', order: 5, content: '打通 Cloudflare Workers 的 OAuth 身份核验流', isCompleted: false, category: '工作' },
  { id: 'w6', order: 6, content: '精读《设计数据密集型应用 (DDIA)》并完成笔记', isCompleted: true, category: '成长' },
  { id: 'w7', order: 7, content: '今年坚持每周五进行一次个人复盘与周计划', isCompleted: true, category: '成长' },
  { id: 'w8', order: 8, content: '为全家制定一份 5 年财务与保险资产配置计划', isCompleted: false, category: '个人' }
];

// Seed other wish placeholders to reach a clean, structured appearance
for (let i = 9; i <= 30; i++) {
  initialWishes.push({
    id: `w_temp_${i}`,
    order: i,
    content: i === 9 ? '带家人进行一趟京都秋季红叶亲子游' : i === 10 ? '宝宝体检指标全部符合优秀档位' : '',
    isCompleted: false,
    category: i === 9 ? '生活' : i === 10 ? '养育' : '成长'
  });
}

export const initialSkills: SkillNode[] = [
  {
    id: 's1',
    skillName: 'Cloudflare D1 数据库开发',
    status: 'learning',
    category: '成长',
    subGoals: [
      { id: 's1-1', name: '理解 wrangler.toml 数据库绑定规则', isDone: true },
      { id: 's1-2', name: '设计并编写 schema.sql 初始化脚本', isDone: true },
      { id: 's1-3', name: '在 Worker 中实现 fetch 并代理 SQLite 语句', isDone: false },
      { id: 's1-4', name: '结合 D1 和 KV 缓存机制，优化全球查询延迟', isDone: false }
    ]
  },
  {
    id: 's2',
    skillName: '自媒体短视频剪辑 / 文案撰写',
    status: 'learning',
    category: '自媒体',
    subGoals: [
      { id: 's2-1', name: '学习日本国誉手帐 (Kokuyo) 无纸化网格审美', isDone: true },
      { id: 's2-2', name: '建立统一高对比度日系配色调色预设', isDone: true },
      { id: 's2-3', name: '每周更新两篇原创文章与手帐模板指南', isDone: false }
    ]
  },
  {
    id: 's3',
    skillName: '前端 TypeScript 系统架构设计',
    status: 'mastered',
    category: '工作',
    subGoals: [
      { id: 's3-1', name: '掌握 React 19 Concurrent Mode 与新 Hooks', isDone: true },
      { id: 's3-2', name: '配置 Vite 进行全功能离线 PWA 整合', isDone: true }
    ]
  }
];

export const initialWorkTargets: WorkTarget[] = [
  {
    id: 'wt1',
    quarterGoal: 'D1 自我成长手帐平台内测版发布',
    keyResults: '核心 24H 垂直网格完成; 愿望清单与家庭育儿模块全面离线读写支持',
    projects: '自我手帐 Web SPA 研发',
    deadline: '2026-06-30',
    progress: 85
  },
  {
    id: 'wt2',
    quarterGoal: '自媒体矩阵粉丝数突破 5k 关口',
    keyResults: '双平台各发布 10 篇结构化教程; 平均文章阅读量超 3,000',
    projects: '自我成长的副业技术探索',
    deadline: '2026-07-15',
    progress: 40
  },
  {
    id: 'wt3',
    quarterGoal: '宝宝幼儿综合里程碑复查',
    keyResults: '精细动作训练日均达 30 分钟; 按时接种满 1 周岁第二批疫苗',
    projects: '育儿守护成长日志项目',
    deadline: '2026-06-25',
    progress: 60
  }
];

export const initialHobbies: HobbyCollectionItem[] = [
  {
    id: 'h1',
    title: '海伯利安 (Hyperion)',
    type: 'book',
    creator: '丹·西蒙斯 (Dan Simmons)',
    lastDate: '2026-05-18',
    description: '太空歌剧史诗神作。通过朝圣者的视角编织出一幅极度宏大且震撼的未来绘卷，关于时间、爱与毁灭。',
    rating: 5
  },
  {
    id: 'h2',
    title: '星际穿越 (Interstellar)',
    type: 'movie',
    creator: '克里斯托弗·诺兰 (Christopher Nolan)',
    lastDate: '2026-05-24',
    description: '爱是跨越维度、空间与时间的唯一力量。配乐极其出众，重温依旧泪目。',
    rating: 5
  },
  {
    id: 'h3',
    title: '复古胶片摄影与冲洗工艺',
    type: 'hobby',
    creator: '菲林美学',
    lastDate: '2026-06-01',
    description: '使用富士 X-TRA 400 进行街头纪实拍摄。重新审视日常的光线、影调与冲晒的延迟满足。',
    rating: 4
  }
];

export const initialSideHustles: SideHustleContent[] = [
  { id: 'sh1', platform: '微信公众号', topic: '日本 Kokuyo 自我手帐如何科学解构并优化我们的一天', format: 'article', publishDate: '2026-06-05', status: 'concept' },
  { id: 'sh2', platform: 'Bilibili 视频', topic: '纯前端高颜值：构建一键同步 CF D1 的极致日式时间网格手帐', format: 'video', publishDate: '2026-06-12', status: 'in_progress' },
  { id: 'sh3', platform: '小红书', topic: '关于无痛养育：宝宝一岁生活规律垂直小时表与喂饭习惯', format: 'image_text', publishDate: '2026-05-28', status: 'published' }
];

export const initialFinancialMetrics: FinancialMetric[] = [
  { id: 'fm1', month: '2026.04', traffic: 1200, revenue: 120.50, expense: 35.00, note: '公众号首笔打赏及流量主收入' },
  { id: 'fm2', month: '2026.05', traffic: 3800, revenue: 650.00, expense: 50.00, note: '教程文档专栏合集付费购买收入增多' },
  { id: 'fm3', month: '2026.06', traffic: 4500, revenue: 820.00, expense: 120.00, note: '加入赞助计划，升级 Cloudflare Pro 产生消耗' }
];

export const initialMilestones: ChildMilestone[] = [
  { id: 'cm1', title: '第一次爬行 (Crawling on hands & knees)', date: '2025-11-12', notes: '手脚并用力往前拱，抓住了放在沙发旁边的毛绒龙玩具' },
  { id: 'cm2', title: '学会自己扶着小床站立起来超过 30 秒', date: '2026-02-15', notes: '晃晃悠悠抓着栏杆挺起身子，满脸兴奋地对妈妈笑' },
  { id: 'cm3', title: '第一次开口叫“妈妈” (Spoke word Mama)', date: '2026-04-03', notes: '在喂辅食胡萝卜泥时，清晰、无意识地发出"Ma-ma"叫声，全家大喜' }
];

export const initialChildDiaries: ChildDiary[] = [
  {
    id: 'cd1',
    date: '2026-06-01',
    title: '🌿 宝贝第一次草地亲密接触',
    content: '天气极好，下午带宝宝去小公园野餐。宝宝第一次脱掉鞋袜踩在嫩绿毛绒的草地上，一开始小心翼翼紧紧攥住妈妈衣角，两边小脚丫向上翘。过了一小会就开始开心地两只小胖手试探着拍打草泥，不停咯咯咯地大笑。抓起一片树叶也玩得不亦乐乎。今天喝辅食和小水，超级顺利！',
    mood: '🥰 兴奋满满',
    height: '74.5cm',
    weight: '10.1kg'
  },
  {
    id: 'cd2',
    date: '2026-06-03',
    title: '🍼 喂饭自主执勺的伟大突破',
    content: '晚上在全家快乐聚餐时，宝宝突然拒绝被喂。竟然伸手用力夺过塑料黄色软硅胶小汤匙，自顾自挖起一点南瓜泥！虽然搞得小脸上、围兜和小餐椅四周糊得全是粉橘色的糊糊，但她稳稳将一勺送进了自己嘴里，得意极了！全家齐拍手，记录下这珍贵的一刻。',
    mood: '😇 聪慧成就',
    height: '75.0cm',
    weight: '10.2kg'
  }
];

export const initialChildLogs: ChildDailyLog[] = [
  { id: 'cl1', time: '07:30', type: 'feeding', spec: '180ml 奶粉', notes: '苏醒顺利，精神状态佳，无吐奶。' },
  { id: 'cl2', time: '11:00', type: 'sleep', spec: '上午觉 1.5 小时', notes: '抱放白噪音秒睡，12:30 准时醒来。' },
  { id: 'cl3', time: '13:00', type: 'feeding', spec: '鳕鱼时蔬土豆泥辅食', notes: '基本全部吃光，胃口超棒，喂水 30ml。' },
  { id: 'cl4', time: '14:30', type: 'activity', spec: '益智配对积木训练', notes: '开始抓握积木精准投入盒中，手脑协调大大提高。' },
  { id: 'cl5', time: '18:30', type: 'feeding', spec: '200ml 奶粉', notes: '晚间常例睡前奶，喝得很急。' },
  { id: 'cl6', time: '20:00', type: 'sleep', spec: '进入整晚夜间觉', notes: '听完妈妈讲的晚安故事后安静睡熟。' }
];

// Initial pre-loaded planner cells representing standard week plan for Kokuyo Jibun Techo demo
export const initialPlannerCells: PlannerCell[] = [
  // Mon (dayIndex 0)
  { id: '0-7', text: '🌤️ 晨间冥想与周计划复盘', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: '0-9', text: '💼 项目周会与Q4愿景对齐 (Work)', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: '0-10', text: '💼 项目周会与Q4愿景对齐 (Work)', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: '0-14', text: '⚡ 集中精力：D1 schema 建表编写', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: '0-15', text: '⚡ 集中精力：D1 schema 建表编写', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: '0-19', text: '🍼 喂宝宝晚餐与饭后散步', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  // Tue (dayIndex 1)
  { id: '1-8', text: '🏃 晨跑锻炼 3公里', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: '1-10', text: '💻 Code Review / TypeScript 特性研究', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: '1-14', text: '📖 独处时刻：精读 DDIA 第六章关于分区', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: '1-21', text: '📝 自媒体文案素材整理：关于文具手帐', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  // Wed (dayIndex 2)
  { id: '2-9', text: '💼 Cloudflare Workers HTTP API 接口调试', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { id: '2-16', text: '🍼 线上儿科健康线上咨询问诊', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { id: '2-20', text: '🎨 整理「自我手帐」交互与矢量图标库', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  // Thu (dayIndex 3)
  { id: '3-10', text: '💼 D1 多地域副本同步延迟极限测试', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: '3-13', text: '🌱 技能树更新：打通 KV 临时鉴权', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: '3-19', text: '🧸 宝宝早教益智拼图游戏时间', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  // Fri (dayIndex 4)
  { id: '4-9', text: '💼 总结报告撰写 & 数据库审计提交', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: '4-14', text: '🎬 自媒体视频录制与首轮高光剪辑', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: '4-21', text: '🎮 极夜游戏放松 / 影单《星际穿越》重温', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  // Sat (dayIndex 5)
  { id: '5-9', text: '🎡 萌娃亲子露营日（室外草地体验）', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: '5-11', text: '🎡 萌娃亲子露营日（室外草地体验）', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: '5-14', text: '🎡 萌娃亲子露营日（室外草地体验）', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: '5-17', text: '🎡 亲子越野车与草堆野餐', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  // Sun (dayIndex 6)
  { id: '6-10', text: '🧹 全屋大扫除与除螨除尘', color: 'bg-slate-50 text-slate-800 border-slate-200' },
  { id: '6-14', text: '☕ 日式手纸复盘 + 一周营养餐食谱准备', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: '6-19', text: '🔮 整理 D1 SQL 语句并进行同步校验日志检查', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' }
];

export const initialDiaryNotes: DiaryNote[] = [
  {
    id: 'note1',
    title: '深夜与 Cloudflare D1 数据库偶遇',
    date: '2026-06-01',
    weather: '晴 ☀️',
    mood: '🧘 平静',
    category: '技术思考',
    content: '开始用 D1 构建自研手帐系统的底层。边缘 SQL 相比传统集中式云数据库有一种奇妙的轻量感。今天完成了愿望清单元表的设计，决定用 SQLite 做数据底座，让离线数据和在线同步达到一种极致的和谐。',
    tags: ['Cloudflare', 'SQLite', '架构']
  },
  {
    id: 'note2',
    title: '儿童大运动发展观察',
    date: '2026-06-02',
    weather: '微风 🍃',
    mood: '🌟 欣喜',
    category: '生活记录',
    content: '宝宝今天在小床上，竟然自己抓着横杆扶站了将近一分钟！眼睛圆溜溜地盯着我，好像在说“看，我也能站高高了”。那一瞬间心软得一塌糊涂。生命的成长真的是一步一个台阶，快到让人舍不会错过任何一秒。',
    tags: ['育儿', '温馨', '大运动']
  },
  {
    id: 'note3',
    title: '手帐哲学：做时间的朋友',
    date: '2025-12-31',
    weather: '小雨 🌧️',
    mood: '☕ 温暖',
    category: '随笔感悟',
    content: '不知不觉又到了一年的最后一天。用国誉自我手帐也有三年了，它不是在限制我，而是在帮我找到呼吸的节奏。把那些琐碎的、日常的事情记录下来，时间就从指缝间的流沙，变成了可以被触摸、被翻阅的实物。',
    tags: ['手帐哲学', '时间管理', '生活美学']
  },
  {
    id: 'note_chronicle_sample',
    title: '2026-06-03 事实流水日记账 📋',
    date: '2026-06-03',
    weather: '微风 🍃',
    mood: '🧘 平静',
    category: '流水账',
    content: '睡眠：23:30睡，7:00醒，中间醒过一次\n饮食：早饭冲了一杯芝麻粉燕麦片，午饭自己带了三明治，晚饭回家煮了苹果粥\n工作：找了三个选题，写了2000字，开了2小时会\n阅读：看了《长安的荔枝》30页，学到“荔枝转运”的历史细节\n新知识：荔枝在古代要用盐水浸泡保鲜\n灵感：突然想到一个故事开头，关于一个会说话的猫',
    tags: ['事实日记', '免AI质检', '极简客观']
  }
];

// Cloudflare D1 SQL Schema Creator (Returns standard SQL schema based on current model structures)
export const D1_SQL_SCHEMA = `
-- ==========================================
-- JIBUN TECHO (自我手帐) CLOUDFLARE D1 SCHEMA
-- ==========================================

-- 1. 100件愿望清单
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  \`order\` INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  category TEXT NOT NULL
);

-- 2. 技能树与子目标
CREATE TABLE IF NOT EXISTS skill_nodes (
  id TEXT PRIMARY KEY,
  skill_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'learning', 'mastered', 'not_started'
  category TEXT DEFAULT '成长'
);

CREATE TABLE IF NOT EXISTS skill_sub_goals (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_done INTEGER DEFAULT 0,
  FOREIGN KEY (skill_id) REFERENCES skill_nodes (id) ON DELETE CASCADE
);

-- 3. 工作与项目目标 (Q4 目标管理)
CREATE TABLE IF NOT EXISTS work_targets (
  id TEXT PRIMARY KEY,
  quarter_goal TEXT NOT NULL,
  key_results TEXT NOT NULL,
  projects TEXT NOT NULL,
  deadline TEXT NOT NULL,
  progress INTEGER DEFAULT 0
);

-- 4. 个人兴趣爱好收藏 (书单、影单卡片结构)
CREATE TABLE IF NOT EXISTS hobby_collection (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'book', 'movie', 'hobby'
  creator TEXT NOT NULL,
  last_date TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  cover_url TEXT
);

-- 5. 自媒体与副业运营
CREATE TABLE IF NOT EXISTS side_hustle_contents (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  topic TEXT NOT NULL,
  format TEXT NOT NULL, -- 'video', 'article', 'image_text', 'other'
  publish_date TEXT NOT NULL,
  status TEXT NOT NULL -- 'concept', 'in_progress', 'published'
);

CREATE TABLE IF NOT EXISTS financial_metrics (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  traffic INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0.0,
  expense REAL DEFAULT 0.0,
  note TEXT
);

-- 6. 养育孩子成长手记
CREATE TABLE IF NOT EXISTS child_milestones (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS child_daily_logs (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL, -- e.g. "08:30"
  type TEXT NOT NULL, -- 'feeding', 'sleep', 'activity', 'notes'
  spec TEXT NOT NULL,
  notes TEXT NOT NULL
);

-- 7. 主视图周计划网格数据存储
CREATE TABLE IF NOT EXISTS planner_grid_cells (
  id TEXT PRIMARY KEY, -- format: "dayIndex-hour" (e.g., "3-14")
  cell_text TEXT NOT NULL,
  color_class TEXT,
  category_tag TEXT
);

-- 8. 随笔日志页面存储
CREATE TABLE IF NOT EXISTS diary_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  weather TEXT,
  mood TEXT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT
);
`;

// Helper to generate dynamic INSERT queries representing user active state
export function generateSQLInserts(state: {
  wishes: WishItem[];
  skills: SkillNode[];
  workTargets: WorkTarget[];
  hobbies: HobbyCollectionItem[];
  shContents: SideHustleContent[];
  finance: FinancialMetric[];
  milestones: ChildMilestone[];
  childLogs: ChildDailyLog[];
  cells: PlannerCell[];
  diaryNotes: DiaryNote[];
}): string {
  let batch = `-- D1 SQL EXPORT GENERATED AT ${new Date().toISOString()}\n`;
  batch += `BEGIN TRANSACTION;\n\n`;

  // Wishes
  batch += `-- Wishes\nDELETE FROM wishes;\n`;
  state.wishes.forEach(w => {
    if (w.content.trim()) {
      const sql_content = w.content.replace(/'/g, "''");
      const sql_cat = w.category.replace(/'/g, "''");
      batch += `INSERT INTO wishes (id, \`order\`, content, is_completed, category) VALUES ('${w.id}', ${w.order}, '${sql_content}', ${w.isCompleted ? 1 : 0}, '${sql_cat}');\n`;
    }
  });

  // Skills
  batch += `\n-- Skills & Subgoals\nDELETE FROM skill_sub_goals;\nDELETE FROM skill_nodes;\n`;
  state.skills.forEach(s => {
    if (s.skillName.trim()) {
      const sql_name = s.skillName.replace(/'/g, "''");
      const sql_cat = (s.category || '成长').replace(/'/g, "''");
      batch += `INSERT INTO skill_nodes (id, skill_name, status, category) VALUES ('${s.id}', '${sql_name}', '${s.status}', '${sql_cat}');\n`;
      s.subGoals.forEach(sg => {
        if (sg.name.trim()) {
          const sql_sub_name = sg.name.replace(/'/g, "''");
          batch += `INSERT INTO skill_sub_goals (id, skill_id, name, is_done) VALUES ('${sg.id}', '${s.id}', '${sql_sub_name}', ${sg.isDone ? 1 : 0});\n`;
        }
      });
    }
  });

  // Work targets
  batch += `\n-- Work Targets\nDELETE FROM work_targets;\n`;
  state.workTargets.forEach(wt => {
    if (wt.quarterGoal.trim()) {
      const g = wt.quarterGoal.replace(/'/g, "''");
      const kr = wt.keyResults.replace(/'/g, "''");
      const p = wt.projects.replace(/'/g, "''");
      batch += `INSERT INTO work_targets (id, quarter_goal, key_results, projects, deadline, progress) VALUES ('${wt.id}', '${g}', '${kr}', '${p}', '${wt.deadline}', ${wt.progress});\n`;
    }
  });

  // Hobbies
  batch += `\n-- Hobbies Collection\nDELETE FROM hobby_collection;\n`;
  state.hobbies.forEach(h => {
    if (h.title.trim()) {
      const t = h.title.replace(/'/g, "''");
      const c = h.creator.replace(/'/g, "''");
      const d = h.description.replace(/'/g, "''");
      batch += `INSERT INTO hobby_collection (id, title, type, creator, last_date, description, rating) VALUES ('${h.id}', '${t}', '${h.type}', '${c}', '${h.lastDate}', '${d}', ${h.rating});\n`;
    }
  });

  // Side Hustles
  batch += `\n-- Side Hustle Content\nDELETE FROM side_hustle_contents;\n`;
  state.shContents.forEach(sh => {
    if (sh.topic.trim()) {
      const top = sh.topic.replace(/'/g, "''");
      const plat = sh.platform.replace(/'/g, "''");
      batch += `INSERT INTO side_hustle_contents (id, platform, topic, format, publish_date, status) VALUES ('${sh.id}', '${plat}', '${top}', '${sh.format}', '${sh.publishDate}', '${sh.status}');\n`;
    }
  });

  // Finances
  batch += `\n-- Financial Metrics\nDELETE FROM financial_metrics;\n`;
  state.finance.forEach(f => {
    const n = f.note.replace(/'/g, "''");
    batch += `INSERT INTO financial_metrics (id, month, traffic, revenue, expense, note) VALUES ('${f.id}', '${f.month}', ${f.traffic}, ${f.revenue}, ${f.expense}, '${n}');\n`;
  });

  // Parenting Milestones
  batch += `\n-- Child Milestones\nDELETE FROM child_milestones;\n`;
  state.milestones.forEach(m => {
    if (m.title.trim()) {
      const t = m.title.replace(/'/g, "''");
      const n = m.notes.replace(/'/g, "''");
      batch += `INSERT INTO child_milestones (id, title, date, notes) VALUES ('${m.id}', '${t}', '${m.date}', '${n}');\n`;
    }
  });

  // Parenting Logs
  batch += `\n-- Child Daily Logs\nDELETE FROM child_daily_logs;\n`;
  state.childLogs.forEach(cl => {
    const s = cl.spec.replace(/'/g, "''");
    const n = cl.notes.replace(/'/g, "''");
    batch += `INSERT INTO child_daily_logs (id, time, type, spec, notes) VALUES ('${cl.id}', '${cl.time}', '${cl.type}', '${s}', '${n}');\n`;
  });

  // Weekly cells
  batch += `\n-- Weekly Planner Cells\nDELETE FROM planner_grid_cells;\n`;
  state.cells.forEach(c => {
    if (c.text.trim()) {
      const t = c.text.replace(/'/g, "''");
      batch += `INSERT INTO planner_grid_cells (id, cell_text, color_class, category_tag) VALUES ('${c.id}', '${t}', '${c.color || ''}', '${c.tag || ''}');\n`;
    }
  });

  // Diary Notes
  batch += `\n-- Diary Notes\nDELETE FROM diary_notes;\n`;
  state.diaryNotes.forEach(dn => {
    if (dn.title.trim()) {
      const t = dn.title.replace(/'/g, "''");
      const c = dn.content.replace(/'/g, "''");
      const cat = dn.category.replace(/'/g, "''");
      const w = (dn.weather || '').replace(/'/g, "''");
      const m = (dn.mood || '').replace(/'/g, "''");
      const tagsStr = (dn.tags || []).join(',');
      batch += `INSERT INTO diary_notes (id, title, date, weather, mood, category, content, tags) VALUES ('${dn.id}', '${t}', '${dn.date}', '${w}', '${m}', '${cat}', '${c}', '${tagsStr}');\n`;
    }
  });

  batch += `\nCOMMIT;\n-- SQL Export Completes successfully.`;
  return batch;
}
