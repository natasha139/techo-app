/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, CheckSquare, Square, Plus, Trash2, Edit2, CheckCircle2, Search, Filter } from 'lucide-react';
import { WishItem, SkillNode, SkillSubGoal } from '../types';

interface SelfGrowthProps {
  wishes: WishItem[];
  skills: SkillNode[];
  onToggleWish: (id: string) => void;
  onEditWish: (id: string, content: string, category: string) => void;
  onAddWish: (content: string, category: string) => void;
  onDeleteWish: (id: string) => void;
  onToggleSkillGoal: (skillId: string, goalId: string) => void;
  onAddSkill: (skillName: string, category: string) => void;
  onAddSubgoal: (skillId: string, name: string) => void;
  onDeleteSkill: (id: string) => void;
  onDeleteSubgoal: (skillId: string, subgoalId: string) => void;
  onUpdateSkillStatus: (id: string, status: 'learning' | 'mastered' | 'not_started') => void;
}

export default function SelfGrowthSection({
  wishes,
  skills,
  onToggleWish,
  onEditWish,
  onAddWish,
  onDeleteWish,
  onToggleSkillGoal,
  onAddSkill,
  onAddSubgoal,
  onDeleteSkill,
  onDeleteSubgoal,
  onUpdateSkillStatus
}: SelfGrowthProps) {
  
  // Local state for adding wishes
  const [newWishContent, setNewWishContent] = useState('');
  const [newWishCategory, setNewWishCategory] = useState('成长');
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [editWishContent, setEditWishContent] = useState('');
  const [editWishCat, setEditWishCat] = useState('');

  // Local state for skills
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('成长');
  const [newSubgoalText, setNewSubgoalText] = useState<{ [key: string]: string }>({});

  // Local state for category and text filters
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleAddWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWishContent.trim()) {
      onAddWish(newWishContent.trim(), newWishCategory);
      setNewWishContent('');
    }
  };

  const handleStartEditWish = (wish: WishItem) => {
    setEditingWishId(wish.id);
    setEditWishContent(wish.content);
    setEditWishCat(wish.category);
  };

  const handleSaveWishEdit = (id: string) => {
    onEditWish(id, editWishContent, editWishCat);
    setEditingWishId(null);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillName.trim()) {
      onAddSkill(newSkillName.trim(), newSkillCategory);
      setNewSkillName('');
    }
  };

  const handleCreateSubgoal = (skillId: string) => {
    const text = newSubgoalText[skillId] || '';
    if (text.trim()) {
      onAddSubgoal(skillId, text.trim());
      setNewSubgoalText(prev => ({ ...prev, [skillId]: '' }));
    }
  };

  // Determine filtering status
  const isFilteringActive = selectedFilterCategory !== 'all' || searchKeyword.trim() !== '';

  // Filter wishes
  const filteredWishes = wishes.filter(wish => {
    // If not filtering, show normal view (placeholders allowed)
    if (!isFilteringActive) return true;

    // If filtering, only show items with actual content
    if (!wish.content) return false;

    const matchesCategory = selectedFilterCategory === 'all' || wish.category === selectedFilterCategory;
    const matchesKeyword = searchKeyword.trim() === '' || 
      wish.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      wish.category.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesCategory && matchesKeyword;
  });

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const skillCat = skill.category || '成长';
    const matchesCategory = selectedFilterCategory === 'all' || skillCat === selectedFilterCategory;
    
    const matchesKeyword = searchKeyword.trim() === '' || 
      skill.skillName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (skill.category || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      skill.subGoals.some(sub => sub.name.toLowerCase().includes(searchKeyword.toLowerCase()));

    return matchesCategory && matchesKeyword;
  });

  return (
    <div className="space-y-6">
      
      {/* UNIFIED STATIONERY-STYLE FILTER TAB BAR */}
      <div id="self-growth-filter-bar" className="bg-[#fcfbfa] border-2 border-[#d3cfc3] rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-techo-teal/10 rounded-lg text-techo-teal">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-black text-[#3c3830] text-sm">个人成长与长远目标 (Life Alignment)</h2>
            <p className="text-[10px] text-[#8e8674] mt-0.5">筛选并对齐 100 件愿望清单与长期技能树拓扑，聚焦对应成长领域</p>
          </div>
        </div>

        {/* Tab-styled sticky tab filters */}
        <div className="flex flex-wrap items-center gap-1 bg-[#efede5] p-1 rounded-md border border-[#d6cfbe] text-[11px] font-bold">
          {[
            { value: 'all', label: '全部' },
            { value: '成长', label: '成长 💡' },
            { value: '生活', label: '生活 🍃' },
            { value: '工作', label: '工作 💼' },
            { value: '自媒体', label: '自媒体 📱' },
            { value: '养育', label: '家庭 👶' }
          ].map((cat) => {
            const isActive = selectedFilterCategory === cat.value;
            return (
              <button
                key={cat.value}
                id={`filter-tab-${cat.value}`}
                type="button"
                onClick={() => setSelectedFilterCategory(cat.value)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  isActive
                    ? 'bg-techo-teal text-white shadow-xs font-black'
                    : 'text-[#6e685a] hover:bg-white/40'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Unified Search Input */}
        <div className="w-full md:w-60 relative">
          <input
            id="self-growth-search-input"
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索愿望、技能或子目标..."
            className="w-full text-xs pl-8 pr-7 py-1.5 bg-white border border-[#c2bdae] rounded-md focus:outline-none focus:ring-1 focus:ring-techo-teal"
          />
          <Search size={12} className="absolute left-2.5 top-2.5 text-[#8e8674]" />
          {searchKeyword && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => setSearchKeyword('')}
              className="absolute right-2 top-1.5 p-0.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* LEFT COLUMN: 100 WISHES LIST */}
        <div id="wishes-list-card" className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col">
          {/* Spiral binder holes background */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 flex flex-col justify-between py-6 -ml-1 select-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#e2dfd5] border border-white shadow-inner" />
            ))}
          </div>

          <div className="pl-4">
            <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4">
              <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-techo-teal" />
                100 件愿望清单 (100 Wishes List)
              </h3>
              <span className="text-[11px] bg-techo-teal/10 text-techo-teal font-semibold px-2 py-0.5 rounded-full select-none">
                已实现: {
                  isFilteringActive 
                    ? `${filteredWishes.filter(w => w.content && w.isCompleted).length} / ${filteredWishes.filter(w => w.content).length}`
                    : wishes.filter(w => w.content && w.isCompleted).length
                } 件
              </span>
            </div>

            {/* Quick add Wish form */}
            <form id="add-wish-form" onSubmit={handleAddWishSubmit} className="flex gap-2 mb-4 bg-[#fbfaf5] p-2 rounded border border-[#efede5]">
              <input
                id="wish-content-input"
                type="text"
                value={newWishContent}
                onChange={(e) => setNewWishContent(e.target.value)}
                placeholder="我想实现的下一个愿望..."
                className="flex-1 text-xs px-2 py-1.5 bg-white border border-[#c2bdae] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal"
              />
              <select
                id="wish-category-select"
                value={newWishCategory}
                onChange={(e) => setNewWishCategory(e.target.value)}
                className="text-xs bg-white border border-[#c2bdae] rounded px-1 cursor-pointer"
              >
                <option value="成长">成长</option>
                <option value="生活">生活</option>
                <option value="工作">工作</option>
                <option value="自媒体">自媒体</option>
                <option value="养育">家庭</option>
              </select>
              <button
                type="submit"
                id="add-wish-btn"
                className="px-3 bg-[#8a816c] text-white text-xs font-semibold rounded hover:bg-[#736a56] cursor-pointer"
              >
                添写
              </button>
            </form>

            {/* Wishes Grid Scroll window */}
            <div className="space-y-1.5 overflow-y-auto max-h-[360px] techo-grid-bg pr-1 min-h-[120px]">
              {filteredWishes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-1.5 bg-white/40 rounded border border-[#efede5] border-dashed">
                  <span className="text-xl">💭</span>
                  <p className="font-semibold text-gray-500">未找到对应愿望</p>
                  <p className="scale-95 text-[#8e8674]/80">试着换个分类或检索关键字</p>
                </div>
              ) : (
                filteredWishes.map((wish) => {
                  const isEdited = editingWishId === wish.id;
                  
                  // Only render placeholders if content is empty and we are NOT filtering
                  if (!isFilteringActive && !wish.content && wish.order > 14) return null;

                  return (
                    <div 
                      key={wish.id}
                      id={`wish-row-${wish.id}`}
                      className={`group flex items-start gap-2.5 p-1.5 rounded transition-all border border-transparent ${
                        wish.isCompleted ? 'bg-emerald-50/40' : 'hover:bg-[#fafaf3]'
                      }`}
                    >
                      {/* Number Badge */}
                      <span className="w-5 text-[10px] font-mono font-bold text-center text-[#9b9485] py-0.5 border border-[#efede5] bg-[#f8f7f2] rounded-sm select-none shrink-0 self-center">
                        {wish.order}
                      </span>

                      {/* Complete toggle checkbox */}
                      <button 
                        type="button"
                        id={`wish-toggle-${wish.id}`}
                        onClick={() => onToggleWish(wish.id)}
                        className="mt-1 shrink-0 text-[#a9a393] hover:text-techo-teal cursor-pointer transition-colors"
                      >
                        {wish.isCompleted ? (
                          <CheckSquare size={15} className="text-emerald-700" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {isEdited ? (
                          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editWishContent}
                              onChange={(e) => setEditWishContent(e.target.value)}
                              className="flex-1 text-xs px-1.5 py-0.5 bg-white border border-blue-400 rounded focus:outline-none"
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={() => handleSaveWishEdit(wish.id)}
                              className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded shrink-0 cursor-pointer"
                            >
                              保存
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs ${wish.isCompleted ? 'line-through text-[#aaa597]' : 'text-[#48453f] font-medium'}`}>
                              {wish.content ? wish.content : <span className="text-[#cdc7b7] italic">未写下的愿望 (空)</span>}
                            </span>
                            {wish.content && (
                              <span className={`text-[9px] px-1 rounded-sm select-none ${
                                wish.category === '成长' ? 'bg-teal-50 text-teal-800' :
                                wish.category === '工作' ? 'bg-blue-50 text-blue-800' :
                                wish.category === '自媒体' ? 'bg-purple-50 text-purple-800' : 'bg-amber-100/70 text-orange-900'
                              }`}>
                                {wish.category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hover action bar */}
                      {wish.content && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => handleStartEditWish(wish)}
                            className="p-1 hover:bg-[#eae6d8] rounded text-[#8e826b] transition-colors cursor-pointer"
                            title="编辑"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => onDeleteWish(wish.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-[#8e826b] transition-colors cursor-pointer"
                            title="删除"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SKILL TREE TARGET GRID */}
        <div id="skills-list-card" className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col">
          {/* Ribbon visual binder on the right */}
          <div className="absolute top-0 bottom-0 right-0 w-2.5 flex flex-col justify-between py-6 -mr-1 select-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#e2dfd5] border border-white shadow-inner" />
            ))}
          </div>

          <div className="pr-4">
            <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4">
              <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="text-techo-teal" />
                技能树与子目标拓扑 (Skill Tree)
              </h3>
            </div>

            {/* Quick Add Core Skill Form */}
            <form id="add-skill-form" onSubmit={handleCreateSkill} className="flex gap-2 mb-4 bg-[#fbfaf5] p-2 rounded border border-[#efede5]">
              <input
                id="skill-name-input"
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="输入你想开启的新主干技能 (例如: Go Web)..."
                className="flex-1 text-xs px-2 py-1.5 bg-white border border-[#c2bdae] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal"
              />
              <select
                id="skill-category-select"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="text-xs bg-white border border-[#c2bdae] rounded px-1.5 cursor-pointer"
              >
                <option value="成长">成长</option>
                <option value="生活">生活</option>
                <option value="工作">工作</option>
                <option value="自媒体">自媒体</option>
                <option value="养育">家庭</option>
              </select>
              <button
                type="submit"
                id="add-skill-btn"
                className="px-3 bg-techo-teal text-white text-xs font-semibold rounded hover:bg-[#3d7a77] cursor-pointer shrink-0"
              >
                开启
              </button>
            </form>

            {/* Skills Accordion List */}
            <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1 min-h-[120px]">
              {filteredSkills.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-1.5 bg-white/40 rounded border border-[#efede5] border-dashed">
                  <span className="text-xl">🎯</span>
                  <p className="font-semibold text-gray-500">未找到对应技能树</p>
                  <p className="scale-95 text-[#8e8674]/80">在这个类别或查询条件下暂无主干技能</p>
                </div>
              ) : (
                filteredSkills.map((skill) => {
                  const activeDone = skill.subGoals.filter(g => g.isDone).length;
                  const totalGoals = skill.subGoals.length;
                  const pct = totalGoals === 0 ? 0 : Math.round((activeDone / totalGoals) * 100);
                  const skillCat = skill.category || '成长';

                  return (
                    <div key={skill.id} id={`skill-node-${skill.id}`} className="border border-[#e1dfd4] rounded-lg overflow-hidden bg-[#fbfbf9]/60">
                      {/* Skill Node Main Header */}
                      <div className="bg-[#f5f3e9] px-3.5 py-2 border-b border-[#e1dfd4] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            skill.status === 'mastered' ? 'bg-emerald-600' :
                            skill.status === 'learning' ? 'bg-cyan-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <span className="font-display font-bold text-xs text-[#48453f]">{skill.skillName}</span>
                          <span className={`text-[9px] px-1 py-0.5 rounded-sm select-none ${
                            skillCat === '成长' ? 'bg-teal-50 text-teal-800' :
                            skillCat === '工作' ? 'bg-blue-50 text-blue-800' :
                            skillCat === '自媒体' ? 'bg-purple-50 text-purple-800' : 'bg-amber-100/70 text-orange-900'
                          }`}>
                            {skillCat}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* State switcher pills */}
                          <select
                            id={`skill-status-${skill.id}`}
                            value={skill.status}
                            onChange={(e) => onUpdateSkillStatus(skill.id, e.target.value as any)}
                            className="text-[10px] bg-white border border-[#c2bdae] rounded px-1 py-0.5 text-gray-700 cursor-pointer"
                          >
                            <option value="not_started">未启动</option>
                            <option value="learning">习得中</option>
                            <option value="mastered">已掌握</option>
                          </select>

                          <button 
                            type="button"
                            id={`delete-skill-${skill.id}`}
                            onClick={() => onDeleteSkill(skill.id)}
                            className="text-[#999] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                            title="删除主节点"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Skill Progress details */}
                      <div className="p-3 bg-white space-y-2">
                        {/* Tiny stats progress bar */}
                        <div className="flex items-center justify-between text-[10px] text-[#8e8674] mb-1">
                          <span>子目标进度 ({activeDone}/{totalGoals})</span>
                          <span className="font-mono font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#f0ede4] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              skill.status === 'mastered' ? 'bg-emerald-600' : 'bg-techo-teal'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Subgoals rendering */}
                        <div className="pt-2 border-t border-[#f4efe0] space-y-1.5">
                          {skill.subGoals.map((sub) => {
                            const subgoalMatchesSearch = searchKeyword.trim() !== '' && 
                              sub.name.toLowerCase().includes(searchKeyword.toLowerCase());
                            return (
                              <div 
                                key={sub.id} 
                                id={`subgoal-${sub.id}`} 
                                className={`flex items-center justify-between group p-1 rounded hover:bg-[#fafaf3] transition-colors ${
                                  subgoalMatchesSearch ? 'bg-[#fffbeb] border border-amber-200/50' : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  id={`toggle-subgoal-${skill.id}-${sub.id}`}
                                  onClick={() => onToggleSkillGoal(skill.id, sub.id)}
                                  className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0"
                                >
                                  <span className={sub.isDone ? 'text-emerald-600 font-bold shrink-0 text-[10px]' : 'text-gray-300 shrink-0 text-[10px]'}>
                                    {sub.isDone ? '• 已达成' : '▫️ 未做'}
                                  </span>
                                  <span className={`text-[11px] truncate ${
                                    sub.isDone ? 'line-through text-[#9d9888]' : 'text-[#5a554a] font-medium'
                                  }`}>
                                    {sub.name}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  id={`delete-subgoal-${skill.id}-${sub.id}`}
                                  onClick={() => onDeleteSubgoal(skill.id, sub.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 duration-150 cursor-pointer p-0.5 shrink-0 transition-opacity"
                                  title="回收子项"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add child sub-goal drawer */}
                        <div className="flex gap-1.5 pt-2 border-t border-dashed border-[#e6e2d5]">
                          <input
                            type="text"
                            id={`new-subgoal-${skill.id}`}
                            value={newSubgoalText[skill.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewSubgoalText(prev => ({ ...prev, [skill.id]: val }));
                            }}
                            placeholder="添加子干目标 / subgoal..."
                            className="flex-1 text-[11px] px-2 py-1 bg-[#fdfdfb] border border-[#c2bdae] rounded focus:outline-none"
                          />
                          <button
                            type="button"
                            id={`add-subgoal-${skill.id}`}
                            onClick={() => handleCreateSubgoal(skill.id)}
                            className="p-1 px-2.5 bg-[#8a816c] text-white text-[10px] font-bold rounded hover:bg-[#736a56] cursor-pointer"
                          >
                            新增字干
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
