/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Database, Cloud, RefreshCw, FileCode2, Copy, Check, Play, ShieldAlert } from 'lucide-react';
import { D1_SQL_SCHEMA, generateSQLInserts } from '../data';
import { D1SyncLog } from '../types';

interface D1ConsoleProps {
  logs: D1SyncLog[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  activeState: any; // complete parent state
}

export default function D1Console({
  logs,
  onTriggerSync,
  isSyncing,
  activeState
}: D1ConsoleProps) {
  const [activeTab, setActiveTab] = useState<'inserts' | 'schema' | 'logs'>('schema');
  const [copied, setCopied] = useState(false);
  
  // Custom interactive SQL console
  const [customSQL, setCustomSQL] = useState('SELECT * FROM wishes WHERE is_completed = 1;');
  const [consoleResult, setConsoleResult] = useState<any[] | null>([
    { id: 'w2', order: 2, content: '构建一个基于 React 19 + Tailwind CSS 极美手帐并上线', is_completed: 1, category: '成长' },
    { id: 'w6', order: 6, content: '精读《设计数据密集型应用 (DDIA)》并完成笔记', is_completed: 1, category: '成长' },
    { id: 'w7', order: 7, content: '今年坚持每周五进行一次个人复盘与周计划', is_completed: 1, category: '成长' }
  ]);
  const [consoleError, setConsoleError] = useState<string | null>(null);

  // Dynamic SQL based on active react page state
  const dynamicInserts = generateSQLInserts(activeState);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCustomSQL = () => {
    setConsoleError(null);
    setConsoleResult(null);

    const query = customSQL.trim().toLowerCase();
    
    // Simulate query parsing for high-fidelity engagement
    setTimeout(() => {
      if (!query.startsWith('select')) {
        setConsoleError(`Error: Only SELECT statements are simulated in this D1 playground. (Only READ transactions allowed)`);
        return;
      }

      if (query.includes('wishes')) {
        let list = activeState.wishes.filter((w: any) => w.content);
        if (query.includes('is_completed = 1') || query.includes('is_completed=1')) {
          list = list.filter((w: any) => w.isCompleted);
        } else if (query.includes('is_completed = 0') || query.includes('is_completed=0')) {
          list = list.filter((w: any) => !w.isCompleted);
        }
        
        setConsoleResult(list.map((w: any) => ({
          id: w.id,
          order: w.order,
          content: w.content,
          is_completed: w.isCompleted ? 1 : 0,
          category: w.category
        })));
      } else if (query.includes('work_targets') || query.includes('targets')) {
        setConsoleResult(activeState.workTargets.map((wt: any) => ({
          id: wt.id,
          quarter_goal: wt.quarterGoal,
          progress_percent: wt.progress,
          deadline: wt.deadline
        })));
      } else if (query.includes('child')) {
        setConsoleResult(activeState.childLogs.map((l: any) => ({
          time: l.time,
          behaviour: l.type,
          spec: l.spec
        })));
      } else if (query.includes('diary') || query.includes('diary_notes')) {
        setConsoleResult((activeState.diaryNotes || []).map((dn: any) => ({
          id: dn.id,
          title: dn.title,
          date: dn.date,
          category: dn.category,
          content: dn.content.substring(0, 30) + '...'
        })));
      } else {
        // General default matching table view
        setConsoleResult([
          { database: "Cloudflare D1", engine: "SQLite 3", status: "online", rows_synchronized: activeState.wishes.length + activeState.skills.length + activeState.cells.length + (activeState.diaryNotes || []).length }
        ]);
      }
    }, 280);
  };

  return (
    <div id="d1-database-console" className="bg-[#1e1d1a] text-[#efece6] rounded-xl border-4 border-[#3a3730] shadow-2xl p-5 font-mono select-text text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3e3a33] pb-4 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Database size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5 font-display">
              Cloudflare D1 数据库控制台 (Cloudflare D1 Live Console)
            </h3>
            <p className="text-[10px] text-[#a59e91] font-sans">
              实时导出 D1 SQLite 迁移脚本、监测本地 D1 同步，并在本地模拟 D1 SQL 执行机。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 select-none shrink-0 self-start sm:self-center">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-850 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-sans transition-all active:scale-95`}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? '同步 D1 数据中...' : '测试一键同步连接'}
          </button>
        </div>
      </div>

      {/* CORE CONTROL TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: TABS SELECTOR & SQL TEST PLAYGROUND */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#292723] rounded-lg p-2 border border-[#3e3a33] flex flex-col gap-1 text-xs select-none">
            <button
              onClick={() => setActiveTab('schema')}
              className={`p-2 rounded text-left transition-colors flex items-center gap-2 ${
                activeTab === 'schema' ? 'bg-[#3c3830] text-orange-400 font-bold' : 'text-[#8c8577] hover:bg-[#34312a]'
              }`}
            >
              <FileCode2 size={14} />
              1. 数据库模式 (schema.sql)
            </button>
            <button
              onClick={() => setActiveTab('inserts')}
              className={`p-2 rounded text-left transition-colors flex items-center gap-2 ${
                activeTab === 'inserts' ? 'bg-[#3c3830] text-orange-400 font-bold' : 'text-[#8c8577] hover:bg-[#34312a]'
              }`}
            >
              <Copy size={14} />
              2. 实时插入语句 (inserts.sql)
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`p-2 rounded text-left transition-colors flex items-center gap-2 ${
                activeTab === 'logs' ? 'bg-[#3c3830] text-orange-400 font-bold' : 'text-[#8c8577] hover:bg-[#34312a]'
              }`}
            >
              <Terminal size={14} />
              3. Cloudflare 边缘端同步日志 ({logs.length})
            </button>
          </div>

          {/* SIMULATED CONSOLE PLAYGROUND */}
          <div className="bg-[#171614] border border-[#3e3a33] rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8c8577] font-semibold border-b border-[#3e3a33] pb-1.5">
              <span className="flex items-center gap-1"><Cloud size={11} /> D1 交互 SQL 查询机</span>
              <span className="text-[10px] text-emerald-500 font-bold">模拟环境</span>
            </div>

            <textarea
              value={customSQL}
              onChange={(e) => setCustomSQL(e.target.value)}
              className="w-full h-16 bg-[#211f1c] border border-[#444] rounded p-2 text-[10px] text-lime-400 focus:outline-none font-mono"
              placeholder="SELECT * FROM wishes WHERE is_completed = 1;"
            />

            <button
              onClick={executeCustomSQL}
              className="w-full py-1 bg-lime-700 hover:bg-lime-650 text-[#111] font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Play size={11} fill="currentColor" /> 执行 SQL 语句
            </button>

            {/* Simulated Engine stats */}
            <div className="text-[9px] text-gray-500 flex flex-col gap-0.5 pt-1.5 border-t border-[#3e3a33]">
              <p>引擎: D1 SQLite SQLite3-wasm</p>
              <p>节点: Cloudflare Tokyo PoP Edge Router</p>
              <p>延迟: ~4.2 ms (Simulated local cached)</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED VIEW CONTENT */}
        <div className="lg:col-span-3 flex flex-col">
          
          {/* TAB BODY VIEW PORT */}
          <div className="bg-[#151412] border border-[#302d27] rounded-lg p-4 flex-1 flex flex-col min-h-[350px] overflow-hidden relative">
            
            {/* Copy button floating */}
            {(activeTab === 'schema' || activeTab === 'inserts') && (
              <button
                onClick={() => handleCopyCode(activeTab === 'schema' ? D1_SQL_SCHEMA : dynamicInserts)}
                className="absolute right-4 top-4 p-1.5 bg-[#252420] text-gray-300 hover:text-white border border-[#4e483e] rounded flex items-center gap-1 text-xs select-none transition-colors cursor-pointer"
                title="拷贝至剪切板"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? '已复制' : '复制代码'}
              </button>
            )}

            {/* TAB CONTENT: schema.sql */}
            {activeTab === 'schema' && (
              <div className="flex-1 overflow-auto max-h-[340px] text-xs leading-relaxed text-[#cad4c2]">
                <div className="text-[#a59e91] mb-2 border-b border-[#35322b] pb-2 text-[10px]">
                  -- 📑 Cloudflare D1 初始建表脚本 (schema.sql - Wrangler 迁移需要)
                </div>
                <pre className="font-mono whitespace-pre">{D1_SQL_SCHEMA.trim()}</pre>
              </div>
            )}

            {/* TAB CONTENT: inserts.sql */}
            {activeTab === 'inserts' && (
              <div className="flex-1 overflow-auto max-h-[340px] text-xs leading-relaxed text-lime-400">
                <div className="text-[#a59e91] mb-2 border-b border-[#35322b] pb-2 text-[10px]">
                  -- 🚀 实时同步导出的插入语句 (inserts.sql - 会跟随您的前端编辑实时热更新！)
                </div>
                <pre className="font-mono whitespace-pre text-[#cad4c2]">{dynamicInserts.trim()}</pre>
              </div>
            )}

            {/* TAB CONTENT: log logs */}
            {activeTab === 'logs' && (
              <div className="flex-1 overflow-auto max-h-[340px] text-[11px] leading-relaxed space-y-2.5">
                <div className="text-[#a59e91] mb-2 border-b border-[#35322b] pb-2 text-[10px]">
                  -- 🚥 Cloudflare Worker 代理 & 后端数据库网关通信日志
                </div>

                <div className="space-y-1.5">
                  {logs.slice().reverse().map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded border font-mono ${
                        log.type === 'success' ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' :
                        log.type === 'error' ? 'bg-red-950/20 border-red-800/40 text-red-400' :
                        log.type === 'query' ? 'bg-[#21201d] border-[#3a362d] text-cyan-400' :
                        'bg-[#191816]/70 border-zinc-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] mb-1 opacity-70">
                        <span>[{log.timestamp}]</span>
                        <span className="font-bold border px-1 rounded-sm text-[8px] uppercase">{log.type}</span>
                      </div>
                      <p className="font-semibold">{log.message}</p>
                      {log.sql && (
                        <pre className="mt-1.5 p-1 bg-black/40 text-[#cad4c2] text-[10px] break-words whitespace-pre-wrap font-mono border-l border-orange-500">
                          {log.sql}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* SQL EXECUTION RESULT PREVIEW (DOCK BOTTOM) */}
          <div className="bg-[#11100e] border-t border-[#302d27] p-3 text-[11px] select-text">
            <h4 className="text-[10px] text-gray-500 border-b border-[#2d2922] pb-1 font-bold mb-1.5 flex items-center justify-between">
              <span>🖥️ SQL 执行结果预览 (Simulated Query output)</span>
              {consoleResult && <span className="text-emerald-500">查询成功 ({consoleResult.length} 条)</span>}
              {consoleError && <span className="text-red-500 font-bold flex items-center gap-0.5"><ShieldAlert size={10} /> 异常</span>}
            </h4>

            {consoleError && <p className="text-red-400 font-bold bg-red-950/30 p-2 rounded border border-red-900/50">{consoleError}</p>}

            {consoleResult && (
              <div className="max-h-[120px] overflow-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-[#3a362d] text-gray-400">
                      {consoleResult.length > 0 && Object.keys(consoleResult[0]).map(key => (
                        <th key={key} className="p-1 font-semibold">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consoleResult.length === 0 ? (
                      <tr>
                        <td className="p-2 text-center text-gray-500 italic">No rows returned (空数据集)</td>
                      </tr>
                    ) : (
                      consoleResult.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#201f1c] border-b border-[#2d2921]/40 last:border-0 text-lime-400/90 [word-break:break-all]">
                          {Object.values(row).map((val: any, sIdx) => (
                            <td key={sIdx} className="p-1 max-w-[150px] truncate">{String(val)}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
