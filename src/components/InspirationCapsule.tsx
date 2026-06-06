import React, { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Sparkles, RefreshCw, PenTool, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Inspiration {
  title: string;
  quote: string;
  prompt: string;
  category: string;
  themeColor: string;
}

const inspirations: Inspiration[] = [
  {
    title: '我的最小可行性日常',
    quote: '最微弱的行为也优于最高尚的意图。只要写下一笔，生活就在朝前走。',
    prompt: '列出你今天达成的 3 个细微但确凿的小成就（例如：多喝了满温水、精读一段高质量文档，或整理了一遍案头）。',
    category: '日常',
    themeColor: 'from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200'
  },
  {
    title: '心流时刻深度复现',
    quote: '深水静流。真正的效率，在于灵魂安息在高度专注的焦耳里。',
    prompt: '回忆并记下你今天集中注意力工作/写代码的 30 分钟体验。身心处于什么状态？周围有怎样的背景杂音？',
    category: '技术思考',
    themeColor: 'from-teal-500/10 to-emerald-500/10 text-teal-800 border-teal-200'
  },
  {
    title: '给生活留些奶油空白',
    quote: '手账纸页的留白并不是空虚缺憾，它是为了给墨彩呼吸的空间。',
    prompt: '有没有某一个时刻，你放下了手机，只是安静地望着窗外或者听了三分钟微风？写下那种舒适静止的体感细节。',
    category: '随笔感悟',
    themeColor: 'from-indigo-500/10 to-blue-500/10 text-indigo-805 border-indigo-200'
  },
  {
    title: '感怀一份微碎的暖意',
    quote: '爱是细碎日常的粘合剂，如同泛黄纸页轻轻托起你所有的倾诉。',
    prompt: '今天有接收到来自周遭人的微小善意吗（比如一杯清晨的拿铁、一次公交让座、或是外卖员的祝福语）？向它致谢吧。',
    category: '生活记录',
    themeColor: 'from-orange-500/10 to-amber-500/10 text-orange-800 border-orange-200'
  },
  {
    title: '在格线上调顺焦虑微澜',
    quote: '焦虑往往是身体在暗示你对成长的隐秘渴望。去写，在手账纸面里重建船锚。',
    prompt: '写下一件近期让你萦绕焦虑的事，将它分流为两列：【我可以立即掌控改变的分支】与【我必须全然静心接纳的因果】。',
    category: '随笔感悟',
    themeColor: 'from-rose-500/10 to-pink-500/10 text-rose-800 border-rose-200'
  },
  {
    title: '未来副业极客狂想',
    quote: '未来的你是你目前微小探索的总和。勇敢与好奇是免费的入场券。',
    prompt: '如果你今天能得到 2 个小时的绝对自由和十万元无责任研发经费，你想做出一个什么好玩的网络边角料或微小服务？',
    category: '副业规划',
    themeColor: 'from-indigo-500/10 to-purple-500/10 text-purple-800 border-purple-205'
  },
  {
    title: '向三年前的自己寄信',
    quote: '纵有疾风起，人生的暗礁终会被细密的记录化成沙滩。别怕。',
    prompt: '如果能够发送一条 45 个字的短信给三年前正处于技术瓶颈或生活困扰的自己，你会带去哪两个治愈的方法或启示？',
    category: '随笔感悟',
    themeColor: 'from-yellow-500/10 to-amber-500/10 text-yellow-800 border-yellow-200'
  },
  {
    title: '一堂费曼概念日课',
    quote: '写下每一行能被编译的代码，也留下每一段可被细密重构的记忆。',
    prompt: '今天你遇到了哪一个新名词、新算法或新技术细节？请尝试用大白话和通俗的比喻，‘讲给一个10岁的孩子听’。',
    category: '技术思考',
    themeColor: 'from-teal-500/10 to-sky-500/10 text-teal-850 border-teal-200'
  },
  {
    title: '空间物理状态快照',
    quote: '万物静观皆自得，四时佳兴与人同。此时此地的静止，亦是幸福。',
    prompt: '记录下此时此刻你书写时身处的周遭物理环境（气温、背景的音乐、桌面水杯的轻响、咖啡的缭绕香气等）。',
    category: '日常',
    themeColor: 'from-blue-500/10 to-indigo-500/10 text-blue-800 border-blue-200'
  },
  {
    title: '情绪草本茶校准',
    quote: '生活需要细火慢熬，手账上的心火终会在温水中散发出芬芳。',
    prompt: '如果可以用一杯温润的热饮（如甘菊茶、辛辣的姜糖、微苦但回甘的深焙抹茶）代表你今时今日的心情，你会如何描述它？',
    category: '日常',
    themeColor: 'from-amber-500/10 to-emerald-500/10 text-emerald-850 border-emerald-200'
  }
];

interface InspirationCapsuleProps {
  onApplyPrompt: (title: string, promptText: string, category: string) => void;
}

export interface InspirationCapsuleRef {
  refresh: () => void;
}

const InspirationCapsule = forwardRef<InspirationCapsuleRef, InspirationCapsuleProps>(
  ({ onApplyPrompt }, ref) => {
    // Select default stable prompt based on current date (2026-06-03 simulated)
    const getDailyIndex = () => {
      try {
        const today = new Date();
        const dateNum = today.getDate() + today.getMonth() * 31 + today.getFullYear();
        return dateNum % inspirations.length;
      } catch {
        return 0;
      }
    };

    const [currentIndex, setCurrentIndex] = useState(getDailyIndex);
    const [isRotating, setIsRotating] = useState(false);

    const activeInspiration = inspirations[currentIndex];

    const handleShuffle = () => {
      setIsRotating(true);
      // Find next index that is different
      let nextIndex = Math.floor(Math.random() * inspirations.length);
      if (nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % inspirations.length;
      }
      
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsRotating(false);
      }, 400);
    };

    // Expose refresh functionality to parents holding the ref
    useImperativeHandle(ref, () => ({
      refresh: () => {
        handleShuffle();
      }
    }));

    const handleApply = () => {
      const formattedPrefix = `> **今日灵感胶囊：${activeInspiration.title}**\n> *“${activeInspiration.quote}”*\n>\n> **灵感写作提示：** ${activeInspiration.prompt}\n\n`;
      onApplyPrompt(
        `今日灵感：${activeInspiration.title}`,
        formattedPrefix,
        activeInspiration.category
      );
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 15 }}
        className="bg-[#fffef8] border-2 border-[#d3cfc3] rounded-lg p-4 shadow-sm relative overflow-hidden select-none"
      >
        {/* Decorative vertical binding bar on the left */}
        <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-between py-3 bg-[#bebaaa]/25">
          <div className="w-1 h-1 rounded-full bg-stone-300 mx-auto" />
          <div className="w-1 h-1 rounded-full bg-stone-300 mx-auto" />
          <div className="w-1 h-1 rounded-full bg-stone-300 mx-auto" />
        </div>

        <div className="pl-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left main contents inside AnimatePresence */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white font-black text-[9.5px] px-2 py-0.5 rounded-[4px] tracking-wide shadow-xxs">
                💊 灵感胶囊 • Jibun Prompt
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded border font-sans bg-[#faf8ee] text-stone-605`}>
                推荐分类: {activeInspiration.category}
              </span>
              <span className="text-[9px] text-gray-400 italic">“愿这颗胶囊驱散对空白纸页的无力”</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-1"
              >
                <h4 className="font-display font-black text-xs text-[#3a3731] flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500 animate-pulse shrink-0" />
                  <span>{activeInspiration.title}</span>
                </h4>
                
                <p className="text-[10.5px] leading-relaxed italic text-gray-450 font-serif border-l-2 border-stone-200 pl-2">
                  “{activeInspiration.quote}”
                </p>

                <p className="text-[11px] leading-relaxed text-[#555047]/90 font-medium font-sans mt-1">
                  <span className="font-black text-techo-teal">✎ 今日日记提示：</span>
                  {activeInspiration.prompt}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Controls right-side aligned */}
          <div className="flex items-center gap-2 max-xs:w-full max-xs:grid max-xs:grid-cols-2 shrink-0">
            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              disabled={isRotating}
              className="px-3 py-2 bg-white border border-[#bebaaa] hover:border-amber-400 text-[#6e685a] hover:text-[#3a3731] transition-all rounded-[5px] text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xxs"
            >
              <RefreshCw size={12} className={`${isRotating ? 'animate-spin' : ''}`} />
              <span>换一颗</span>
            </button>

            {/* Write with suggestion */}
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-2 bg-techo-teal hover:bg-techo-teal-darker text-white transition-all rounded-[5px] text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="一键预填灵感并开始记录今日自省"
            >
              <PenTool size={12} className="text-amber-100" />
              <span>以此新建并书写</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default InspirationCapsule;
