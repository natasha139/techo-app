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
  height?: string; // e.g. "72" or "72cm"
  weight?: string; // e.g. "9.5" or "9.5kg"
}
