/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Define structures for Jibun Techo sections

export interface WishItem {
  id: string;
  order: number; // 1 to 100
  content: string;
  isCompleted: boolean;
  category: string;
}

export interface SkillSubGoal {
  id: string;
  name: string;
  isDone: boolean;
}

export interface SkillNode {
  id: string;
  skillName: string;
  status: 'learning' | 'mastered' | 'not_started';
  subGoals: SkillSubGoal[];
  category: string;
}

export interface WorkTarget {
  id: string;
  quarterGoal: string;
  keyResults: string;
  projects: string;
  deadline: string;
  progress: number; // 0 to 100
}

export interface HobbyCollectionItem {
  id: string;
  title: string;
  type: 'book' | 'movie' | 'hobby';
  creator: string; // Author or Director or Category
  lastDate: string;
  description: string;
  rating: number; // 1 to 5 stars
  coverUrl?: string;
}

export interface SideHustleContent {
  id: string;
  platform: string; // e.g., "微信公众号", "Bilibili", "小红书"
  topic: string;
  format: 'video' | 'article' | 'image_text' | 'other';
  publishDate: string;
  status: 'concept' | 'in_progress' | 'published';
}

export interface FinancialMetric {
  id: string;
  month: string; // "2026.06"
  traffic: number; // e.g. Views, followers increment
  revenue: number; // Income
  expense: number; // Expense
  note: string;
}

export interface ChildMilestone {
  id: string;
  title: string;
  date: string;
  notes: string;
}

export interface ChildDailyLog {
  id: string;
  time: string; // "08:30"
  type: 'feeding' | 'sleep' | 'activity' | 'notes';
  spec: string; // e.g. "150ml milk", "slept 1.5h"
  notes: string;
}

export interface PlannerCell {
  id: string; // "dayIndex-hour" (e.g. "0-8")
  text: string;
  color?: string; // custom highlight color
  tag?: string; // Category or feeling tag
}

export interface WeeklySummary {
  theme: string;
  priorities: string[];
  practice: string;
  reminder: string;
  reviewQuestion: string;
}

export interface HabitTracker {
  id: string;
  name: string;
  history: { [dayIndex: number]: boolean }; // dayIndex (0 to 6) -> isCompleted
}

export interface DiaryNote {
  id: string;
  title: string;
  date: string;
  weather?: string;
  mood?: string;
  category: string;
  content: string;
  tags?: string[];
}

export interface D1SyncLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'query';
  message: string;
  sql?: string;
}

export interface ChildDiary {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  height?: string; // e.g. "120" or "120cm"
  weight?: string; // e.g. "25" or "25kg"
}

// 信息收集条目 (Inbox Clipping)
export interface InboxItem {
  id: string;
  title: string;       // 项目名称，如 "ICEP HK 教育规划师"
  url?: string;        // 来源链接（可选）
  notes?: string;      // 简短备注
  category: string;    // 分类标签，如 "教育资源" / "工具" / "课程" / "待研究"
  isReviewed: boolean; // 是否已查阅
  createdAt: string;   // ISO date string
}

// 健身/健康打卡记录
export interface FitnessLog {
  id: string;
  date: string;        // "2026-06-07"
  weight?: number;     // 体重 kg
  exercise?: string;   // 运动内容描述
  duration?: number;   // 运动时长 (分钟)
  calories?: number;   // 消耗卡路里 (可选)
  meals?: string;      // 当日饮食记录
  note?: string;       // 额外备注
}

// 育儿资源条目 (工具/书籍/App)
export interface ParentingResource {
  id: string;
  name: string;        // 名称，如 "Khan Academy Kids"
  type: 'app' | 'book' | 'tool' | 'course' | 'website';
  subject?: string;    // 学科/领域，如 "数学" / "英语" / "编程"
  ageRange?: string;   // 适合年龄，如 "6-10岁"
  rating?: number;     // 1-5 评分
  notes?: string;      // 使用心得
  url?: string;
}
