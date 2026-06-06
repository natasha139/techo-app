/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as d3 from 'd3';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  Calendar, 
  CloudSun, 
  Smile, 
  Search, 
  Tag, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Eye,
  PenTool
} from 'lucide-react';
import { DiaryNote } from '../types';
import WeeklyMoodCapsule from './WeeklyMoodCapsule';
import InspirationCapsule, { InspirationCapsuleRef } from './InspirationCapsule';
import { motion } from 'motion/react';

// Premium Markdown renderer for Jibun Techo hand-planner style
const renderMarkdown = (text: string, highlightedId?: string | null) => {
  if (!text) return <p className="text-gray-400 italic font-medium">内容为空...</p>;

  // Split content by newline to parse block-level elements
  const lines = text.split('\n');
  
  // Helper to parse inline styles (bold, italics, inline code)
  const parseInlineStyles = (lineText: string): React.ReactNode => {
    let elements: (React.ReactNode | string)[] = [];
    let currentText = lineText;
    let index = 0;
    
    while (currentText.length > 0) {
      const codeMatch = currentText.match(/`([^`]+)`/);
      const boldMatch = currentText.match(/\*\*([^*]+)\*\*/);
      const italicMatch = currentText.match(/\*([^*]+)\*/);
      
      let firstMatch: { index: number; length: number; type: 'code' | 'bold' | 'italic'; content: string } | null = null;
      
      if (codeMatch && codeMatch.index !== undefined) {
        firstMatch = { index: codeMatch.index, length: codeMatch[0].length, type: 'code', content: codeMatch[1] };
      }
      
      if (boldMatch && boldMatch.index !== undefined) {
        if (!firstMatch || boldMatch.index < firstMatch.index) {
          firstMatch = { index: boldMatch.index, length: boldMatch[0].length, type: 'bold', content: boldMatch[1] };
        }
      }
      
      if (italicMatch && italicMatch.index !== undefined) {
        if (!firstMatch || italicMatch.index < firstMatch.index) {
          firstMatch = { index: italicMatch.index, length: italicMatch[0].length, type: 'italic', content: italicMatch[1] };
        }
      }
      
      if (firstMatch) {
        if (firstMatch.index > 0) {
          elements.push(currentText.substring(0, firstMatch.index));
        }
        
        const idKey = `inline-${index++}`;
        if (firstMatch.type === 'code') {
          elements.push(
            <code key={idKey} className="font-mono bg-[#8a816c]/10 text-techo-teal px-1 py-0.5 rounded text-[11px] border border-techo-teal/15 font-semibold">
              {firstMatch.content}
            </code>
          );
        } else if (firstMatch.type === 'bold') {
          elements.push(
            <strong key={idKey} className="font-extrabold text-[#1a1a18] bg-amber-50/50 px-0.5">
              {firstMatch.content}
            </strong>
          );
        } else if (firstMatch.type === 'italic') {
          elements.push(
            <em key={idKey} className="italic text-[#6b624e] font-serif pr-0.5 font-semibold">
              {firstMatch.content}
            </em>
          );
        }
        
        currentText = currentText.substring(firstMatch.index + firstMatch.length);
      } else {
        elements.push(currentText);
        break;
      }
    }
    
    return elements.length > 0 ? elements : lineText;
  };

  return (
    <div className="space-y-3 font-sans text-[#423f38] text-xs">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const lineKey = `line-${index}`;

        // 1. Horizontal Rule (--- or ***)
        if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
          return (
            <hr key={lineKey} className="border-t border-[#eae6d8] my-4 border-dashed" />
          );
        }

        // 2. Headings (# Title, ## Title, ### Title)
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const textContent = headingMatch[2];
          const hasStyle = parseInlineStyles(textContent);
          const elementId = `diary-heading-${index}`;
          const isHighlighted = highlightedId === elementId;
          
          const highlightClass = isHighlighted 
            ? 'bg-techo-teal/15 ring-4 ring-techo-teal/10 px-2 py-0.5 rounded transition-all duration-300' 
            : 'transition-all duration-300';
          
          if (level === 1) {
            return (
              <h1 id={elementId} key={lineKey} className={`font-display font-black text-[#2e2b26] text-[14px] border-b border-techo-teal/20 pb-1 mt-4 mb-2 flex items-center gap-1.5 scroll-mt-6 ${highlightClass}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-techo-teal shrink-0" />
                {hasStyle}
              </h1>
            );
          } else if (level === 2) {
            return (
              <h2 id={elementId} key={lineKey} className={`font-display font-black text-[#3c3830] text-xs border-b border-[#eae6d8] pb-0.5 mt-3 mb-1.5 flex items-center gap-1.5 scroll-mt-6 ${highlightClass}`}>
                <span className="w-1.5 h-3 bg-techo-teal rounded" />
                {hasStyle}
              </h2>
            );
          } else {
            return (
              <h3 id={elementId} key={lineKey} className={`font-display font-extrabold text-[#555047] text-[11px] mt-3 mb-1 flex items-center gap-1 pl-1 scroll-mt-6 ${highlightClass}`}>
                <span className="text-techo-teal">◆</span>
                {hasStyle}
              </h3>
            );
          }
        }

        // 3. Blockquotes (> Word)
        if (trimmedLine.startsWith('>')) {
          const quoteText = trimmedLine.replace(/^>\s*/, '');
          return (
            <blockquote key={lineKey} className="border-l-4 border-techo-teal/30 pl-3 py-1.5 my-2 italic bg-techo-teal/5 text-[#555047] rounded-r">
              {parseInlineStyles(quoteText)}
            </blockquote>
          );
        }

        // 4. Task Lists (- [ ] or - [x])
        const taskMatch = trimmedLine.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
        if (taskMatch) {
          const isDone = taskMatch[1].toLowerCase() === 'x';
          const taskText = taskMatch[2];
          return (
            <div key={lineKey} className="flex items-start gap-2 pl-2 py-0.5 my-0.5">
              <input 
                type="checkbox" 
                checked={isDone} 
                readOnly 
                className="mt-1 w-3.5 h-3.5 accent-techo-teal rounded border-[#cbd5e1] text-white shrink-0 pointer-events-none"
              />
              <span className={`text-[11.5px] leading-relaxed ${isDone ? 'line-through text-gray-400 font-normal' : 'text-[#423f38] font-bold'}`}>
                {parseInlineStyles(taskText)}
              </span>
            </div>
          );
        }

        // 5. Unordered Lists (- or * Item)
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const itemText = trimmedLine.substring(2);
          return (
            <div key={lineKey} className="flex items-start gap-2 pl-3 py-0.5 my-0.5">
              <span className="text-techo-teal mt-0.5 select-none shrink-0">•</span>
              <span className="text-[11.5px] leading-relaxed text-[#423f38] font-bold">
                {parseInlineStyles(itemText)}
              </span>
            </div>
          );
        }

        // 6. Ordered Lists (1. Item)
        const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const itemText = orderedMatch[2];
          return (
            <div key={lineKey} className="flex items-start gap-2 pl-3 py-0.5 my-0.5">
              <span className="text-techo-teal font-mono text-[10px] font-bold mt-0.5 select-none shrink-0">{num}.</span>
              <span className="text-[11.5px] leading-relaxed text-[#423f38] font-semibold">
                {parseInlineStyles(itemText)}
              </span>
            </div>
          );
        }

        // 7. Images ![alt](src)
        const imgMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          return (
            <img key={lineKey} src={imgMatch[2]} alt={imgMatch[1]}
              className="max-w-full rounded-md border border-[#eae6d8] my-2 max-h-80 object-contain" />
          );
        }

        // 8. Plain Paragraph (if empty line, return clean spacer)
        if (trimmedLine === '') {
          return <div key={lineKey} className="h-2.5" />;
        }

        return (
          <p key={lineKey} className="text-[11.5px] leading-relaxed mb-1.5 font-medium">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
};

const parseChronicleContent = (content: string) => {
  const fields = {
    sleep: '',
    diet: '',
    work: '',
    read: '',
    knowledge: '',
    inspiration: ''
  };
  if (!content) return fields;
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('睡眠：')) {
      fields.sleep = line.substring(3);
    } else if (line.startsWith('饮食：')) {
      fields.diet = line.substring(3);
    } else if (line.startsWith('工作：')) {
      fields.work = line.substring(3);
    } else if (line.startsWith('阅读：')) {
      fields.read = line.substring(3);
    } else if (line.startsWith('新知识：')) {
      fields.knowledge = line.substring(4);
    } else if (line.startsWith('灵感：')) {
      fields.inspiration = line.substring(3);
    }
  }
  return fields;
};

const renderCompiledReceipt = (content: string, date: string, weather: string, moodName: string) => {
  const fields = parseChronicleContent(content);
  const { matches, purity } = getChronicleAudit(content);
  
  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 border-stone-300 rounded shadow-sm p-5 font-mono text-[#333] relative overflow-hidden select-text text-left">
      {/* Receipts dotted edge details */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#eae6d8_50%,transparent_50%)] bg-[size:10px_10px] opacity-60" />
      
      {/* Store header info */}
      <div className="text-center pt-2 pb-4 border-b border-dashed border-stone-300 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-stone-700">
          <span>🧾</span>
          <span>NATASHA'S BIOLOGICAL REPORT</span>
        </div>
        <div className="text-[10px] text-gray-400">JIBUN TECHO CLINICAL EXPERIMENTAL LOG</div>
        <div className="text-[10px] text-gray-500 font-bold">DATE: {date} · WEATHER: {weather}</div>
        <div className="text-[10px] text-[#8a816c] font-bold">MOOD STATE: {moodName}</div>
      </div>
      
      {/* Ledger item list */}
      <div className="py-4 space-y-3.5 text-xs">
        <div className="flex justify-between font-bold text-[10px] text-gray-400 pb-1 border-b border-stone-200">
          <span>事实维度 (DIMENSION)</span>
          <span>行项内容 (FACT ITEM)</span>
        </div>
        
        {/* 睡眠 */}
        <div className="flex flex-col gap-0.5 border-b border-dotted border-stone-100 pb-1.5">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>💤</span>
            <span>睡眠 SLEEP</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.sleep || <span className="text-gray-350 italic font-normal">（无事实记录）</span>}
          </span>
        </div>

        {/* 饮食 */}
        <div className="flex flex-col gap-0.5 border-b border-dotted border-stone-100 pb-1.5">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>🍱</span>
            <span>饮食 DIET</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.diet || <span className="text-gray-350 italic font-normal">（无事实记录）</span>}
          </span>
        </div>

        {/* 工作 */}
        <div className="flex flex-col gap-0.5 border-b border-dotted border-stone-100 pb-1.5">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>💼</span>
            <span>工作 WORK</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.work || <span className="text-gray-350 italic font-normal">（无事实记录）</span>}
          </span>
        </div>

        {/* 阅读 */}
        <div className="flex flex-col gap-0.5 border-b border-dotted border-stone-100 pb-1.5">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>📖</span>
            <span>阅读 READ</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.read || <span className="text-gray-350 italic font-normal">（无事实记录）</span>}
          </span>
        </div>

        {/* 新知识 */}
        <div className="flex flex-col gap-0.5 border-b border-dotted border-stone-100 pb-1.5">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>💡</span>
            <span>新知 LEARNING</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.knowledge || <span className="text-gray-350 italic font-normal">（无事实记录）</span>}
          </span>
        </div>

        {/* 灵感 */}
        <div className="flex flex-col gap-0.5 pb-1">
          <div className="text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
            <span>🔮</span>
            <span>灵感 INSPIRATION</span>
          </div>
          <span className="text-[11px] text-stone-800 leading-normal pl-4 font-sans">
            {fields.inspiration || <span className="text-gray-350 italic font-normal">（无情绪感触事实）</span>}
          </span>
        </div>
      </div>
      
      {/* Footer Dotted divider */}
      <div className="border-t border-dashed border-stone-300 pt-3 mt-2 text-[10px] space-y-1">
        <div className="flex justify-between items-center text-stone-500">
          <span>OBJECTIVE LEVEL:</span>
          <span className="font-bold text-stone-800">{purity}% OBJECTIVE</span>
        </div>
        <div className="flex justify-between items-center text-stone-500">
          <span>AUDIT STATUS:</span>
          <span className={`font-black uppercase text-[10px] ${purity === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {purity === 100 ? 'PASS (0% EMOTION)' : 'CONTAIN SPECULATIVE'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[8px] text-gray-400 font-sans border-t border-stone-100 pt-2 mt-1">
          <span>TXID: #9319-CK92-{date.replace(/-/g, '')}</span>
          <span>JIBUN SYSTEM LABS inc.</span>
        </div>
      </div>

      {/* Retro Circular ink stamp in bottom right! */}
      <div className="absolute bottom-6 right-6 w-16 h-16 rounded-full border-2 border-dashed border-rose-500/25 flex flex-col items-center justify-center text-[9px] font-extrabold text-rose-500/35 select-none transform rotate-12 pointer-events-none uppercase font-sans">
        <div className="border-b border-rose-500/20 pb-0.5 mb-0.5 tracking-tight px-1 scale-90">JIBUN CHECK</div>
        <div className="text-[7.5px] scale-95 uppercase font-bold tracking-tighter">100% OBJECTIVE</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#eae6d8_50%,transparent_50%)] bg-[size:10px_10px] opacity-60" />
    </div>
  );
};

interface DiarySectionProps {
  diaryNotes: DiaryNote[];
  username?: string;
  onAddDiary: (note: Omit<DiaryNote, 'id'>) => void;
  onUpdateDiary: (id: string, fields: Partial<DiaryNote>) => void;
  onDeleteDiary: (id: string) => void;
}

interface MoodPreset {
  value: string;
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const moodPresets: MoodPreset[] = [
  { value: '开心', label: '开心', emoji: '😊', colorClass: 'text-amber-700 font-bold', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' },
  { value: '专注', label: '专注', emoji: '🎯', colorClass: 'text-teal-700 font-bold', bgClass: 'bg-[#f0fdfa]', borderClass: 'border-teal-200' },
  { value: '焦虑', label: '焦虑', emoji: '😰', colorClass: 'text-rose-700 font-bold', bgClass: 'bg-rose-50', borderClass: 'border-rose-220' },
  { value: '平和', label: '平和', emoji: '🧘', colorClass: 'text-indigo-700 font-bold', bgClass: 'bg-[#f5f3ff]', borderClass: 'border-indigo-200' },
  { value: '欣喜', label: '欣喜', emoji: '🌟', colorClass: 'text-yellow-600 font-bold', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-250' },
  { value: '温暖', label: '温暖', emoji: '☕', colorClass: 'text-orange-700 font-bold', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' },
  { value: '疲惫', label: '疲惫', emoji: '💤', colorClass: 'text-blue-700 font-bold', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' },
];

const getMoodDetails = (moodStr: string | undefined): MoodPreset => {
  const normalized = moodStr || '';
  if (normalized.includes('开心') || normalized.includes('😊') || normalized.includes('😄')) {
    return { value: '开心', label: '开心', emoji: '😊', colorClass: 'text-amber-700', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' };
  }
  if (normalized.includes('专注') || normalized.includes('🎯')) {
    return { value: '专注', label: '专注', emoji: '🎯', colorClass: 'text-teal-700', bgClass: 'bg-[#f0fdfa]', borderClass: 'border-teal-200' };
  }
  if (normalized.includes('焦虑') || normalized.includes('😰') || normalized.includes('😟')) {
    return { value: '焦虑', label: '焦虑', emoji: '😰', colorClass: 'text-rose-700', bgClass: 'bg-rose-50', borderClass: 'border-rose-250' };
  }
  if (normalized.includes('平和') || normalized.includes('平静') || normalized.includes('🧘') || normalized.includes('😌')) {
    return { value: '平和', label: '平和', emoji: '🧘', colorClass: 'text-indigo-700', bgClass: 'bg-[#f5f3ff]', borderClass: 'border-indigo-200' };
  }
  if (normalized.includes('欣喜') || normalized.includes('🌟')) {
    return { value: '欣喜', label: '欣喜', emoji: '🌟', colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-250' };
  }
  if (normalized.includes('温暖') || normalized.includes('☕')) {
    return { value: '温暖', label: '温暖', emoji: '☕', colorClass: 'text-orange-700', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' };
  }
  if (normalized.includes('疲惫') || normalized.includes('💤') || normalized.includes('😴')) {
    return { value: '疲惫', label: '疲惫', emoji: '💤', colorClass: 'text-blue-700', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' };
  }
  return { value: '平和', label: '平和', emoji: '🧘', colorClass: 'text-[#6e634e]', bgClass: 'bg-[#faf8f2]', borderClass: 'border-[#eae6d8]' };
};

const countMoods = (notes: DiaryNote[]) => {
  const counts: Record<string, number> = {
    '开心': 0,
    '专注': 0,
    '焦虑': 0,
    '平和': 0,
    '欣喜': 0,
    '温暖': 0,
    '疲惫': 0,
  };
  
  notes.forEach(note => {
    const mood = getMoodDetails(note.mood).value;
    if (counts[mood] !== undefined) {
      counts[mood]++;
    } else {
      counts['平和']++;
    }
  });
  
  return counts;
};

interface MoodPieChartD3Props {
  data: Record<string, number>;
  totalCount: number;
}

const MoodPieChartD3 = ({ data, totalCount }: MoodPieChartD3Props) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear the previous svg elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 160;
    const height = 160;
    const radius = Math.min(width, height) / 2;
    
    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
    const chartData = Object.keys(data)
      .map(mood => ({ mood, count: data[mood] }))
      .filter(d => d.count > 0);
      
    if (chartData.length === 0 || totalCount === 0) {
      const arc = d3.arc()
        .innerRadius(40)
        .outerRadius(64);
        
      container.append('path')
        .attr('d', arc({ startAngle: 0, endAngle: 2 * Math.PI, innerRadius: 40, outerRadius: 64 }) as string)
        .attr('fill', '#fdfcf7')
        .attr('stroke', '#bebaaa')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3');
        
      container.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('class', 'font-sans text-[11px] font-bold text-[#bcaba3]')
        .text('暂无心境数据');
      return;
    }
    
    const pie = d3.pie<{ mood: string; count: number }>()
      .value(d => d.count)
      .sort(null);
      
    const arc = d3.arc<d3.PieArcDatum<{ mood: string; count: number }>>()
      .innerRadius(38)
      .outerRadius(62)
      .padAngle(0.04)
      .cornerRadius(4);
      
    const arcHover = d3.arc<d3.PieArcDatum<{ mood: string; count: number }>>()
      .innerRadius(35)
      .outerRadius(67)
      .padAngle(0.04)
      .cornerRadius(4);
      
    const arcs = container.selectAll('.arc')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'arc');
      
    const moodColorMap: Record<string, string> = {
      '开心': '#f59e0b',
      '专注': '#0d9488',
      '焦虑': '#f43f5e',
      '平和': '#6366f1',
      '欣喜': '#eab308',
      '温暖': '#f97316',
      '疲惫': '#2563eb',
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
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => moodColorMap[d.data.mood] || '#a19a86')
      .attr('class', 'cursor-pointer select-none')
      .style('stroke', '#fffdf5')
      .style('stroke-width', '1.5px')
      .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))');
          
        centerTextValue.text(`${Math.round((d.data.count / totalCount) * 100)}%`);
        centerTextLabel.text(`${moodEmojiMap[d.data.mood]} ${d.data.mood}`);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))');
          
        centerTextValue.text(`${totalCount} 篇`);
        centerTextLabel.text('心情日记');
      });
      
    const centerTextValue = container.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.05em')
      .attr('class', 'font-sans text-[13px] font-black text-[#555047]')
      .text(`${totalCount} 篇`);
      
    const centerTextLabel = container.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('class', 'font-sans text-[9px] font-bold text-gray-400')
      .text('心情日记');
      
  }, [data, totalCount]);

  return (
    <div className="relative w-[150px] h-[150px] flex items-center justify-center bg-white/40 rounded-full border border-[#eae6d8]/40 shadow-inner">
      <svg ref={svgRef}></svg>
    </div>
  );
};

const MoodTrendAnalysis = ({ 
  diaryNotes,
  onOpenCapsule
}: { 
  diaryNotes: DiaryNote[];
  onOpenCapsule: () => void;
}) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'all'>('weekly');

  const filteredNotes = React.useMemo(() => {
    if (timeRange === 'all') {
      return diaryNotes;
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateLimitStr = sevenDaysAgo.toISOString().substring(0, 10);
    
    const weeklyNotes = diaryNotes.filter(n => n.date >= dateLimitStr);
    if (weeklyNotes.length > 0) return weeklyNotes;
    
    return [...diaryNotes].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 7);
  }, [diaryNotes, timeRange]);

  const countData = React.useMemo(() => {
    return countMoods(filteredNotes);
  }, [filteredNotes]);

  const totalCount = React.useMemo(() => {
    return Object.keys(countData).reduce((sum, key) => sum + countData[key], 0);
  }, [countData]);

  const dominantMood = React.useMemo(() => {
    let maxCount = 0;
    let maxMood = '平和';
    Object.keys(countData).forEach(mood => {
      const count = countData[mood];
      if (count > maxCount) {
        maxCount = count;
        maxMood = mood;
      }
    });
    return totalCount > 0 ? maxMood : '平和';
  }, [countData, totalCount]);

  const adviceDetails = React.useMemo(() => {
    switch (dominantMood) {
      case '开心':
      case '欣喜':
      case '温暖':
        return {
          title: "😊 阳光普照，温润而泽",
          content: "身侧有暖阳，心中有学问。近期阳光般的心境最适合做深度复盘或规划全新副业。把这份快乐与专注融入到手帐生活里吧！",
          badgeColor: "bg-amber-50/50 text-amber-900 border-amber-200/50"
        };
      case '专注':
        return {
          title: "🎯 极致匠心，深水静流",
          content: "本周专注极其高效，技术难关多在这类心境下被攻破。请继续守护当下的平和宁静，但在高效之余也记得在晚上九点放空十分钟哦。",
          badgeColor: "bg-[#f0fdfa] text-teal-900 border-teal-200/50"
        };
      case '焦虑':
        return {
          title: "😰 缓溪长流，焦虑也是光",
          content: "焦虑往往伴随成长的烦恼，说明您正在走出舒适区。今天适合在手帐右侧记下一件微不足道的进展，或者写下 3 个切实可行的第一步。",
          badgeColor: "bg-rose-50/50 text-rose-900 border-rose-220"
        };
      case '疲惫':
        return {
          title: "💤 安神休眠，静待天明",
          content: "近期有疲惫感。请合上电脑，安享好眠。身体的休整如同经典的奶油底色纸页，给生活留白是为了勾勒未来金闪闪的目标。",
          badgeColor: "bg-blue-50/50 text-blue-900 border-blue-200/50"
        };
      default:
        return {
          title: "🧘 水波不兴，意定神闲",
          content: "波澜不惊的平和是极美妙的能量。随记里记下的每一条日常、技术复盘与副业构想，都是您深藏不露的智慧与前行的坐标。",
          badgeColor: "bg-[#f5f3ff] text-indigo-900 border-indigo-200/50"
        };
    }
  }, [dominantMood]);

  const moodColorMap: Record<string, string> = {
    '开心': 'bg-[#f59e0b]',
    '专注': 'bg-[#0d9488]',
    '焦虑': 'bg-[#f43f5e]',
    '平和': 'bg-[#6366f1]',
    '欣喜': 'bg-[#eab308]',
    '温暖': 'bg-[#f97316]',
    '疲惫': 'bg-[#2563eb]',
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

  return (
    <div className="bg-[#fffef8] border-2 border-[#d3cfc3] rounded-lg p-4 shadow-sm relative overflow-hidden select-none animate-fade-in flex flex-col md:flex-row items-center md:items-stretch gap-5">
      
      <div 
        className="absolute top-[4px] left-[15px] w-24 h-4 bg-amber-200/30 border border-dashed border-amber-300/30 select-none pointer-events-none transform -rotate-1 shadow-xxs font-mono text-[8px] text-amber-655/80 tracking-widest text-center leading-relaxed"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(217, 119, 6, 0.08) 4px, rgba(217, 119, 6, 0.08) 8px)' }}
      >
        ANALYSIS
      </div>

      <div className="absolute top-[4px] right-[15px] w-18 h-4 bg-teal-200/20 border border-dashed border-teal-300/20 select-none pointer-events-none transform rotate-2 shadow-xxs"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(13, 148, 136, 0.06) 3px, rgba(13, 148, 136, 0.06) 6px)' }}
      />

      <div className="flex flex-col items-center justify-center shrink-0 w-full xs:w-auto mt-2">
        <MoodPieChartD3 data={countData} totalCount={totalCount} />
        
        <div className="flex items-center gap-1 mt-3 bg-[#faf8eedc] p-0.5 rounded-md text-[9px] font-bold border border-[#eae6d8]">
          <button
            type="button"
            onClick={() => setTimeRange('weekly')}
            className={`px-2 py-0.5 rounded select-none cursor-pointer transition-all ${
              timeRange === 'weekly'
                ? 'bg-[#8a816c] text-white shadow-xxs font-black'
                : 'text-[#6e685a] hover:bg-white/40'
            }`}
          >
            本周 (7天)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-2 py-0.5 rounded select-none cursor-pointer transition-all ${
              timeRange === 'all'
                ? 'bg-[#8a816c] text-white shadow-xxs font-black'
                : 'text-[#6e685a] hover:bg-white/40'
            }`}
          >
            历史全部
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0 pr-0 md:pr-4 py-1 border-b md:border-b-0 md:border-r border-dashed border-[#eae6d8]">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-3 bg-techo-teal rounded shrink-0" />
          <h4 className="font-display font-black text-[#48453f] text-xs">
            {timeRange === 'weekly' ? '本周心情标签统计' : '全部心情标签统计'} ({totalCount}次记录)
          </h4>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-x-3 gap-y-1">
          {Object.keys(countData).map(mood => {
            const count = countData[mood];
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            const hasRecord = count > 0;
            return (
              <div 
                key={mood} 
                className={`flex items-center justify-between text-[11px] p-1 rounded-sm border border-transparent transition-all ${
                  hasRecord 
                    ? 'bg-[#fbfaf6] hover:bg-[#faf4df] hover:border-amber-200/40 text-[#423f38] font-bold' 
                    : 'opacity-40 text-gray-400'
                }`}
                title={`${mood}: ${count} 次记录 (${percentage}%)`}
              >
                <div className="flex items-center gap-1 truncate max-w-[80px]">
                  <span className={`${moodColorMap[mood]} w-2 h-2 rounded-full inline-block shrink-0`} />
                  <span className="text-[12px] shrink-0 leading-none">{moodEmojiMap[mood]}</span>
                  <span className="truncate">{mood}</span>
                </div>
                <div className="font-mono text-[9.5px] text-right font-medium text-gray-500 shrink-0 select-text">
                  {count}次 ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-[200px] py-1">
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-techo-pink rounded shrink-0" />
            <h4 className="font-display font-black text-[#48453f] text-xs">手账心境推荐意见贴</h4>
          </div>
          <button 
            type="button"
            onClick={onOpenCapsule}
            className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[4px] text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xxs transition-all cursor-pointer active:scale-95"
            title="生成一周心境精致分享画卷"
          >
            <span>💊 一键分享心情胶囊</span>
          </button>
        </div>

        <div className={`p-2.5 rounded-md border text-xs leading-relaxed transition-all duration-300 transform shadow-xxs ${adviceDetails.badgeColor} rotate-[-0.5deg]`}>
          <div className="font-extrabold text-[11.5px] mb-1.5 border-b border-dashed border-[#8a816c]/20 pb-1 flex items-center gap-1">
            <span>{adviceDetails.title}</span>
          </div>
          <p className="text-[10px] leading-relaxed text-[#555047]/90 font-medium">
            {adviceDetails.content}
          </p>
        </div>
      </div>

    </div>
  );
};

const JA_MONTHS: Record<number, { name: string; traditional: string; emoji: string }> = {
  1: { name: '一月', traditional: '睦月 (Mutsuki)', emoji: '🌸' },
  2: { name: '二月', traditional: '如月 (Kisaragi)', emoji: '❄️' },
  3: { name: '三月', traditional: '弥生 (Yayoi)', emoji: '☘️' },
  4: { name: '四月', traditional: '卯月 (Uzuki)', emoji: '🌷' },
  5: { name: '五月', traditional: '皋月 (Satsuki)', emoji: '🎏' },
  6: { name: '六月', traditional: '水无月 (Minazuki)', emoji: '🌊' },
  7: { name: '七月', traditional: '文月 (Fumizuki)', emoji: '🌌' },
  8: { name: '八月', traditional: '叶月 (Hazuki)', emoji: '🍉' },
  9: { name: '九月', traditional: '长月 (Nagatsuki)', emoji: '🍁' },
  10: { name: '十月', traditional: '神无月 (Kannazuki)', emoji: '🍂' },
  11: { name: '十一月', traditional: '霜月 (Shimotsuki)', emoji: '🌾' },
  12: { name: '十二月', traditional: '师走 (Shiwasu)', emoji: '🎄' }
};

interface MonthlyMoodCalendarProps {
  diaryNotes: DiaryNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: DiaryNote) => void;
  onStartNewWithDate: (date: string) => void;
  onOpenCapsule: () => void;
}

const MonthlyMoodCalendar = ({
  diaryNotes,
  selectedNoteId,
  onSelectNote,
  onStartNewWithDate,
  onOpenCapsule
}: MonthlyMoodCalendarProps) => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // 1-based index

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday, 1 is Monday ...

  // Today Date string format
  const todayStr = '2026-06-03'; // Fixed simulation matching workspace time

  // Month Statistics
  const monthNotes = diaryNotes.filter(n => {
    const parts = n.date.split('-');
    if (parts.length === 3) {
      return parseInt(parts[0]) === year && parseInt(parts[1]) === month;
    }
    return false;
  });

  const monthMoodCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      '开心': 0, '专注': 0, '焦虑': 0, '平和': 0, '欣喜': 0, '温暖': 0, '疲惫': 0
    };
    monthNotes.forEach(n => {
      const moodVal = getMoodDetails(n.mood).value;
      if (counts[moodVal] !== undefined) counts[moodVal]++;
    });
    return counts;
  }, [monthNotes]);

  const monthTotalNotes = monthNotes.length;

  return (
    <div className="bg-[#fffef8] border-2 border-[#d3cfc3] rounded-lg p-5 shadow-sm relative overflow-hidden select-none animate-fade-in flex flex-col gap-4">
      {/* Decorative notebook spine rings */}
      <div className="absolute top-0 bottom-0 left-0 w-2.5 flex flex-col justify-between py-5 bg-[#d5cfbe] border-r border-[#bebaaa]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mx-auto shadow-inner" />
        ))}
      </div>

      <div className="pl-4">
        {/* Dynamic header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eae6d8] pb-3 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <h3 className="font-display font-black text-[#48453f] text-sm font-sans">
                月度心情点阵日历 (Techo Monthly Mood Grid)
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              以每个日期下的心情图标点阵展示本月的整体情绪。点击日历格查阅、或「+」快速补写当天日记。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onOpenCapsule}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xxs active:scale-95 whitespace-nowrap shrink-0"
              title="一键分享您的本周心情手账大贴"
            >
              <span>💊 导出本周心情胶囊</span>
            </button>
            <div className="flex items-center gap-2 shrink-0 bg-[#fbfaf6] border border-[#d3cfc3] rounded px-2.5 py-1">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-1 rounded hover:bg-gray-200 cursor-pointer text-gray-500 transition-colors"
              title="上个月"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-mono font-bold text-[#48453f] min-w-[130px] text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
              <span>{year}年 {String(month).padStart(2, '0')}月</span>
              <span className="text-techo-teal bg-techo-teal/10 px-1 rounded text-[10px] font-medium scale-95 shrink-0">
                {JA_MONTHS[month]?.traditional} {JA_MONTHS[month]?.emoji}
              </span>
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="p-1 rounded hover:bg-gray-200 cursor-pointer text-gray-500 transition-colors"
              title="下个月"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          </div>
        </div>

        {/* Mini stats display ribbon */}
        <div className="flex flex-wrap items-center mt-3 gap-y-1.5 gap-x-3 text-[10.5px] border-b border-[#faf8f2] pb-2">
          <span className="text-gray-400 font-bold font-sans">本月记录: {monthTotalNotes} 天</span>
          {monthTotalNotes > 0 && (
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
              <span className="text-gray-400">|</span>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(monthMoodCounts).map((mood) => {
                  const count = monthMoodCounts[mood];
                  if (count === 0) return null;
                  const details = getMoodDetails(mood);
                  return (
                    <span key={mood} className="inline-flex items-center gap-1 text-[9.5px] bg-[#faf8ee] font-medium text-gray-600 px-1.5 py-0.5 rounded border border-[#eae6d8]/60">
                      <span>{details.emoji}</span>
                      <span>{mood}</span>
                      <span className="font-bold text-gray-450 ml-0.5">{count}次</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* The Grid Header - Japanese Stationery Flavor */}
        <div className="grid grid-cols-7 gap-1.5 mt-3 select-none text-center">
          <div className="text-[#d97d8c] font-black text-[10px] py-1 bg-[#fff0f2]/40 rounded border border-pink-100/30">日 (Sun)</div>
          <div className="text-gray-550 font-bold text-[10px] py-1 bg-[#efede5]/20 rounded border border-transparent">月 (Mon)</div>
          <div className="text-gray-550 font-bold text-[10px] py-1 bg-[#efede5]/20 rounded border border-transparent">火 (Tue)</div>
          <div className="text-gray-550 font-bold text-[10px] py-1 bg-[#efede5]/20 rounded border border-transparent">水 (Wed)</div>
          <div className="text-gray-550 font-bold text-[10px] py-1 bg-[#efede5]/20 rounded border border-transparent">木 (Thu)</div>
          <div className="text-gray-550 font-bold text-[10px] py-1 bg-[#efede5]/20 rounded border border-transparent">金 (Fri)</div>
          <div className="text-[#7090b0] font-black text-[10px] py-1 bg-[#e0f2fe]/20 rounded border border-blue-100/30">土 (Sat)</div>
        </div>

        {/* The Grid Days */}
        <div className="grid grid-cols-7 gap-1.5 mt-1.5 techo-grid-bg p-1 rounded-sm border border-[#efede5]">
          {/* Spacer cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className="bg-stone-50/20 border border-[#eae6d8]/30 rounded aspect-square md:h-14 opacity-25"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(220, 215, 201, 0.2) 5px, rgba(220, 215, 201, 0.2) 6px)' }}
            />
          ))}

          {/* Active days list */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
            const sameDayNote = diaryNotes.find(note => note.date === dateStr);
            const isToday = dateStr === todayStr;

            if (sameDayNote) {
              const mdDet = getMoodDetails(sameDayNote.mood);
              const isSelected = sameDayNote.id === selectedNoteId;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => onSelectNote(sameDayNote)}
                  className={`relative aspect-square md:aspect-auto md:h-14 p-1 rounded border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/55 shadow-xs ring-1 ring-amber-400/40 font-bold'
                      : `${mdDet.borderClass} ${mdDet.bgClass} hover:border-[#8a816c]/60 hover:bg-[#fff9e8]/55`
                  }`}
                  title={`${dateStr} (${mdDet.label})`}
                >
                  {/* Day marker and indicators */}
                  <div className="flex items-center justify-between pointer-events-none">
                    <span className={`text-[9.5px] font-mono font-black ${isToday ? 'bg-techo-pink text-white w-4 h-4 rounded-full flex items-center justify-center font-black' : 'text-gray-405'}`}>
                      {dayNum}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-techo-pink absolute top-1 right-1" />
                    )}
                  </div>

                  {/* Icon dot-matrix / Stamp-like mood emoji */}
                  <div className="flex-1 flex items-center justify-center pt-1 group-hover:scale-125 transition-transform duration-200 pointer-events-none">
                    <span className="text-xl filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] select-none leading-none">
                      {mdDet.emoji}
                    </span>
                  </div>

                  {/* Mood summary tag text */}
                  <span className={`text-[8px] text-center font-bold font-sans block leading-none pointer-events-none ${mdDet.colorClass}`}>
                    {mdDet.label}
                  </span>

                  {/* Visual Category streak at bottom */}
                  <div className="h-[2px] w-4/5 mx-auto rounded-full bg-stone-300 absolute bottom-[2px] left-[10%] group-hover:w-full transition-all duration-300 pointer-events-none"
                    style={{ backgroundColor: sameDayNote.category === '技术思考' ? '#4b8f8c' : sameDayNote.category === '随笔感悟' ? '#e09453' : sameDayNote.category === '生活记录' ? '#7090b0' : '#d97d8c' }}
                  />

                  {/* Premium floating CSS tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-[100] hidden group-hover:block bg-[#1a1917] text-[#fbfaf6] p-3 rounded-md shadow-2xl border border-[#c4bead] w-56 text-xs pointer-events-none mb-2 text-left leading-normal select-text transition-all animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-dashed border-[#8a816c]/40 pb-1 mb-1.5">
                      <span className="font-mono font-bold text-[10px] text-gray-400">{dateStr}</span>
                      <span className="text-[10px] bg-[#8a816c]/20 text-[#dfca9f] px-1.5 py-0.25 rounded font-black scale-90">
                        {sameDayNote.category}
                      </span>
                    </div>
                    <p className="font-black text-[11px] text-[#fadfa8] mb-1 line-clamp-1">
                      {mdDet.emoji} {sameDayNote.title}
                    </p>
                    <p className="text-[9.5px] text-gray-300 line-clamp-3 leading-relaxed">
                      {sameDayNote.content}
                    </p>
                    {sameDayNote.weather && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-[#8a816c]">
                        <span>天气: {sameDayNote.weather}</span>
                      </div>
                    )}
                    <p className="text-[8.5px] text-techo-teal font-black mt-1.5 text-right flex items-center justify-end gap-0.5 animate-pulse">
                      点击即时详阅该篇 ➔
                    </p>
                  </div>
                </div>
              );
            } else {
              // Day with no diary logs
              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => onStartNewWithDate(dateStr)}
                  className="relative aspect-square md:aspect-auto md:h-14 p-1 rounded border border-[#efede5] bg-[#fffdfa]/60 hover:border-techo-teal/40 hover:bg-techo-teal/5 hover:shadow-inner transition-all cursor-pointer flex flex-col justify-between group"
                  title={`${dateStr} (暂无记录)`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <span className={`text-[9.5px] font-mono leading-none ${isToday ? 'bg-techo-pink text-white w-4 h-4 rounded-full flex items-center justify-center font-black' : 'text-gray-300 font-bold'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-techo-pink absolute top-1 right-1" />
                    )}
                  </div>

                  {/* Faint click to compose "+" indicator on hover */}
                  <div className="flex-1 flex items-center justify-center font-bold text-transparent group-hover:text-techo-teal/60 transition-colors pointer-events-none">
                    <Plus size={14} className="group-hover:scale-125 transition-transform" />
                  </div>

                  <span className="text-[8px] text-transparent group-hover:text-techo-teal/50 font-black text-center line-span leading-none pointer-events-none mt-auto">
                    写随记
                  </span>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

const BANNED_CHRONICLE_WORDS = [
  '开心', '难过', '伤心', '痛苦', '郁闷', '绝望', '累', '疲惫', '觉得', '认为',
  '感觉', '有点', '非常', '特别', '极其', '超级', '极其', '极度', '很', '太',
  '感慨', '感悟', '感触', '启发', '深刻', '感动', '可惜', '遗憾', '兴奋', '激动',
  '糟糕', '完美', '优秀', '棒', '绝美', '无聊', '叹气', '主观', '估计', '可能吧',
  '好惨', '真惨', '太棒', '美丽', '漂亮', '优雅', '无语', '居然', '感觉好', '非常棒'
];

const getChronicleAudit = (content: string) => {
  if (!content) return { matches: [], purity: 100 };
  const matches: string[] = [];
  for (const word of BANNED_CHRONICLE_WORDS) {
    if (content.includes(word)) {
      matches.push(word);
    }
  }
  const purity = Math.max(10, 100 - matches.length * 15);
  return { matches, purity };
};

const CHRONICLE_FIELD_TEMPLATES: Record<string, { name: string; text: string }[]> = {
  sleep: [
    { name: '常规好眠', text: '23:00睡，7:00起，深睡至天亮' },
    { name: '晚睡早起', text: '01:30睡，7:00醒，睡眠稍显不足' },
    { name: '中途惊醒', text: '22:30入睡，3:15醒，半小时后复睡，7:00醒' },
    { name: '自然醒睡', text: '23:30睡，08:30自然清醒，未设闹钟' },
    { name: '运动疲休', text: '因跑步疲惫22:00提早入睡，6:00自然醒' }
  ],
  diet: [
    { name: '健康自制', text: '早餐燕麦粥配蓝莓，午餐燕麦麦麸皮与手撕鸡，晚餐自煮冬瓜排骨汤' },
    { name: '轻度控糖', text: '早午餐吃煎蛋培根吐司与美式咖啡，晚餐吃水煮生菜与香煎三文鱼' },
    { name: '工作简餐', text: '早餐写字楼便利店三明治，午餐点外卖牛油果沙拉，晚餐常温苏打水2瓶' },
    { name: '碳水犒劳', text: '上午摄入豆浆油条，中午肉夹馍，晚上外食牛肉拉面与炒青菜' }
  ],
  work: [
    { name: '研发输出', text: '开发完成3个页面结构，修复适配样式bug，合并分支并完成功能自测' },
    { name: '会议对齐', text: '参加团队需求评审会，撰写技术可行性分析文档，对齐了下周3个开发周期' },
    { name: '重构维护', text: '全面优化重构了数据导出逻辑代码，移除2个冗余状态，编译速度提升15%' },
    { name: '文档内容', text: '完成本月业务报告撰写，起草技术交接的大纲草案，更新了团队Wiki主页' }
  ],
  read: [
    { name: '历史纪实', text: '读《长安的荔枝》90至120页，深入校准当时驿站及储运客观成本细节' },
    { name: '技术规范', text: '精读了 Vite 全新打包器 Rollup 核心配置 API 规范，完成笔记整理' },
    { name: '社科研究', text: '查看了《置身事内》第一章关于地方政府招商引资与财政角色的微观机制' },
    { name: '成长认知', text: '读《终身成长》第三章有关大脑功能塑性部分的20页客观理论依据' }
  ],
  knowledge: [
    { name: '食物保鲜', text: '荔枝采摘后单宁阻隔被破，果皮内的多酚氧化酶会导致其在一天内迅速黑变' },
    { name: '网络传输', text: 'HTTP/3 使用了基于 UDP 的 QUIC 协议，可避免 TCP 握手握签延迟及丢包阻塞' },
    { name: '感知机制', text: '人体褪黑素分泌周期直接受视网膜光受体细胞探测蓝色光源光通量波段所调控' },
    { name: '社会经济', text: '地方政府融资平台（UDIC）以划拨土地等资产作为公募城投债信用担保筹集资金' }
  ],
  inspiration: [
    { name: '数字收据', text: '提供一键将月度流水事实转化为无边界拟真热敏物理小票并打包导出的交互' },
    { name: '赛博故事', text: '一个通过收集并记录纸质账单微小痕迹来侦破数据世界虚假凭空捏造的故事大纲' },
    { name: '可视化流', text: '把每日睡眠、新知、灵感数据作为节点绘制在类似地铁图的连通图谱中' },
    { name: '空间断网', text: '在家中划分一个“零电池无屏幕”一米方形区域，作为专注沉思的最简事实道场' }
  ]
};

export default function DiarySection({
  diaryNotes,
  username = 'Natasha',
  onAddDiary,
  onUpdateDiary,
  onDeleteDiary
}: DiarySectionProps) {
  
  // States
  const inspirationRef = React.useRef<InspirationCapsuleRef>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    diaryNotes.length > 0 ? diaryNotes[0].id : null
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPreview, setIsPreview] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [highlightedHeadingId, setHighlightedHeadingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activePopoverField, setActivePopoverField] = useState<string | null>(null);
  
  React.useEffect(() => {
    setShowDeleteConfirm(false);
  }, [selectedNoteId]);

  React.useEffect(() => {
    const handleGlobalClick = () => {
      setActivePopoverField(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);
  
  // Form states for creating or editing
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [editWeather, setEditWeather] = useState('晴 ☀️');
  const [editMood, setEditMood] = useState('平和');
  const [editCategory, setEditCategory] = useState('日常');
  const [editContent, setEditContent] = useState('');
  const [editTagsText, setEditTagsText] = useState('');

  // Structured fields for "流水账" (Fact-only Log Book)
  const [chronicleSleep, setChronicleSleep] = useState('');
  const [chronicleDiet, setChronicleDiet] = useState('');
  const [chronicleWork, setChronicleWork] = useState('');
  const [chronicleRead, setChronicleRead] = useState('');
  const [chronicleKnowledge, setChronicleKnowledge] = useState('');
  const [chronicleInspiration, setChronicleInspiration] = useState('');

  // Parser helper for "流水账" content
  const parseChronicleContent = (content: string) => {
    const fields = {
      sleep: '',
      diet: '',
      work: '',
      read: '',
      knowledge: '',
      inspiration: ''
    };
    if (!content) return fields;
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('睡眠：')) {
        fields.sleep = line.substring(3);
      } else if (line.startsWith('饮食：')) {
        fields.diet = line.substring(3);
      } else if (line.startsWith('工作：')) {
        fields.work = line.substring(3);
      } else if (line.startsWith('阅读：')) {
        fields.read = line.substring(3);
      } else if (line.startsWith('新知识：')) {
        fields.knowledge = line.substring(4);
      } else if (line.startsWith('灵感：')) {
        fields.inspiration = line.substring(3);
      }
    }
    return fields;
  };

  // Re-assemble "流水账" inputs to editContent reactively
  React.useEffect(() => {
    if (editCategory === '流水账') {
      const assembledText = [
        chronicleSleep ? `睡眠：${chronicleSleep}` : '',
        chronicleDiet ? `饮食：${chronicleDiet}` : '',
        chronicleWork ? `工作：${chronicleWork}` : '',
        chronicleRead ? `阅读：${chronicleRead}` : '',
        chronicleKnowledge ? `新知识：${chronicleKnowledge}` : '',
        chronicleInspiration ? `灵感：${chronicleInspiration}` : ''
      ].filter(Boolean).join('\n');
      
      setEditContent(assembledText);
    }
  }, [editCategory, chronicleSleep, chronicleDiet, chronicleWork, chronicleRead, chronicleKnowledge, chronicleInspiration]);

  // Finding active note
  const activeNote = diaryNotes.find(n => n.id === selectedNoteId) || null;

  // Auto-generate Table of Contents from active note
  const tocItems: { id: string; text: string; level: number }[] = [];
  if (activeNote && !isEditing) {
    const lines = activeNote.content.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        // Strip markdown bold, italics, code for simple clean directory titles
        const cleanText = headingMatch[2]
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1');
        tocItems.push({
          id: `diary-heading-${index}`,
          text: cleanText,
          level
        });
      }
    });
  }

  // Handle smooth scroll navigation
  const handleScrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedHeadingId(id);
      setTimeout(() => {
        setHighlightedHeadingId(null);
      }, 1500);
    }
  };

  // Weather Options
  const weatherOptions = ['晴 ☀️', '微风 🍃', '阴天 ☁️', '雨天 🌧️', '大雪 ❄️', '多云 ⛅', '雷雨 ⛈️'];
  // Category Options
  const categories = ['日常', '技术思考', '生活记录', '随笔感悟', '育儿琐碎', '副业规划', '流水账'];

  // Handle Note Selection
  const handleSelectNote = (note: DiaryNote) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
  };

  // Trigger Edit Mode
  const startEditing = () => {
    if (!activeNote) return;
    setEditTitle(activeNote.title);
    setEditDate(activeNote.date);
    setEditWeather(activeNote.weather || '晴 ☀️');
    setEditMood(getMoodDetails(activeNote.mood).value);
    setEditCategory(activeNote.category);
    setEditContent(activeNote.content);
    setEditTagsText((activeNote.tags || []).join(', '));
    
    if (activeNote.category === '流水账') {
      const parsed = parseChronicleContent(activeNote.content);
      setChronicleSleep(parsed.sleep);
      setChronicleDiet(parsed.diet);
      setChronicleWork(parsed.work);
      setChronicleRead(parsed.read);
      setChronicleKnowledge(parsed.knowledge);
      setChronicleInspiration(parsed.inspiration);
    } else {
      setChronicleSleep('');
      setChronicleDiet('');
      setChronicleWork('');
      setChronicleRead('');
      setChronicleKnowledge('');
      setChronicleInspiration('');
    }
    
    setIsEditing(true);
    setIsPreview(false);
  };

  // Start Creating New Blank Note
  const startCreatingNew = () => {
    setEditTitle('');
    setEditDate(new Date().toISOString().substring(0, 10));
    setEditWeather('晴 ☀️');
    setEditMood('平和');
    setEditCategory('日常');
    setEditContent('');
    setEditTagsText('');
    setChronicleSleep('');
    setChronicleDiet('');
    setChronicleWork('');
    setChronicleRead('');
    setChronicleKnowledge('');
    setChronicleInspiration('');
    setSelectedNoteId(null);
    setIsEditing(true);
    setIsPreview(false);
  };

  const startCreatingNewWithDate = (dateStr: string) => {
    setEditTitle('');
    setEditDate(dateStr);
    setEditWeather('晴 ☀️');
    setEditMood('平和');
    setEditCategory('日常');
    setEditContent('');
    setEditTagsText('');
    setChronicleSleep('');
    setChronicleDiet('');
    setChronicleWork('');
    setChronicleRead('');
    setChronicleKnowledge('');
    setChronicleInspiration('');
    setSelectedNoteId(null);
    setIsEditing(true);
    setIsPreview(false);
  };

  // Dedicated creator for "流水账" entries
  const startCreatingChronicle = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    setEditTitle(`${todayStr} 事实流水日记账 📋`);
    setEditDate(todayStr);
    setEditWeather('晴 ☀️');
    setEditMood('平和');
    setEditCategory('流水账');
    setEditTagsText('事实流水账, 极客观, 克制');
    setChronicleSleep('');
    setChronicleDiet('');
    setChronicleWork('');
    setChronicleRead('');
    setChronicleKnowledge('');
    setChronicleInspiration('');
    setEditContent('');
    setSelectedNoteId(null);
    setIsEditing(true);
    setIsPreview(false);
  };

  // Rich text toolbar helpers
  const insertMarkdown = (before: string, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = editContent.slice(start, end);
    const newContent = editContent.slice(0, start) + before + selected + after + editContent.slice(end);
    setEditContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('图片不超过 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const ta = textareaRef.current;
      const pos = ta ? ta.selectionStart : editContent.length;
      const insertion = `\n![图片](${src})\n`;
      setEditContent(editContent.slice(0, pos) + insertion + editContent.slice(pos));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save Note
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert('请填写标题和正文内容！');
      return;
    }

    const tagsArray = editTagsText
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const dataPayload = {
      title: editTitle.trim(),
      date: editDate,
      weather: editWeather,
      mood: editMood,
      category: editCategory,
      content: editContent.trim(),
      tags: tagsArray
    };

    if (selectedNoteId) {
      // Edit existing
      onUpdateDiary(selectedNoteId, dataPayload);
      setIsEditing(false);
      setIsPreview(false);
    } else {
      // Create new
      const generatedId = `note_${Date.now()}`;
      onAddDiary(dataPayload);
      setSelectedNoteId(generatedId);
      // Wait for state propagate or fallback selection
      setIsEditing(false);
      setIsPreview(false);
      // Select the newly added note by date/title match
      setTimeout(() => {
        // Fallback to highest index note
        if (diaryNotes.length > 0) {
          setSelectedNoteId(diaryNotes[diaryNotes.length - 1].id);
        }
      }, 50);
    }
  };

  // Filter notes
  const filteredNotes = diaryNotes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a,b) => b.date.localeCompare(a.date)); // descending date order

  // Force selection of first item if selected note was deleted or invalid
  React.useEffect(() => {
    if (!selectedNoteId && filteredNotes.length > 0 && !isEditing) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [diaryNotes, selectedNoteId, isEditing, filteredNotes]);

  const handleApplyInspiration = (title: string, promptText: string, category: string) => {
    setEditTitle(title);
    setEditDate(new Date().toISOString().substring(0, 10));
    setEditWeather('微风 🍃');
    setEditMood('专注');
    setEditCategory(category);
    setEditContent(promptText);
    setEditTagsText('今日灵感, 自我手账');
    setSelectedNoteId(null);
    setIsEditing(true);
    setIsPreview(false);
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      
      {/* Hand-made Planner Custom Workspace Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-[#d3cfc3] bg-[#fdfcf9] rounded-lg p-4 shadow-xxs">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-[#48453f] flex items-center gap-1.5 font-display">
            <span className="text-base">📔</span>
            <span>Jibun Techo 风格本 • Natasha 的自控灵感账坊</span>
          </h2>
          <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
            Jibun Techo 手账系统：记录过往心情日常、洞察趋势，并以随机胶囊灵感引导当下创作。
          </p>
        </div>

        {/* Dynamic Force Shuffler CTA button to trigger capsule shuffles */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => inspirationRef.current?.refresh()}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 hover:from-amber-600/20 hover:via-orange-500/15 hover:to-amber-500/15 border border-amber-300 hover:border-amber-400 text-amber-900 font-extrabold rounded text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xxs"
            title="点击此按钮，使下方灵感胶囊强制随机抽取并更新新的金句提示"
          >
            <span className="animate-spin text-amber-600 text-xs">⚡</span>
            <span>触发抽取新灵感</span>
          </button>
        </div>
      </div>
      
      {/* Weekly Mood Capsule (Lightbox Studio) */}
      <WeeklyMoodCapsule 
        diaryNotes={diaryNotes} 
        username={username} 
        isOpen={isCapsuleOpen} 
        onClose={() => setIsCapsuleOpen(false)} 
      />

      {/* Idea Capsule / Inspiration Capsule */}
      <InspirationCapsule ref={inspirationRef} onApplyPrompt={handleApplyInspiration} />

      {/* Mood Trend Analysis Card */}
      <MoodTrendAnalysis 
        diaryNotes={diaryNotes} 
        onOpenCapsule={() => setIsCapsuleOpen(true)} 
      />

      {/* Monthly Mood Calendar Grid Dashboard */}
      <MonthlyMoodCalendar 
        diaryNotes={diaryNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onStartNewWithDate={startCreatingNewWithDate}
        onOpenCapsule={() => setIsCapsuleOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* ================= LEFT SIDEBAR: NOTE LIST & SEARCH ================= */}
      <div className="lg:col-span-4 bg-white border-2 border-[#d3cfc3] rounded-lg p-4 shadow-sm flex flex-col max-h-[680px]">
        
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-[#eae6d8] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-techo-teal" />
            <h3 className="font-display font-black text-[#48453f] text-sm">随笔日记本</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={startCreatingNew}
              className="px-2 py-1 bg-techo-teal hover:bg-techo-teal/90 text-white rounded text-[10.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-all shadow-xxs"
              title="抒写一般带有主观情感或文字修饰的随笔感悟"
            >
              <Plus size={10} />
              写随笔
            </button>
            <button
              onClick={startCreatingChronicle}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-all shadow-xxs"
              title="客观记流水账（只记事实，不抒情，不抒发感触）"
            >
              <Plus size={10} />
              记流水账
            </button>
          </div>
        </div>

        {/* Searching input */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400 pointer-events-none">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="搜索任何日记、标签、感悟..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-7 pr-3 py-1.5 bg-[#fcfbf9] border border-[#cbd5e0] rounded focus:outline-none focus:border-techo-teal focus:ring-1 focus:ring-techo-teal"
            />
          </div>

          {/* Quick Categories list */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold select-none cursor-pointer transition-all ${
                selectedCategory === 'all'
                  ? 'bg-techo-teal text-white'
                  : 'bg-[#faf8f2] text-gray-500 border border-[#eae6d8] hover:bg-[#eae6d8]'
              }`}
            >
              全部 ({diaryNotes.length})
            </button>
            {categories.map(cat => {
              const count = diaryNotes.filter(n => n.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold select-none cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-techo-teal text-white'
                      : 'bg-[#faf8f2] text-gray-500 border border-[#eae6d8] hover:bg-[#eae6d8]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrolling Note List */}
        <div 
          className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-none"
          style={{ perspective: "1000px" }}
        >
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded bg-gray-50">
              <FileText size={24} className="mx-auto text-gray-350 mb-1" />
              <p className="text-xs text-gray-400">没有找到匹配的随记纸页</p>
            </div>
          ) : (
            filteredNotes.map((note, index) => {
              const isActive = note.id === selectedNoteId;
              return (
                <motion.div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  initial={{ opacity: 0, y: 24, rotateX: 6, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.05, margin: "0px 0px -15px 0px" }}
                  whileHover={{ 
                    y: -2, 
                    scale: 1.015,
                    rotateX: -1,
                    boxShadow: "0 8px 16px rgba(138, 129, 108, 0.06)" 
                  }}
                  whileTap={{ scale: 0.995, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 110, 
                    damping: 14, 
                    mass: 0.8,
                    delay: Math.min(index * 0.04, 0.2)
                  }}
                  className={`relative p-3 rounded border-2 cursor-pointer transition-all duration-300 origin-top [backface-visibility:hidden] ${
                    isActive 
                      ? 'bg-[#faf8ee] border-[#c4bead] shadow-xs' 
                      : 'bg-[#fdfdfc] border-transparent hover:bg-[#fafaf6] hover:border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)]'
                  }`}
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.75)), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
                    backgroundBlendMode: 'overlay',
                  }}
                >
                  {/* Category Pill Tag */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] bg-[#8a816c]/10 text-[#8a816c] font-black px-1.5 py-0.5 rounded">
                      {note.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-medium">
                      {note.date}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <h4 className="text-xs font-bold text-[#3c3830] tracking-wide mb-1 line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dashed border-[#efede5]">
                    {/* Weather & Mood preview */}
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                      <span className="bg-[#f0f4f8] text-[#555047] px-1.5 py-0.5 rounded border border-[#efede5] text-[9.5px]">
                        {note.weather || '晴 ☀️'}
                      </span>
                      {(() => {
                        const mDetails = getMoodDetails(note.mood);
                        return (
                          <span 
                            className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold flex items-center gap-0.5 transition-all ${mDetails.bgClass} ${mDetails.colorClass} ${mDetails.borderClass}`}
                            title={`心境: ${mDetails.label}`}
                          >
                            <span>{mDetails.emoji}</span>
                            <span>{mDetails.label}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Arrow sign */}
                    <ChevronRight size={10} className={isActive ? 'text-techo-teal' : 'text-gray-300'} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT FORM OR VIEW: NOTEBOOK PAGE ================= */}
      <div className="lg:col-span-8 bg-white border-2 border-[#d3cfc3] rounded-lg p-6 shadow-sm relative overflow-hidden min-h-[580px] flex flex-col">
        {/* Notebook binding effects (little dotted grid background inside the note area to resemble Jibun memo page) */}
        <div className="absolute top-0 bottom-0 left-0 w-3 flex flex-col justify-between py-6 -ml-1 border-r border-[#bebaaa]/20 bg-[#fdfdfb]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]/40 mx-auto shadow-inner" />
          ))}
        </div>

        <div className="pl-4 flex-1 flex flex-col relative">
          {isEditing ? (
            /* ============ EDITING OR WRITING MODE ============ */
            <form onSubmit={handleSave} className="flex-1 flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b pb-2.5 border-[#eae6d8]">
                <h3 className="font-display font-extrabold text-sm text-[#48453f] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-techo-pink" />
                  {selectedNoteId ? '修订随记纸页 (Edit note)' : '添写新随随笔 (New note)'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (!selectedNoteId && diaryNotes.length > 0) {
                        setSelectedNoteId(diaryNotes[0].id);
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded text-xs font-bold cursor-pointer transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#8a816c] text-white hover:bg-[#736a56] rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Save size={12} />
                    保存纸页
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#fbfaf6] p-3 border border-[#efede5] rounded">
                
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">📅 记录日期</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded focus:outline-none"
                    required
                  />
                </div>

                {/* Category selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">🏷️ 分类归档</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Weather */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">🌤️ 当日天气</label>
                  <div className="flex gap-1 flex-wrap">
                    {weatherOptions.map(w => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setEditWeather(w)}
                        className={`text-[10px] px-2 py-1 rounded transition-all border font-bold ${
                          editWeather === w 
                            ? 'bg-techo-teal text-white border-techo-teal shadow-xxs' 
                            : 'bg-white text-gray-600 border-[#cbd5e1] hover:bg-gray-50'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8a816c] block flex items-center gap-1">
                    <span>🧘 情绪心境</span>
                    <span className="text-[9px] text-[#8a816c]/70 font-normal">(点击赋予多彩心情标签)</span>
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {moodPresets.map(preset => {
                      const isSelected = editMood === preset.value || editMood.includes(preset.value);
                      return (
                        <button
                          type="button"
                          key={preset.value}
                          onClick={() => setEditMood(preset.value)}
                          className={`text-[10px] px-2 py-1 select-none cursor-pointer rounded transition-all border font-bold flex items-center gap-1 active:scale-95 ${
                            isSelected 
                              ? `${preset.bgClass} ${preset.colorClass} ${preset.borderClass} shadow-xxs ring-1 ring-inset ring-[#bebaaa]/40 scale-[1.02]` 
                              : 'bg-white text-gray-600 border-[#cbd5e1] hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-[11px]">{preset.emoji}</span>
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Title & Tags */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8a816c]">✍️ 随笔/日记标题</label>
                  <input
                    type="text"
                    placeholder="给今天的心情起个名字..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs font-bold px-2 py-1.5 border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8a816c]">🏷️ 便捷标签 (英文圆角或中文逗号隔开)</label>
                  <input
                    type="text"
                    placeholder="例如: 育儿, 灵感, CF Workers"
                    value={editTagsText}
                    onChange={(e) => setEditTagsText(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal"
                  />
                </div>
              </div>

              {/* Free-form content writing block with lined design */}
              <div className="flex-1 flex flex-col space-y-1.5 min-h-[220px]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#8a816c] flex items-center gap-1.5 flex-wrap">
                    <span>📖 点阵格言/正文内容</span>
                    <span className="text-[9px] text-[#8a816c]/70 font-normal font-mono hidden sm:inline">(支持 Markdown 语法如 **加粗**, *斜体*, - 列表)</span>
                  </label>
                  
                  {/* PREVIEW TOGGLE BUTTON */}
                  <div className="flex items-center gap-1 bg-[#efede5] p-0.5 rounded-md text-[10px] font-bold border border-[#d6cfbe] select-none">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={`px-2.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all ${
                        !isPreview
                          ? 'bg-white text-[#3c3830] shadow-xxs font-black'
                          : 'text-[#6e685a] hover:bg-white/40'
                      }`}
                    >
                      <PenTool size={10} className="text-[#8a816c]" />
                      <span>写手稿</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={`px-2.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all ${
                        isPreview
                          ? 'bg-white text-[#3c3830] shadow-xxs font-black'
                          : 'text-[#6e685a] hover:bg-white/40'
                      }`}
                    >
                      <Eye size={10} className="text-[#8a816c]" />
                      <span>查看预览</span>
                    </button>
                  </div>
                </div>

                {!isPreview ? (
                  editCategory === '流水账' ? (
                    <div className="space-y-4 bg-amber-50/15 border border-[#eae6d8] p-4 rounded-md">
                      {/* Chronicle Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 睡眠 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5 selection:bg-amber-100">
                              <span>💤 睡眠：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：23:30睡...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'sleep' ? null : 'sleep')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'sleep' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>💤 睡眠事实模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.sleep.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleSleep(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleSleep}
                            onChange={(e) => setChronicleSleep(e.target.value)}
                            placeholder="记录入睡起床及中途醒苏事实"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['23:30睡，7:00醒', '00:00睡，6:30醒，中途无醒', '23:00睡，7:30起'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleSleep(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* 饮食 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5">
                              <span>🍱 饮食餐食：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：午饭自备...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'diet' ? null : 'diet')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'diet' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>🍱 饮食餐食模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.diet.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleDiet(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleDiet}
                            onChange={(e) => setChronicleDiet(e.target.value)}
                            placeholder="客观记下每日三餐饮食 facts"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['早餐全麦配燕麦，晚餐喝苹果粥', '午餐带自备便当，少糖少油极简餐', '全天2L温水，无多余零食添加'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleDiet(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* 工作 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5">
                              <span>💼 工作事实：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：写代码 3h...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'work' ? null : 'work')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'work' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>💼 工作进度模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.work.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleWork(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleWork}
                            onChange={(e) => setChronicleWork(e.target.value)}
                            placeholder="客观写明具体完成的工作任务事实"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['写代码 3h，处理Bug 2个，开会1h', '完成页面适配调试，整理开发需求草案', '撰写技术方案1篇，完成主流程重构'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleWork(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* 阅读 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5">
                              <span>📖 阅读读物：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：看了《长安的荔枝》...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'read' ? null : 'read')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'read' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>📖 阅读记录模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.read.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleRead(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleRead}
                            onChange={(e) => setChronicleRead(e.target.value)}
                            placeholder="看过的书籍、读物、学术文献 facts"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['看《长安的荔枝》相关论著30页', '看 React Native 新版更新日志2篇', '看了社科类科普书籍15页 facts'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleRead(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* 新知识 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5">
                              <span>💡 今日新知：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：荔枝古代用盐水...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'knowledge' ? null : 'knowledge')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'knowledge' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>💡 今日新知事实模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.knowledge.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleKnowledge(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleKnowledge}
                            onChange={(e) => setChronicleKnowledge(e.target.value)}
                            placeholder="今日新涉猎的客观科学/常识/要点"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['荔枝皮含有能使果肉氧化的单宁酶', 'React 19 Server component 渲染机制', '唐代驿路马匹极限一昼夜行约五百里'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleKnowledge(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* 灵感 */}
                        <div className="space-y-1 relative" onClick={(e) => { e.currentTarget.style.zIndex = '30'; }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-[#7c5e39] flex items-center gap-1.5">
                              <span>🔮 瞬间灵感：事实记录</span>
                              <span className="text-[9px] text-gray-400 font-normal font-sans hidden sm:inline">(例：小白猫故事...)</span>
                            </label>
                            
                            {/* POPUP DROPDOWN TRIGGER */}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActivePopoverField(activePopoverField === 'inspiration' ? null : 'inspiration')}
                                className="text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5 transition-all active:scale-95 shadow-xxs"
                              >
                                <span>📋</span>
                                <span>模版选择 ▾</span>
                              </button>
                              
                              {activePopoverField === 'inspiration' && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-300 rounded-md shadow-lg p-2 z-50 text-left space-y-1.5 animate-fadeIn">
                                  <div className="text-[10px] font-black text-[#5c4424] border-b border-stone-100 pb-1 flex items-center justify-between">
                                    <span>🔮 瞬间灵感事实模版</span>
                                    <span className="text-[8px] text-gray-400 font-normal">点击填充覆盖</span>
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {CHRONICLE_FIELD_TEMPLATES.inspiration.map(tpl => (
                                      <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => {
                                          setChronicleInspiration(tpl.text);
                                          setActivePopoverField(null);
                                        }}
                                        className="w-full text-left text-[10px] p-1.5 hover:bg-amber-50/60 rounded text-stone-700 leading-normal border border-transparent hover:border-amber-200 transition-all font-sans cursor-pointer block"
                                      >
                                        <div className="font-extrabold text-amber-800 text-[10px]">{tpl.name}</div>
                                        <div className="text-gray-500 text-[9px] truncate">{tpl.text}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={chronicleInspiration}
                            onChange={(e) => setChronicleInspiration(e.target.value)}
                            placeholder="闪现的创意或想法事实（不带个人感慨）"
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['写关于会说话的猫的小说故事开头', '做个纯事实客观无感触收据账单生成器', '设计极速极简离线小票样式主题图'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setChronicleInspiration(chip)}
                                className="text-[9.5px] px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-600 rounded transition-all cursor-pointer font-sans"
                                title="点击一键填入"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
 
                      {/* Buttons and Auditor */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-dashed border-stone-200/80 pt-3 mt-1">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setChronicleSleep('');
                              setChronicleDiet('');
                              setChronicleWork('');
                              setChronicleRead('');
                              setChronicleKnowledge('');
                              setChronicleInspiration('');
                              setEditContent('');
                            }}
                            className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-600 font-bold rounded text-[11px] cursor-pointer transition-all active:scale-95"
                          >
                            🧹 清空所有数据
                          </button>
                        </div>

                        {/* Audit Tracker */}
                        {(() => {
                          const fullText = [chronicleSleep, chronicleDiet, chronicleWork, chronicleRead, chronicleKnowledge, chronicleInspiration].join(' ');
                          const { purity } = getChronicleAudit(fullText);
                          return (
                            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md p-1.5 flex-1 justify-between shadow-xxs">
                              <div className="flex flex-col gap-0.5 justify-center flex-grow min-w-0">
                                <span className="text-[9px] font-black text-gray-500 leading-none">事实纯客观率: {purity}%</span>
                                <div className="w-full bg-gray-100 rounded-full h-1 mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      purity === 100 ? 'bg-emerald-500' : purity >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${purity}%` }}
                                  />
                                </div>
                              </div>
                              <div className="shrink-0">
                                {purity === 100 ? (
                                  <span className="text-[8.5px] px-1 bg-emerald-50 font-bold text-emerald-700 border border-emerald-200 rounded">
                                    ✓ 完美客观
                                  </span>
                                ) : (
                                  <span className="text-[8.5px] px-1 bg-rose-50 font-bold text-rose-600 border border-rose-200 rounded">
                                    ⚠️ 包含感性
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Warnings / Affirmations */}
                      {(() => {
                        const fullText = [chronicleSleep, chronicleDiet, chronicleWork, chronicleRead, chronicleKnowledge, chronicleInspiration].join(' ');
                        const { matches } = getChronicleAudit(fullText);
                        if (matches.length > 0) {
                          return (
                            <div className="bg-rose-50/50 border border-rose-200/70 text-rose-800 px-3 py-1.5 rounded text-[10px] leading-normal font-sans">
                              <div className="font-extrabold text-rose-900 mb-0.5">⚠️ 质检所提示：检测到主观感性词汇扣分</div>
                              <div className="text-rose-700">
                                账本含有形容词或感想：
                                {matches.map(m => (
                                  <span key={m} className="bg-rose-100 text-rose-900 border border-rose-300 rounded px-1 py-0.2 mx-0.5 text-[9.5px] font-black">
                                    "{m}"
                                  </span>
                                ))}
                                . 请牢记：流水账需要<strong>除却自我情感，纯粹理性记事</strong>。
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="bg-emerald-50/50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded text-[10px] font-medium leading-normal font-sans">
                            ✨ <strong>事实校准通过：</strong> 未见个人抒发与修饰词，完美保留了冰冷直观的真实日常！
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2 flex-grow flex flex-col">
                      {/* Rich text toolbar */}
                      <div className="flex items-center gap-1 flex-wrap bg-[#f9f8f4] border border-[#d6cfbe] rounded px-2 py-1">
                        {[
                          { label: 'B', title: '加粗', action: () => insertMarkdown('**', '**') },
                          { label: 'I', title: '斜体', action: () => insertMarkdown('*', '*') },
                          { label: 'H1', title: '一级标题', action: () => insertMarkdown('# ') },
                          { label: 'H2', title: '二级标题', action: () => insertMarkdown('## ') },
                          { label: '>', title: '引用', action: () => insertMarkdown('> ') },
                          { label: '—', title: '分割线', action: () => insertMarkdown('\n---\n') },
                          { label: '• ', title: '无序列表', action: () => insertMarkdown('- ') },
                        ].map(btn => (
                          <button key={btn.label} type="button" title={btn.title} onClick={btn.action}
                            className="px-2 py-0.5 text-[11px] font-bold rounded hover:bg-[#eae6d8] text-[#6e685a] transition-colors cursor-pointer">
                            {btn.label}
                          </button>
                        ))}
                        <div className="h-4 w-px bg-[#d6cfbe] mx-1" />
                        <label title="插入图片 (≤2MB)" className="px-2 py-0.5 text-[11px] font-bold rounded hover:bg-[#eae6d8] text-[#6e685a] transition-colors cursor-pointer flex items-center gap-1">
                          <span>🖼</span>
                          <span>图片</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                      <textarea
                        ref={textareaRef}
                        placeholder="写下今日的故事、开发随感、技术复盘或生活感悟..."
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full text-xs p-3 border border-[#cbd5e1] rounded focus:outline-none focus:ring-1 focus:ring-techo-teal leading-relaxed font-sans placeholder-gray-300 bg-[radial-gradient(#ebd0b9_1px,transparent_1px)] [background-size:16px_16px] bg-white resize-none font-medium"
                        style={{ minHeight: '180px' }}
                        required
                      />
                      <div className="bg-amber-50/40 border border-amber-200/60 rounded-md p-2.5 text-[11px] space-y-1.5 mt-2">
                        <div className="font-extrabold text-[#7c5e39] flex items-center gap-1">
                          <span>💡</span>
                          <span>想要套用极简流水账一键填充模版？</span>
                        </div>
                        <div className="text-gray-500 text-[10px] leading-snug">
                          点击下方任意模版，我们将自动切换分类并为您填入对应的极客观记录结构：
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCategory('流水账');
                              setChronicleSleep('23:30睡，7:00醒，中间醒过一次');
                              setChronicleDiet('早饭冲了一杯芝麻粉燕麦片，午饭自己带了三明治，晚饭回家煮了苹果粥');
                              setChronicleWork('找了三个选题，写了2000字，开了2小时会');
                              setChronicleRead('看了《长安的荔枝》30页，学到“荔枝转运”的历史细节');
                              setChronicleKnowledge('荔枝在古代要用盐水浸泡保鲜');
                              setChronicleInspiration('突然想到一个故事开头，关于一个会说话的猫');
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#7c5e39] font-bold rounded text-[10px] cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                          >
                            <span>💻</span>
                            <span>Natasha 工作日模版</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setEditCategory('流水账');
                              setChronicleSleep('00:15入睡，8:30自然醒，无中途醒转');
                              setChronicleDiet('早午餐吃煎蛋培根吐司配冰美式，晚餐在外面吃猪肚鸡火锅');
                              setChronicleWork('无正式业务，全天整理了书桌，洗涤并晾晒了衣服和被单');
                              setChronicleRead('阅读《长安的荔枝》后半部分约120页，完成整书阅读');
                              setChronicleKnowledge('荔枝转运采用双层密闭瓦罐，夹层内注入冰镇盐水保鲜阻绝空气');
                              setChronicleInspiration('用 WebGL 实景复原唐代荔枝运送古道的全流域地形沙盘');
                            }}
                            className="px-2 py-1 bg-[#f0f4f8] hover:bg-[#e1ebf5] border border-[#cbdceb] text-[#1e4a7a] font-bold rounded text-[10px] cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                          >
                            <span>🧘</span>
                            <span>极致闲暇周末模版</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditCategory('流水账');
                              setChronicleSleep('22:45入睡，6:15起床，无睡眠障碍，晨跑3公里');
                              setChronicleDiet('早餐全麦面包和温牛奶，午餐煎鸡胸肉配西蓝花，晚餐水煮虾和糙米饭');
                              setChronicleWork('完成常规工作周报，修订完了移动端页面兼容的几个微小样式布局');
                              setChronicleRead('阅读《终身成长》心智模型章节，看了约20页');
                              setChronicleKnowledge('大脑神经具有高度可塑性，通过刻意练习可使特定大脑皮层区域增厚');
                              setChronicleInspiration('在日记模块加入一个可以导出为精美物理账单小票的 SVG 渲染保存服务');
                            }}
                            className="px-2 py-1 bg-[#f0faf5] hover:bg-[#e1f5eb] border border-[#cbdcd3] text-[#1e7a4a] font-bold rounded text-[10px] cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                          >
                            <span>🏃</span>
                            <span>自律健康运动模版</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div 
                    className="flex-1 w-full p-4 border border-[#cbd5e1] rounded leading-relaxed bg-[#faf9f5] overflow-y-auto shadow-inner"
                    style={{ minHeight: '180px', maxHeight: '420px' }}
                  >
                    {editCategory === '流水账' ? (
                      renderCompiledReceipt(editContent, editDate, editWeather, editMood)
                    ) : (
                      renderMarkdown(editContent)
                    )}
                  </div>
                )}
              </div>

            </form>
          ) : activeNote ? (
            /* ============ READING VIEW MODE ============ */
            <div className="flex-1 flex flex-col relative text-[#423f38]">
              
              {/* Journal Title with Japanese Paper Top */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 border-[#eae6d8] gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] bg-techo-teal/10 text-techo-teal font-black px-2 py-0.5 rounded">
                      {activeNote.category}
                    </span>
                    <span className="text-gray-300 text-xs font-mono">|</span>
                    <span className="text-xs font-bold font-mono text-gray-500 block flex items-center gap-1">
                      <Calendar size={11} /> {activeNote.date}
                    </span>
                  </div>
                  <h2 className="font-display font-extrabold text-base text-[#3c3830] tracking-wide">
                    {activeNote.title}
                  </h2>
                </div>

                {/* Combined Action buttons & Interactive Switcher strip */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  
                  {/* Mood/Weather Quick Switcher Bar (极简手账风格) */}
                  <div className="flex items-center gap-1.5 bg-[#fbfaf6] border border-[#d6cfbe] px-2 py-1 rounded-md text-xs select-none shadow-xxs">
                    {/* Weather cycler */}
                    <button
                      onClick={() => {
                        const currentIndex = weatherOptions.indexOf(activeNote.weather || '晴 ☀️');
                        const nextIndex = (currentIndex + 1) % weatherOptions.length;
                        const nextWeather = weatherOptions[nextIndex];
                        onUpdateDiary(activeNote.id, { weather: nextWeather });
                      }}
                      title="快速切换天气 (D1 同步缓存)"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white hover:bg-techo-teal/5 border border-[#bebaaa]/40 hover:border-techo-teal/40 transition-all text-[#555047] cursor-pointer text-[10px] font-bold active:scale-95"
                    >
                      <span>{activeNote.weather || '晴 ☀️'}</span>
                    </button>

                    <div className="w-[1px] h-3 bg-[#eae6d8]" />

                    {/* Mood cycler */}
                    <button
                      onClick={() => {
                        const currentVal = getMoodDetails(activeNote.mood).value;
                        const currentIndex = moodPresets.findIndex(p => p.value === currentVal);
                        const nextIndex = (currentIndex + 1) % moodPresets.length;
                        const nextMoodClass = moodPresets[nextIndex];
                        onUpdateDiary(activeNote.id, { mood: nextMoodClass.value });
                      }}
                      title="快速点击循环切换记录心境"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-[#bebaaa]/40 hover:border-techo-pink/40 hover:bg-techo-pink/5 transition-all text-[#555047] cursor-pointer text-[10px] font-bold active:scale-95"
                    >
                      {(() => {
                        const mDetails = getMoodDetails(activeNote.mood);
                        return (
                          <span className="flex items-center gap-0.5">
                            <span>{mDetails.emoji}</span>
                            <span>{mDetails.label}</span>
                          </span>
                        );
                      })()}
                    </button>
                    
                    <span className="text-[8px] text-gray-400 font-bold scale-90 select-none ml-0.5 hidden xs:inline" title="直接点击图标或文字均可循环切换">
                      点击切
                    </span>
                  </div>

                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded p-1.5 animate-fadeIn">
                      <span className="text-[11px] font-extrabold text-rose-700 font-sans tracking-wide">
                        ⚠️ 确认撕下并抹除这篇日记（不可恢复）？
                      </span>
                      <button
                        onClick={() => {
                          onDeleteDiary(activeNote.id);
                          const index = diaryNotes.findIndex(n => n.id === activeNote.id);
                          const remainingNotes = diaryNotes.filter(n => n.id !== activeNote.id);
                          if (remainingNotes.length > 0) {
                            const nextSelectIndex = Math.min(index, remainingNotes.length - 1);
                            setSelectedNoteId(remainingNotes[nextSelectIndex].id);
                          } else {
                            setSelectedNoteId(null);
                          }
                          setShowDeleteConfirm(false);
                        }}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-black rounded cursor-pointer transition-all shadow-xxs active:scale-95"
                      >
                        确认撕下
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-750 text-[10.5px] font-bold rounded cursor-pointer transition-all shadow-xxs active:scale-95"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={startEditing}
                        className="px-2.5 py-1.5 bg-[#8a816c] hover:bg-[#736a56] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xxs"
                      >
                        <Edit size={11} />
                        修订
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                        }}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-rose-200"
                      >
                        <Trash2 size={11} />
                        撕下这一页
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Subbox (Weather, mood, tags) with direct clickable components */}
              <div className="flex flex-wrap items-center gap-4 bg-[#faf9f4] border border-[#efede5] rounded p-2.5 mb-4 text-xs select-none">
                {/* Clickable Weather label */}
                <button
                  onClick={() => {
                    const currentIndex = weatherOptions.indexOf(activeNote.weather || '晴 ☀️');
                    const nextIndex = (currentIndex + 1) % weatherOptions.length;
                    const nextWeather = weatherOptions[nextIndex];
                    onUpdateDiary(activeNote.id, { weather: nextWeather });
                  }}
                  title="点击循环切换当日天气"
                  className="flex items-center gap-1 text-[#555047] font-semibold hover:text-techo-teal transition-all cursor-pointer group bg-transparent border-none text-left p-0"
                >
                  <CloudSun size={13} className="text-[#a19a86] group-hover:scale-110 transition-transform duration-300" />
                  <span>天气:</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-[#efede5]/80 text-[11px] group-hover:border-techo-teal/30 group-hover:bg-[#f6faf8] transition-all font-bold">
                    {activeNote.weather || '未知'}
                  </span>
                </button>

                {/* Clickable Mood label */}
                <button
                  onClick={() => {
                    const currentVal = getMoodDetails(activeNote.mood).value;
                    const currentIndex = moodPresets.findIndex(p => p.value === currentVal);
                    const nextIndex = (currentIndex + 1) % moodPresets.length;
                    const nextMoodClass = moodPresets[nextIndex];
                    onUpdateDiary(activeNote.id, { mood: nextMoodClass.value });
                  }}
                  title="点击循环快速切换心境情绪"
                  className="flex items-center gap-1 text-[#555047] font-semibold hover:text-techo-pink transition-all cursor-pointer group bg-transparent border-none text-left p-0"
                >
                  <Smile size={13} className="text-[#a19a86] group-hover:scale-110 transition-transform duration-300" />
                  <span>心境:</span>
                  {(() => {
                    const mDetails = getMoodDetails(activeNote.mood);
                    return (
                      <span className={`px-2 py-0.5 rounded border text-[11.5px] font-bold flex items-center gap-0.5 transition-all shadow-xxs ${mDetails.bgClass} ${mDetails.colorClass} ${mDetails.borderClass} group-hover:opacity-90`}>
                        <span>{mDetails.emoji}</span>
                        <span>{mDetails.label}</span>
                      </span>
                    );
                  })()}
                </button>

                <div className="hidden xs:inline-block w-[1px] h-3.5 bg-[#efede5]" />

                {(activeNote.tags || []).length > 0 && (
                  <div className="flex items-center gap-1 text-[#555047] font-semibold flex-1">
                    <Tag size={12} className="text-[#a19a86]" />
                    <div className="flex flex-wrap gap-1">
                      {(activeNote.tags || []).map(tag => (
                        <span 
                          key={tag} 
                          className="bg-white text-[10px] text-techo-teal font-medium px-1.5 py-0.5 rounded border border-[#efede5]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Authentic lined / dotted grid paper diary content */}
              <div className="flex-1 bg-[radial-gradient(#eedcc5_1px,transparent_1px)] [background-size:16px_16px] bg-[#fbfdfa] border border-[#cbd5e0] rounded-md p-5 min-h-[280px] text-[#423f38] leading-relaxed text-xs shadow-inner overflow-y-auto">
                {activeNote.category === '流水账' ? (
                  renderCompiledReceipt(activeNote.content, activeNote.date, activeNote.weather || '晴 ☀️', activeNote.mood || '平和')
                ) : (
                  renderMarkdown(activeNote.content, highlightedHeadingId)
                )}
              </div>

              {/* Cute footnote inspired by Kokuyo */}
              <div className="mt-4 text-right">
                <span className="text-[10px] text-[#bcaba3] font-mono select-none">
                  📔 {activeNote.title.length + activeNote.content.length} characters • 爱与生活自由书写
                </span>
              </div>

              {/* Table of Contents Floating Widget (Jibun Techo stationery-style stick-on tab) */}
              {tocItems.length > 0 && (
                <div className="absolute right-0 top-36 z-20">
                  {!showTOC ? (
                    <button
                      type="button"
                      onClick={() => setShowTOC(true)}
                      className="bg-techo-teal hover:bg-techo-teal/90 text-white py-2.5 px-1.5 rounded-l-md shadow-md border border-r-0 border-techo-teal/30 flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95 hover:translate-x-[-2px] select-none"
                      title="展开目录大纲"
                    >
                      <BookOpen size={11} className="mb-0.5" />
                      <span className="text-[9px] font-black leading-tight">目</span>
                      <span className="text-[9px] font-black leading-tight">录</span>
                    </button>
                  ) : (
                    <div className="bg-[#fffdf8] border-2 border-techo-teal/20 rounded-l-md shadow-lg p-3 w-48 max-h-[260px] flex flex-col animate-in fade-in slide-in-from-right-4 duration-200 select-none">
                      <div className="flex items-center justify-between border-b border-[#eae6d8] pb-1.5 mb-2">
                        <span className="text-[10px] font-black text-[#555047] flex items-center gap-1.5">
                          <BookOpen size={11} className="text-techo-teal animate-pulse" />
                          段落大纲 (Index)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowTOC(false)}
                          className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          收起 ✕
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                        {tocItems.map((item) => {
                          const isHighlighted = highlightedHeadingId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleScrollToHeading(item.id)}
                              className={`w-full text-left text-[10.5px] py-1 border-b border-dashed border-[#eae6d8]/60 hover:bg-[#faf8f2] transition-colors flex items-start gap-1 cursor-pointer ${
                                item.level === 1 
                                  ? 'font-bold text-[#2e2b26] pl-0' 
                                  : item.level === 2 
                                    ? 'text-[#555047] pl-3.5' 
                                    : 'text-[#8a816c] pl-5'
                              } ${isHighlighted ? 'text-techo-teal font-black bg-techo-teal/5 px-1 rounded' : ''}`}
                            >
                              <span className="text-techo-teal/60 font-mono mt-0.5 shrink-0">
                                {item.level === 1 ? '•' : '└'}
                              </span>
                              <span className="truncate">{item.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* ============ NO NOTE SELECTED & NO CURRENT CREATION ============ */
            <div className="flex-1 flex flex-col justify-center items-center text-center p-10">
              <BookOpen size={48} className="text-gray-300 mb-2 animate-bounce" />
              <h3 className="font-display font-medium text-sm text-gray-600 mb-1">
                空白的随笔纸页
              </h3>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-4">
                欢迎开始写日记。您可以选择左侧的任何一篇过往的记录，或者立即点击“写一篇”按钮记录今天发生的事情、代码心路、以及灵感闪现。
              </p>
              <button
                onClick={startCreatingNew}
                className="px-4 py-1.5 bg-[#8a816c] text-white font-bold rounded hover:bg-[#736a56] text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xxs"
              >
                <Plus size={14} />
                在这里写下第一篇日记
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  </div>
);
}
