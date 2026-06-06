import React, { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Share2, 
  X, 
  Sparkles, 
  Calendar, 
  Smile, 
  BookOpen, 
  Cpu, 
  Grid,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react';
import { DiaryNote } from '../types';

// Matching mood options from standard DiarySection
const moodColorMap: Record<string, string> = {
  '开心': '#f59e0b',
  '专注': '#0d9488',
  '焦虑': '#f43f5e',
  '平和': '#6366f1',
  '欣喜': '#eab308',
  '温暖': '#f97316',
  '疲惫': '#2563eb',
};

const moodBgMap: Record<string, string> = {
  '开心': '#fef3c7',
  '专注': '#ccfb17', // custom light matcha color
  '焦虑': '#ffe4e6',
  '平和': '#e0e7ff',
  '欣喜': '#fef9c3',
  '温暖': '#ffedd5',
  '疲惫': '#dbeafe',
};

const moodEmojiMap: Record<string, string> = {
  '开心': '😊',
  '专注': '🎯',
  '焦虑': '😰',
  '平和': '🧘',
  '欣喜': '🌟',
  '温暖': '☕',
  '疲惫': '💤',
};

interface WeeklyMoodCapsuleProps {
  diaryNotes: DiaryNote[];
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

// Generate an helper that groups notes by week
const getWeekRangeString = (mondayDate: Date) => {
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);
  const formatDate = (d: Date) => {
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };
  return `${formatDate(mondayDate)} - ${formatDate(sundayDate)}`;
};

export default function WeeklyMoodCapsule({
  diaryNotes,
  username,
  isOpen,
  onClose
}: WeeklyMoodCapsuleProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string>(() => {
    return `${username || 'Natasha'} 的情绪胶囊周志 ☕`;
  });
  const [filterTheme, setFilterTheme] = useState<'retro' | 'bw' | 'warm'>('retro');

  const FILTER_PRESETS = useMemo(() => [
    {
      id: 'retro' as const,
      name: '复古褪色 (Sepia Retro)',
      icon: '🎞️',
      bgClass: 'bg-[#f6f5ec]',
      filterStyle: 'sepia(0.32) contrast(0.93) saturate(0.95)',
      overlayGradient: 'linear-gradient(135deg, rgba(138,129,108,0.18) 0%, rgba(200,160,110,0.12) 50%, rgba(138,129,108,0.06) 100%)',
      desc: '温暖怀旧的手账压制色调，带有淡淡的泛黄书卷质感。',
      accentClass: 'border-[#ebdcb3]/60'
    },
    {
      id: 'bw' as const,
      name: '黑白胶片 (Sliver Halide B&W)',
      icon: '🖤',
      bgClass: 'bg-[#eeeaeb]',
      filterStyle: 'grayscale(1) contrast(1.16) brightness(1.02)',
      overlayGradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.15) 100%)',
      desc: '极致纯粹的手账质感。屏蔽色彩喧嚣，将注意力沉淀于文字的肌理之间。',
      accentClass: 'border-stone-300'
    },
    {
      id: 'warm' as const,
      name: '暖色晨光 (Amber Sunrise)',
      icon: '🌅',
      bgClass: 'bg-[#fffaee]',
      filterStyle: 'sepia(0.1) saturate(1.06) contrast(0.99) brightness(1.05)',
      overlayGradient: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(249,115,22,0.12) 50%, rgba(236,72,153,0.05) 100%)',
      desc: '仿佛阳光透过百叶窗照拂在手账纸页，满溢着明媚而隽美的早晨温情。',
      accentClass: 'border-[#f6e3b4]'
    }
  ], []);

  const activePreset = useMemo(() => {
    return FILTER_PRESETS.find(p => p.id === filterTheme) || FILTER_PRESETS[0];
  }, [FILTER_PRESETS, filterTheme]);

  // Generate dynamic weeks based on available notes to allow selecting which week to export
  const weeklyGroups = useMemo(() => {
    const sorted = [...diaryNotes].sort((a, b) => b.date.localeCompare(a.date));
    const groups: { [key: string]: { label: string; monday: Date; notes: DiaryNote[] } } = {};

    sorted.forEach(note => {
      // Find Monday of that date
      const d = new Date(note.date);
      if (isNaN(d.getTime())) return;
      
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().substring(0, 10);

      if (!groups[key]) {
        groups[key] = {
          label: getWeekRangeString(monday),
          monday,
          notes: []
        };
      }
      groups[key].notes.push(note);
    });

    // If no notes, add simulation week of 2026-06-01
    const weekKey2026 = '2026-06-01';
    if (Object.keys(groups).length === 0 || !groups[weekKey2026]) {
      const mon = new Date('2026-06-01');
      groups[weekKey2026] = {
        label: '2026.06.01 - 2026.06.07',
        monday: mon,
        notes: diaryNotes.filter(n => n.date >= '2026-06-01' && n.date <= '2026-06-07')
      };
    }

    return Object.keys(groups).map(k => ({
      key: k,
      ...groups[k]
    })).sort((a, b) => b.key.localeCompare(a.key));
  }, [diaryNotes]);

  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(() => {
    return weeklyGroups.length > 0 ? weeklyGroups[0].key : '2026-06-01';
  });

  const activeWeek = useMemo(() => {
    return weeklyGroups.find(g => g.key === selectedWeekKey) || weeklyGroups[0];
  }, [weeklyGroups, selectedWeekKey]);

  // Construct structured days Mon - Sun of the active week
  const weekDays = useMemo(() => {
    const monday = new Date(activeWeek.monday);
    const days = [];
    const dayLabelsCh = ['月曜日 (Mon)', '火曜日 (Tue)', '水曜日 (Wed)', '木曜日 (Thu)', '金曜日 (Fri)', '土曜日 (Sat)', '日曜日 (Sun)'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().substring(0, 10);
      const note = activeWeek.notes.find(n => n.date === dateStr);
      days.push({
        date: dateStr,
        dayLabel: dayLabelsCh[i],
        note: note || null
      });
    }
    return days;
  }, [activeWeek]);

  // Calculations for mood stats of the week
  const stats = useMemo(() => {
    const totalCount = activeWeek.notes.length;
    const moodCounts: Record<string, number> = {
      '开心': 0, '专注': 0, '焦虑': 0, '平和': 0, '欣喜': 0, '温暖': 0, '疲惫': 0
    };
    activeWeek.notes.forEach(n => {
      const mood = n.mood || '平和';
      if (moodCounts[mood] !== undefined) {
        moodCounts[mood]++;
      } else {
        // Fallback or partial matches
        const match = Object.keys(moodCounts).find(m => mood.includes(m));
        if (match) moodCounts[match]++;
      }
    });

    let dominantMood = '平和';
    let max = 0;
    Object.keys(moodCounts).forEach(m => {
      if (moodCounts[m] > max) {
        max = moodCounts[m];
        dominantMood = m;
      }
    });

    return {
      totalCount,
      moodCounts,
      dominantMood
    };
  }, [activeWeek]);

  // Self assessment text
  const weeklyInsightAndStickers = useMemo(() => {
    const m = stats.dominantMood;
    const count = stats.totalCount;
    if (count === 0) {
      return {
        rating: '🍀 虚席以待',
        advise: '由于本周暂无心情手账，本期心情胶囊呈现一种“留白”的静谧之美。期待您在格线上流淌下初夏的第一笔墨香。',
        poetic: '“生活不曾留白的时光，终归在手账里熠熠闪光。”',
        stamps: ['手账留白', '水无月之印']
      };
    }

    let rating = '⭐ 情绪充盈';
    let advise = '';
    let poetic = '';
    let stamps = ['特选手账', '情绪手纸'];

    switch (m) {
      case '开心':
      case '欣喜':
        rating = '🌈 阳光蓬勃 (95/100)';
        advise = `本周伴随“${m}”的明艳。犹如微风过林，温润和暄。在这类心境下流淌的手账，最适合提炼做长期规划与目标树立。`;
        poetic = '“晴空一鹤排云上，便引诗情到碧霄。”';
        stamps.push('欢欣日和', '妙笔生花');
        break;
      case '专注':
        rating = '🎯 极客静心 (90/100)';
        advise = '深水静流。这一周的集中力极高，适合沉淀技术难关并积累深度手记录。在极客匠心的笔触里，所有的焦虑都已被专注治愈。';
        poetic = '“器欲尽其用，心欲精其专。”';
        stamps.push('极密思考', '专注之碑');
        break;
      case '温暖':
        rating = '☕ 炉温治愈 (85/100)';
        advise = '本周流溢出满溢的“温暖”质感，代表生活节奏被您调配到了极温润舒适的最佳焦耳。给自己泡一杯抹茶，在留白处多按一块猫爪印章吧！';
        poetic = '“浮生半日闲，温茶叙初心。”';
        stamps.push('松茶暖物', '温润余味');
        break;
      case '焦虑':
        rating = '🪵 沉香暗浪 (55/100)';
        advise = '纸页上也染着焦虑的微澜。但请谨记，焦虑本身便意味着对成长的渴望。静心书写，在一笔一划里让纷扰随风，在留白纸面上重建内心的锚。';
        poetic = '“长夜过尽即是朝旭，每格纸张都在接纳您的不安。”';
        stamps.push('留白静修', '心潮微澜');
        break;
      case '疲惫':
        rating = '💤 枕眠留白 (50/100)';
        advise = '本周稍显劳形疲乏。正如经典手账的奶油底纸，生活也极需温柔的留白与充沛的好眠。本周请放下一切框架，将今日目标缩减为“按时安枕”。';
        poetic = '“倦时听雨声，枕书得清梦。”';
        stamps.push('安神寝梦', '止水放空');
        break;
      default:
        rating = '🧘 水波不惊 (80/100)';
        advise = '极舒适从容的自我平和。波澜不兴，细数光阴。在经典高密度的格网手账中，您用安静的墨香在日常琐碎里构筑了温顺的精神花园。';
        poetic = '“万物静观皆自得，四时佳兴与人同。”';
        stamps.push('平和松籁', '明镜自怡');
    }

    return { rating, advise, poetic, stamps };
  }, [stats]);

  // Auto compile styled textual digest for quick text sharing
  const handleCopyDigest = () => {
    const weekStr = activeWeek.label;
    const total = stats.totalCount;
    const dominant = stats.dominantMood;
    const emoji = moodEmojiMap[dominant] || '🧘';
    
    let text = `✨【自我手账 Jibun Techo • 本周心情胶囊分享】✨\n`;
    text += `👤 记录者: ${username}\n`;
    text += `📅 统计周期: ${weekStr}\n`;
    text += `📊 本周日记数: ${total} 篇\n`;
    text += `🎯 核心情绪基调: ${emoji} 【${dominant}】 - ${weeklyInsightAndStickers.rating}\n\n`;
    text += `✍️ 本周治愈笔迹:\n`;
    
    activeWeek.notes.slice(0, 5).forEach((n, idx) => {
      const mdDet = moodEmojiMap[n.mood || '平和'] || '🧘';
      text += `  ${idx + 1}. [${n.date}] ${mdDet} 《${n.title}》 | "${n.content.substring(0, 40)}..."\n`;
    });
    
    if (activeWeek.notes.length > 5) {
      text += `  ...等共 ${total} 篇珍贵生活底册`;
    }
    
    text += `\n💌 情绪寄语: ${weeklyInsightAndStickers.advise}\n📖 “${weeklyInsightAndStickers.poetic.replace(/[“”]/g, '')}”\n\n`;
    text += `—— 点击 “自我手账 Hub” 即刻管理专属于您的 Cloudflare D1 存储手集！`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }).catch(err => {
      console.error("Copy text error: ", err);
    });
  };

  // Convert HTML DOM to premium PNG using HTML2Canvas
  const handleGenerateImage = async () => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    setGenerationError(null);
    setExportedImage(null);

    try {
      // Force loading of external resources / web fonts
      await document.fonts.ready;
      
      // Fine-tuned configuration for html2canvas to look beautiful on high-def screens
      const canvas = await html2canvas(exportRef.current, {
        scale: 2.2, // Retina-ready multiplier
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fbfaf5', // Guarantee linen background shade
        logging: false,
        onclone: (clonedDoc) => {
          // Adjust cloned preview container for render
          const clonedEl = clonedDoc.getElementById('weekly-capsule-capture-card');
          if (clonedEl) {
            clonedEl.style.transform = 'none';
            clonedEl.style.boxShadow = 'none';
            clonedEl.style.borderRadius = '0';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      setExportedImage(imgData);

      // Attempt immediate download inside window environment
      const link = document.createElement('a');
      link.download = `Jibun_Techo_Weekly_Capsule_${selectedWeekKey}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error("PNG render failed: ", err);
      setGenerationError(err?.message || "由于iframe环境策略限制，直接渲染出错。您可以使用底部的一键文本复制，或使用右键保存本预览。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      
      <div className="bg-[#edeae1] border-2 border-[#b0aa99] rounded-xl shadow-2xl max-w-5xl w-full flex flex-col lg:flex-row relative max-h-[90vh] overflow-hidden my-auto animate-fade-in">
        
        {/* ================= LEFT CONTROLS & PICKERS PANEL ================= */}
        <div className="w-full lg:w-96 p-6 border-b lg:border-b-0 lg:border-r border-[#bebaaa]/40 bg-[#f8f6f0] flex flex-col gap-5 shrink-0 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-full bg-amber-150 text-amber-950 font-black animate-pulse">💊</span>
              <h2 className="font-display font-black text-[#3a3731] text-base">本周心情胶囊工坊</h2>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-[11.5px] text-[#6e685a] leading-relaxed">
            将您本周（或某一指定周）记录的多彩手账与心境推荐，自适应地压制成一张复古风格的印刷画。专为微博、微信与小红书等社交媒体进行宽度配置比例优化。
          </p>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#8a816c] uppercase tracking-wider">
              📅 请选择需要压制的周度 (Select Week)
            </label>
            <select
              value={selectedWeekKey}
              onChange={(e) => {
                setSelectedWeekKey(e.target.value);
                setExportedImage(null);
                setGenerationError(null);
              }}
              className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-[#bebaaa] rounded-md focus:outline-none focus:ring-1 focus:ring-techo-teal text-[#3a3731]"
            >
              {weeklyGroups.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.label} ({group.notes.length}篇记录)
                </option>
              ))}
            </select>
            <p className="text-[9px] text-[#8e8574] italic">
              * 您本周记录的日记篇数越多，心情点阵图的表现力就越充沛哦！
            </p>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#bebaaa]/20">
            <label className="block text-[11px] font-bold text-[#8a816c] uppercase tracking-wider flex items-center gap-1">
              <span>🖋️</span>
              <span>自定义相纸标题 (Card Caption Title)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => {
                setCustomTitle(e.target.value);
                setExportedImage(null);
                setGenerationError(null);
              }}
              placeholder="例如：流年如水，专注在当下"
              className="w-full text-xs px-3 py-2 bg-white border border-[#bebaaa] rounded-md focus:outline-none focus:ring-1 focus:ring-techo-teal text-[#3a3731] font-sans"
            />
            <p className="text-[9.5px] text-gray-400 italic">
              * 拍立得相纸底部预留了大幅微卷书写空间，标题将在该栏以极具个性的温暖手写体形态呈现。
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#bebaaa]/20">
            <label className="block text-[11px] font-bold text-[#8a816c] uppercase tracking-wider flex items-center gap-1">
              <span>🎨</span>
              <span>相纸滤镜色彩 (Polaroid Filter Presets)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FILTER_PRESETS.map((p) => {
                const isSelected = filterTheme === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFilterTheme(p.id);
                      setExportedImage(null);
                      setGenerationError(null);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 font-extrabold text-amber-900 shadow-xxs'
                        : 'bg-white border-[#bebaaa] hover:border-amber-300 text-[#6e685a] hover:text-[#3a3731]'
                    }`}
                  >
                    <span className="text-sm mb-1">{p.icon}</span>
                    <span className="text-[10px] leading-tight font-sans text-center">{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[9.5px] text-[#8e8574] leading-relaxed italic">
              * {activePreset.desc}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#bebaaa]/20">
            <span className="block text-[11px] font-black text-[#8a816c] uppercase tracking-wider">
              🛠️ 一键自适应极速导出 (Smart Exporters)
            </span>
            
            <button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className={`w-full py-2.5 px-3 bg-techo-teal hover:bg-techo-teal-darker disabled:bg-stone-300 text-white font-bold rounded-md shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-98`}
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>高清墨绘渲染中...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>生成并下载精致长图 (PNG)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyDigest}
              className="w-full py-2.5 px-3 bg-white border-2 border-[#bebaaa] hover:border-techo-teal text-gray-700 font-bold rounded-md text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              {copiedText ? (
                <>
                  <CheckCircle size={13} className="text-emerald-500 animate-bounce" />
                  <span className="text-emerald-700">文案复制成功！</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>复制配套社交排版文案</span>
                </>
              )}
            </button>
          </div>

          {generationError && (
            <div className="p-2 border border-rose-200 bg-rose-50 rounded text-[10px] text-rose-800 leading-relaxed">
              <span className="font-bold">温馨提醒:</span> {generationError}
            </div>
          )}

          {/* Guidelines info */}
          <div className="mt-auto bg-[#eae5d8] border border-[#d6d0bf] rounded-md p-3 text-[10px] text-[#6e685a] space-y-1">
            <div className="flex items-center gap-1 font-bold text-[#48453f]">
              <Info size={11} className="text-techo-teal text-xs" />
              <span>智能分享贴士</span>
            </div>
            <p className="leading-relaxed">
              因 Cloud Studio 多重 iframe 安全策略，部分系统可能会拦截文件的直接下载。若点击下载无响应，可在右侧通过<b>【右键另存为图片】</b>或长按将渲染的快照保存至本地。
            </p>
          </div>

        </div>

        {/* ================= RIGHT PREVIEW CONTAINER ================= */}
        <div className="flex-1 flex flex-col overflow-hidden max-h-full">
          {/* Header */}
          <div className="px-5 py-3 border-b border-[#bebaaa]/20 bg-[#faf9f5] flex items-center justify-between select-none shrink-0">
            <span className="text-xs font-bold text-gray-400">
              🖼️ 情绪画卷实时预览栏 (实时所见即所得, 建议点击“生成并下载”获取2倍Retina超清大图)
            </span>
            <button 
              onClick={onClose}
              className="p-1 rounded hover:bg-stone-200 text-stone-605 cursor-pointer max-md:hidden shrink-0"
              title="关闭工坊"
            >
              <X size={18} />
            </button>
          </div>

          {/* Double-layered scroll: preview frame containing the actual HTML to capture */}
          <div className="flex-1 overflow-auto p-4 bg-[#edeae1] sm:p-8 flex justify-center items-start">
            
            {/* Captured Element (This is what is rendered to Canvas - Now structured as a vintage Polaroid photo) */}
            <div 
              ref={exportRef}
              id="weekly-capsule-capture-card"
              className="w-[430px] bg-[#fafaf5] border border-[#d3cebe] rounded-sm p-[18px] pb-14 shadow-2xl relative text-left overflow-hidden shrink-0 flex flex-col select-none"
              style={{ 
                boxShadow: "0 20px 45px rgba(50, 45, 35, 0.16), 0 3px 6px rgba(0,0,0,0.04)"
              }}
            >
              {/* Style block for loading google font and adding handwriting/polaroid caption styles */}
              <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;705&display=swap');
                .polaroid-caption-text {
                  font-family: 'Caveat', 'Kalam', 'Segoe UI', cursive;
                  line-height: 1.2;
                }
              `}} />

              {/* Inner printed photographic exposure section */}
              <div 
                className={`w-full ${activePreset.bgClass} border border-[#e2dccf] rounded-[1px] p-4 pb-5 relative overflow-hidden flex flex-col font-serif transition-all duration-300`}
                style={{ 
                  fontFamily: '"Lora", Georgia, "Times New Roman", serif',
                  backgroundImage: 'radial-gradient(#ded7be 0.6px, transparent 0.6px)',
                  backgroundSize: '15px 15px',
                  boxShadow: 'inset 0 1px 6px rgba(0, 0, 0, 0.05)',
                  filter: activePreset.filterStyle
                }}
              >
                {/* Film light grain & Warm vintage retro sepia filter overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.22] mix-blend-overlay transition-all duration-300"
                  style={{
                    backgroundImage: activePreset.overlayGradient,
                    backgroundColor: 'rgba(215, 195, 175, 0.03)'
                  }}
                />

                {/* Classic camera orange pixel-neon ink date stamp in bottom-right corner of the "photo" */}
                <div className="absolute bottom-2.5 right-3.5 font-mono text-[9px] font-black text-amber-600/90 tracking-widest select-none pointer-events-none rotate-[1.5deg]">
                  '26 06 03
                </div>

                {/* Binder side binding ring simulations on left and right for extreme stationery aesthetic */}
                <div className="absolute top-0 bottom-0 left-[2px] w-1.5 flex flex-col justify-between py-6 bg-stone-200/30 border-r border-[#8a816c]/20 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white shadow-inner mx-auto mb-1 opacity-70" />
                  ))}
                </div>

                {/* Top border decor */}
                <div className="flex items-center justify-between border-b pb-2 border-[#8a816c]/35 relative z-10">
                  <div>
                    <div className="text-[9px] font-mono font-bold text-[#8a816c] uppercase tracking-wider leading-none">
                      ⭐ Jibun Techo • Polaroid Film
                    </div>
                    <h1 className="text-base font-black text-[#3a3731] font-serif mt-1 tracking-tight">
                      本周手账心情胶囊
                    </h1>
                  </div>

                  {/* Simulated dynamic Japanese stamp circle (Special seal) */}
                  <div className="w-11 h-11 border-2 border-dashed border-[#d97d8c]/70 hover:border-red-500 rounded-full flex flex-col items-center justify-center rotate-[-15deg] select-none text-[8px] font-bold text-[#d97d8c] transform leading-none relative z-15 bg-white/30 backdrop-blur-xxs">
                    <span className="scale-[0.8] tracking-widest">{weeklyInsightAndStickers.stamps[0] || '特选手账'}</span>
                    <div className="w-7 h-[1px] bg-[#d97d8c]/40 my-0.5"></div>
                    <span className="scale-[0.7] font-mono font-bold text-[8px]">SEAL</span>
                  </div>
                </div>

                {/* Dynamic period metadata */}
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono py-2 border-b border-stone-200/80 px-0.5 relative z-10">
                  <span>署名记录: <b>{username}</b></span>
                  <span>周期: <b>{activeWeek.label}</b></span>
                </div>

                {/* Weekly Mood Ecosystem */}
                <div className="my-3.5 p-3 bg-[#faf9f3] border border-[#d6cfbe]/50 rounded-sm shadow-xxs relative z-10">
                  {/* Ribbon banner */}
                  <div className="absolute top-[-7px] left-3 bg-[#8a816c] text-[#fbfaf5] text-[7px] font-bold font-sans px-1.5 py-0.25 rounded uppercase tracking-wider">
                    心情胶囊柱状图统计
                  </div>

                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 pt-1">
                    <div className="col-span-2 text-[9.5px] text-gray-500 mb-0.5 font-sans leading-none">
                      情绪主基准: <span className="font-extrabold text-[#3a3731]">{moodEmojiMap[stats.dominantMood]} {stats.dominantMood}</span> ({weeklyInsightAndStickers.rating})
                    </div>
                    {Object.keys(stats.moodCounts).map(mood => {
                      const count = stats.moodCounts[mood];
                      const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                      if (count === 0) return null;
                      return (
                        <div key={mood} className="space-y-0.5 flex flex-col">
                          <div className="flex justify-between items-center text-[8.5px] font-sans">
                            <span className="font-bold flex items-center gap-0.5">
                              <span>{moodEmojiMap[mood]}</span>
                              <span>{mood}</span>
                            </span>
                            <span className="font-mono text-gray-400">{count}次 ({pct}%)</span>
                          </div>
                          <div className="w-full h-1 bg-stone-200/60 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: moodColorMap[mood] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ruled Notebook pages lists for the week */}
                <div className="space-y-2.5 relative z-10">
                  <div className="text-[9.5px] font-mono font-black text-[#8a816c] uppercase tracking-wider flex items-center justify-between pb-1 border-b border-[#ebdcb3]/60">
                    <span>📖 精选心流轨迹记录 (Selected Self-Techo Logs)</span>
                    <span>{stats.totalCount} 篇记录</span>
                  </div>

                  <div className="space-y-2.5">
                    {weekDays.map((day, idx) => {
                      if (day.note) {
                        const note = day.note;
                        const moodEm = moodEmojiMap[note.mood || '平和'] || '🧘';
                        return (
                          <div key={day.date} className="relative pl-3 pr-1 py-0.5 border-l-2 border-[#8a816c]/40 font-serif">
                            {/* Colored bullet point representing category */}
                            <span className="absolute left-[-3px] top-1.5 w-1.5 h-1.5 rounded-full bg-techo-teal"
                              style={{ backgroundColor: moodColorMap[note.mood || '平和'] }}
                            />
                            <div className="flex items-center justify-between gap-1 text-[8.5px] font-mono font-medium text-gray-455 leading-none mb-0.5">
                              <span>{day.dayLabel} • {note.date}</span>
                              <span className="bg-[#efeadf] text-[#6e685a] font-bold px-1 rounded text-[7.5px] transform scale-90">
                                {note.category}
                              </span>
                            </div>
                            <h3 className="text-[11px] font-black text-[#3a3731] font-sans flex items-center gap-1 leading-normal">
                              <span>{moodEm}</span>
                              <span>{note.title}</span>
                            </h3>
                            <p className="text-[9px] text-[#5c5446]/95 leading-relaxed font-serif tracking-wide border-b border-dashed border-[#8a816c]/15 pb-1 mt-0.5">
                              {note.content.substring(0, 95)}
                              {note.content.length > 95 ? '...' : ''}
                            </p>
                          </div>
                        );
                      } else {
                        return (
                          <div key={day.date} className="relative pl-3 pr-1 py-0.5 border-l border-dashed border-gray-300 select-none opacity-40">
                            <span className="absolute left-[-2px] top-1.5 w-1 h-1 rounded-full bg-gray-300" />
                            <div className="text-[8px] font-mono font-medium text-gray-350 leading-none">
                              {day.dayLabel} • {day.date}
                            </div>
                            <p className="text-[8.5px] text-gray-400 font-sans italic mt-0.5 leading-none">
                              - 舍得留白，这一天蓄能养息 -
                            </p>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>

                {/* Poetry / Wisdom Card */}
                <div className="mt-4 p-3 rounded bg-[#fff0f2]/30 border border-pink-100/30 relative z-10">
                  <span className="absolute bottom-1 right-2 font-mono text-[70px] text-pink-200/15 font-black pointer-events-none select-none leading-none z-0">
                    {moodEmojiMap[stats.dominantMood]}
                  </span>
                  
                  <div className="relative z-10 text-center space-y-1 py-0.5">
                    <p className="text-[10.5px] font-black italic text-[#8a5d62] font-serif leading-relaxed">
                      {weeklyInsightAndStickers.poetic}
                    </p>
                    <p className="text-[9px] text-[#6a5e55]/85 font-sans leading-relaxed pt-1 max-w-[340px] mx-auto text-left">
                      <b>自省评述:</b> {weeklyInsightAndStickers.advise}
                    </p>
                  </div>
                </div>

                {/* Bottom stationery credit marks */}
                <div className="mt-4 pt-2.5 border-t border-[#8a816c]/25 flex justify-between items-end text-[6.5px] text-gray-450 font-mono relative z-10">
                  <div className="space-y-0.5">
                    <p>SELF INTEGRATION DEVICE BY CLOUDFLARE D1</p>
                    <p>© 2026 JIBUN TECHO. ALL RIGHTS REGISTERED.</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-extrabold text-[#8a816c] flex items-center gap-0.5 bg-[#8a816c]/8 px-1 py-0.25 rounded">
                      特撰印
                    </span>
                    <p className="mt-0.5">OWNER APPROVED: {username}</p>
                  </div>
                </div>

              </div>

              {/* The wide iconic Polaroid bottom margin showing the handwritten caption/title */}
              <div className="mt-4 pb-1 w-full flex flex-col items-center justify-center text-center px-4 relative">
                {/* Dynamically styled handwriting signature text */}
                <span className="polaroid-caption-text text-[#3c362a] font-bold text-xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] rotate-[-1deg] inline-block h-8">
                  {customTitle || "情绪在纸面上安然落脚 🌿"}
                </span>

                {/* Tiny secondary technical info signature stamp */}
                <div className="flex items-center gap-1.5 mt-2.5 text-[8px] font-mono leading-none tracking-widest text-[#9c9484] uppercase select-none">
                  <span>JIBUN CAPSULE</span>
                  <span>•</span>
                  <span>{activeWeek.label}</span>
                </div>
              </div>

            </div>

          </div>

          {/* If the image was successfully generated, prompt the user with a convenient view */}
          {exportedImage && (
            <div className="p-3 bg-teal-50 border-t border-teal-200 text-teal-900 text-xs px-5 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                <span>恭喜！精致心情胶囊图已渲染完成并尝试发送到系统下载通道。若没有弹出保存，可右击下方胶囊图直接另存。</span>
              </span>
              <a 
                href={exportedImage} 
                download={`Jibun_Techo_Weekly_Capsule_${selectedWeekKey}.png`}
                className="px-3 py-1 bg-techo-teal hover:bg-techo-teal-darker text-white text-[11px] font-bold rounded shadow-xs shrink-0 text-center"
              >
                再次核发下载
              </a>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
