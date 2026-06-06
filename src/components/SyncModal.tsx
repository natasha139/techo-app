import React, { useState } from 'react';
import { Key, UserPlus, LogIn, Loader2, Copy, Check } from 'lucide-react';
import { register, login } from '../api';

interface SyncModalProps {
  onSuccess: (syncCode: string, username: string) => void;
}

export default function SyncModal({ onSuccess }: SyncModalProps) {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [usernameInput, setUsernameInput] = useState('Natasha');
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRegister = async () => {
    if (!usernameInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await register(usernameInput.trim());
      setNewCode(res.sync_code);
    } catch (e: any) {
      setError(e.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndEnter = async () => {
    await navigator.clipboard.writeText(newCode).catch(() => {});
    setCopied(true);
    setTimeout(() => {
      onSuccess(newCode, usernameInput.trim());
    }, 600);
  };

  const handleLogin = async () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) { setError('请输入6位同步码'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await login(code);
      onSuccess(res.sync_code, res.username);
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl border border-[#d3cfc3] overflow-hidden">

        {/* Header */}
        <div className="bg-[#f5f3eb] border-b border-[#d6cfbe] px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-[#8a816c] flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-base">自</span>
            </div>
            <div>
              <h2 className="font-extrabold text-[#3c3830] text-base">自我手帐</h2>
              <p className="text-[10px] text-[#8e8574]">Self-Growth Hand Planner</p>
            </div>
          </div>
          <p className="text-xs text-[#6e685a] mt-2">
            使用 6 位同步码在所有设备间同步你的手帐数据。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e8e4da]">
          <button
            onClick={() => { setTab('register'); setError(''); setNewCode(''); }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'register' ? 'text-[#3c3830] border-b-2 border-[#8a816c] bg-white' : 'text-[#8e8574] hover:bg-[#fafaf5]'
            }`}
          >
            <UserPlus size={13} /> 创建新手帐
          </button>
          <button
            onClick={() => { setTab('login'); setError(''); setNewCode(''); }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'login' ? 'text-[#3c3830] border-b-2 border-[#8a816c] bg-white' : 'text-[#8e8574] hover:bg-[#fafaf5]'
            }`}
          >
            <LogIn size={13} /> 已有手帐
          </button>
        </div>

        <div className="p-6 space-y-4">
          {tab === 'register' && !newCode && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6e685a]">✍️ 你的署名</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value.slice(0, 15))}
                  placeholder="Natasha"
                  maxLength={15}
                  className="w-full text-sm px-3 py-2 bg-[#fbfaf5] border border-[#d6cfbe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a816c]/30 text-[#3c3830]"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleRegister}
                disabled={loading || !usernameInput.trim()}
                className="w-full py-2.5 bg-[#8a816c] hover:bg-[#7a7260] disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                生成专属同步码
              </button>
            </>
          )}

          {tab === 'register' && newCode && (
            <div className="space-y-4">
              <div className="bg-[#f5f3eb] border-2 border-[#d3cfc3] rounded-xl p-4 text-center space-y-2">
                <p className="text-[11px] text-[#8e8574] font-medium">你的专属同步码</p>
                <div className="font-mono text-3xl font-black tracking-[0.3em] text-[#3c3830]">{newCode}</div>
                <p className="text-[10px] text-[#b0a890]">请妥善保存，用于在其他设备登录</p>
              </div>
              <button
                onClick={handleCopyAndEnter}
                className="w-full py-2.5 bg-[#4b8f8c] hover:bg-[#3d7a77] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制，正在进入...' : '复制并进入手帐'}
              </button>
            </div>
          )}

          {tab === 'login' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6e685a]">🔑 输入同步码</label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="A1B2C3"
                  maxLength={6}
                  className="w-full text-center text-xl font-mono font-black tracking-[0.3em] px-3 py-3 bg-[#fbfaf5] border border-[#d6cfbe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a816c]/30 text-[#3c3830] uppercase"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading || codeInput.length !== 6}
                className="w-full py-2.5 bg-[#8a816c] hover:bg-[#7a7260] disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                进入手帐
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
