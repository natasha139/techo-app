/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit, CalendarDays, Sliders, Briefcase } from 'lucide-react';
import { WorkTarget } from '../types';

interface WorkProps {
  targets: WorkTarget[];
  onAddTarget: (target: Omit<WorkTarget, 'id'>) => void;
  onUpdateTarget: (id: string, updated: Partial<WorkTarget>) => void;
  onDeleteTarget: (id: string) => void;
}

export default function WorkSection({
  targets,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget
}: WorkProps) {
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [quarterGoal, setQuarterGoal] = useState('');
  const [keyResults, setKeyResults] = useState('');
  const [projects, setProjects] = useState('');
  const [deadline, setDeadline] = useState('2026-06-30');
  const [progress, setProgress] = useState(0);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eQuarterGoal, setEQuarterGoal] = useState('');
  const [eKeyResults, setEKeyResults] = useState('');
  const [eProjects, setEProjects] = useState('');
  const [eDeadline, setEDeadline] = useState('');
  const [eProgress, setEProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quarterGoal.trim()) {
      onAddTarget({
        quarterGoal: quarterGoal.trim(),
        keyResults: keyResults.trim() || '未设定',
        projects: projects.trim() || '未设定',
        deadline,
        progress
      });
      // Reset
      setQuarterGoal('');
      setKeyResults('');
      setProjects('');
      setDeadline('2026-06-30');
      setProgress(0);
      setIsAdding(false);
    }
  };

  const startEdit = (wt: WorkTarget) => {
    setEditingId(wt.id);
    setEQuarterGoal(wt.quarterGoal);
    setEKeyResults(wt.keyResults);
    setEProjects(wt.projects);
    setEDeadline(wt.deadline);
    setEProgress(wt.progress);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateTarget(id, {
      quarterGoal: eQuarterGoal.trim(),
      keyResults: eKeyResults.trim(),
      projects: eProjects.trim(),
      deadline: eDeadline,
      progress: eProgress
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm font-sans relative">
      <div className="flex items-center justify-between border-b-2 border-[#eae6d8] pb-3 mb-4">
        <h3 className="font-display font-bold text-[#48453f] text-sm flex items-center gap-2">
          <Briefcase size={16} className="text-[#e09453]" />
          工作与项目目标管理 (Work Q4 Goals & OKR Matrix)
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-[#e09453] text-white px-2.5 py-1.5 rounded-md font-semibold hover:bg-[#c97f3e] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          {isAdding ? '收起面板' : '拟定新目标'}
        </button>
      </div>

      {/* ADD TARGET DRAWER */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#fcfbf7] border-2 border-[#eae6d8] p-4 rounded-lg mb-5 space-y-3 shadow-inner">
          <h4 className="text-xs font-bold text-[#5c564a] pb-1 border-b border-[#eae6d8]">📝 拟定 OKR 目标计划</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#7d7768] mb-0.5">Q4 核心愿景 / Core Goal</label>
              <input
                type="text"
                value={quarterGoal}
                onChange={(e) => setQuarterGoal(e.target.value)}
                placeholder="例如: 重构 Cloudflare Workers 日志管道"
                className="w-full text-xs p-2 bg-white border border-[#c2bdae] rounded"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#7d7768] mb-0.5">对应项目分类 / Project Folder</label>
              <input
                type="text"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="例如: 数据安全审计项目"
                className="w-full text-xs p-2 bg-white border border-[#c2bdae] rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-[#7d7768] mb-0.5">关键成果细节 (Key Results - 用分号隔开)</label>
              <textarea
                value={keyResults}
                onChange={(e) => setKeyResults(e.target.value)}
                placeholder="KR1: 延迟小于10ms; KR2: 全系统覆盖 D1 查询触发器"
                className="w-full text-xs p-2 bg-white border border-[#c2bdae] rounded h-[50px] resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#7d7768] mb-0.5">截止节点 / Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-[#c2bdae] rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#7d7768] mb-0.5">初始进度进展 ({progress}%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-[#e09453]"
                />
                <span className="text-xs font-mono font-bold w-8 text-right">{progress}%</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="text-xs bg-[#8a816c] hover:bg-[#736a56] text-white px-4 py-1 rounded font-semibold cursor-pointer"
            >
              保存立项
            </button>
          </div>
        </form>
      )}

      {/* CORE OKR GRID VIEW: Styled like Kokuyo Jibun Stationery */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[#d6cfbe] text-xs">
          <thead>
            <tr className="bg-[#f5f3e9] text-[#555042] font-semibold text-left select-none">
              <th className="border border-[#d6cfbe] p-2.5 w-1/4">🏆 目标计划 (Q4 Goals)</th>
              <th className="border border-[#d6cfbe] p-2.5 w-1/4">🎯 关键结果指标 (Key Results)</th>
              <th className="border border-[#d6cfbe] p-2.5">📂 项目归属 (Projects)</th>
              <th className="border border-[#d6cfbe] p-2.5 w-24">📅 截止节点</th>
              <th className="border border-[#d6cfbe] p-2.5 w-44">📈 进度柱 & 操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e2d5] techo-grid-bg">
            {targets.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#9b9485] italic">
                  目前空空如也，您可以点击右上角拟定新阶段的工作与项目目标。
                </td>
              </tr>
            ) : (
              targets.map((wt) => {
                const isEditing = editingId === wt.id;

                return (
                  <tr key={wt.id} className="hover:bg-[#fafaf3]/60 bg-white/70 duration-150">
                    {/* Goal field */}
                    <td className="border border-[#d6cfbe] p-2.5 vertical-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={eQuarterGoal}
                          onChange={(e) => setEQuarterGoal(e.target.value)}
                          className="w-full text-xs p-1 bg-white border border-[#c2bdae] rounded"
                        />
                      ) : (
                        <div className="flex items-start gap-1.5">
                          <Target size={14} className="text-orange-600 shrink-0 mt-0.5" />
                          <span className="font-semibold text-[#3b3834] break-words">{wt.quarterGoal}</span>
                        </div>
                      )}
                    </td>

                    {/* Key Results */}
                    <td className="border border-[#d6cfbe] p-2.5 vertical-top text-[#635f55]">
                      {isEditing ? (
                        <textarea
                          value={eKeyResults}
                          onChange={(e) => setEKeyResults(e.target.value)}
                          className="w-full text-xs p-1 bg-white border border-[#c2bdae] rounded h-[60px] resize-none"
                        />
                      ) : (
                        <div className="space-y-1 select-text whitespace-pre-line leading-relaxed break-words">
                          {wt.keyResults.split(';').map((kr, idx) => (
                            <p key={idx} className="flex gap-1">
                              <span className="text-[#a58957] font-mono leading-none">{idx + 1}.</span>
                              <span>{kr.trim()}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Projects folder */}
                    <td className="border border-[#d6cfbe] p-2.5 vertical-top text-[#5a554a]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={eProjects}
                          onChange={(e) => setEProjects(e.target.value)}
                          className="w-full text-xs p-1 bg-white border border-[#c2bdae] rounded"
                        />
                      ) : (
                        <span className="bg-[#eae6d8]/60 text-[#675f50] border border-[#d2cbba]/50 px-1.5 py-0.5 rounded-sm inline-block max-w-full truncate font-medium">
                          📁 {wt.projects}
                        </span>
                      )}
                    </td>

                    {/* Target Deadline */}
                    <td className="border border-[#d6cfbe] p-2.5 vertical-top font-mono text-[#787162]">
                      {isEditing ? (
                        <input
                          type="date"
                          value={eDeadline}
                          onChange={(e) => setEDeadline(e.target.value)}
                          className="w-full text-xs p-0.5 bg-white border"
                        />
                      ) : (
                        <span className="flex items-center gap-1 shrink-0">
                          <CalendarDays size={12} className="text-[#999]" />
                          {wt.deadline}
                        </span>
                      )}
                    </td>

                    {/* Progress Slider and Actions */}
                    <td className="border border-[#d6cfbe] p-2.5 vertical-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={eProgress}
                              onChange={(e) => setEProgress(Number(e.target.value))}
                              className="flex-1 accent-[#e09453]"
                            />
                            <span className="text-xs font-mono font-bold w-6 text-right">{eProgress}%</span>
                          </div>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 cursor-pointer"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleSaveEdit(wt.id)}
                              className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded font-bold cursor-pointer"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 font-semibold select-none">
                            <span>达成比率</span>
                            <span className="text-orange-700 font-bold">{wt.progress}%</span>
                          </div>
                          <div className="w-full bg-[#f0ede4] h-2.5 rounded-sm border border-[#d9d5c8] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-[#e09453] transition-all duration-300"
                              style={{ width: `${wt.progress}%` }}
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1 select-none">
                            <button
                              onClick={() => startEdit(wt)}
                              className="text-[9px] text-[#8e8573] hover:text-black hover:bg-[#eae6d8] px-1.5 py-0.5 rounded border border-[#ddd]"
                              title="调节这行计划"
                            >
                              🎨 调节进度/编辑
                            </button>
                            <button
                              onClick={() => onDeleteTarget(wt.id)}
                              className="text-[9px] text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded border border-red-100"
                              title="注销目标"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
