/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { HabitTracker } from '../types';
import { Sparkles, TrendingUp, Info } from 'lucide-react';

interface HabitTrendChartProps {
  habits: HabitTracker[];
}

export default function HabitTrendChart({ habits = [] }: HabitTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  // Measure dynamic width of the card container to stay perfectly responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(Math.max(280, entry.contentRect.width));
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const data = useMemo(() => {
    const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
    return weekdays.map((day, idx) => {
      const total = habits.length;
      const done = habits.filter(h => h.history[idx] === true).length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        dayIndex: idx,
        dayName: `周${day}`,
        rate,
        done,
        total
      };
    });
  }, [habits]);

  // Dimensions of SVG inside the tracker area
  const height = 110;
  const padding = { top: 15, right: 15, bottom: 20, left: 30 };

  // Calculate D3 Scales
  const { xScale, yScale, linePath, areaPath, points } = useMemo(() => {
    const xScale = d3.scaleLinear()
      .domain([0, 6])
      .range([padding.left, containerWidth - padding.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - padding.bottom, padding.top]);

    // Create custom soft Monotone cubic splines
    const lineGenerator = d3.line<typeof data[0]>()
      .x(d => xScale(d.dayIndex))
      .y(d => yScale(d.rate))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area<typeof data[0]>()
      .x(d => xScale(d.dayIndex))
      .y0(height - padding.bottom)
      .y1(d => yScale(d.rate))
      .curve(d3.curveMonotoneX);

    const linePath = lineGenerator(data) || '';
    const areaPath = areaGenerator(data) || '';

    const points = data.map(d => ({
      ...d,
      cx: xScale(d.dayIndex),
      cy: yScale(d.rate)
    }));

    return { xScale, yScale, linePath, areaPath, points };
  }, [data, containerWidth]);

  // Calculate generic statistics
  const averageRate = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / data.length);
  }, [data]);

  return (
    <div 
      ref={containerRef}
      className="bg-[#fffdf9] border border-[#e4dfd3] p-3 rounded-md shadow-xxs mb-3 font-sans select-none relative overflow-hidden transition-all duration-150"
    >
      {/* Dynamic Hand-Drawn Notebook Lines overlay background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#4b8f8c 0.8px, transparent 0.8px)',
        backgroundSize: '8px 8px'
      }} />

      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-[#eae6d8]/60 relative z-10">
        <span className="text-[10.5px] font-bold text-[#5c5647] flex items-center gap-1">
          <TrendingUp size={13} className="text-techo-teal" />
          <span>本周打卡趋势波动 / Self-Discipline Rate</span>
        </span>
        <span className="text-[9.5px] font-mono text-techo-teal bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100 font-bold">
          周均完成率: {averageRate}%
        </span>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-5 text-[#a59d88] text-[10px] italic">
          暂无习惯打卡数据，添加习惯并打卡后将显示趋势折线图
        </div>
      ) : (
        <div className="relative">
          <svg width={containerWidth} height={height} className="overflow-visible block">
            <defs>
              {/* Soft visual watercolor gradient to map underneath the trend line */}
              <linearGradient id="habit-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-techo-teal, #4b8f8c)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--color-techo-teal, #4b8f8c)" stopOpacity={0.01} />
              </linearGradient>
              {/* Filter for subtle sketch-glow indicator */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Grid dashed reference lines (0%, 50%, 100%) */}
            {[0, 50, 100].map((val) => {
              const y = yScale(val);
              return (
                <g key={val} className="opacity-40">
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={containerWidth - padding.right}
                    y2={y}
                    stroke="#beb9ab"
                    strokeWidth={0.75}
                    strokeDasharray="2 3"
                  />
                  <text
                    x={padding.left - 5}
                    y={y + 3.5}
                    textAnchor="end"
                    className="font-mono text-[8px] fill-gray-400 font-medium"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Vertical column guides for weekdays (Monday to Sunday) */}
            {points.map((p, i) => {
              const x = xScale(i);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#efede5"
                  strokeWidth={1}
                  className="opacity-70"
                />
              );
            })}

            {/* Render Filled visual area below curves */}
            <path
              d={areaPath}
              fill="url(#habit-area-gradient)"
              className="transition-all duration-300 ease-out"
            />

            {/* Render majestic smooth D3 spline curve */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-techo-teal, #4b8f8c)"
              strokeWidth={2}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />

            {/* Drawing interactable data node points */}
            {points.map((p, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g 
                  key={i}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Invisible broad hitbox circle for super easy hover targeting */}
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={12}
                    fill="transparent"
                  />

                  {/* Pulsing circle on hover */}
                  {isHovered && (
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={7}
                      fill="var(--color-techo-teal, #4b8f8c)"
                      opacity={0.3}
                      className="animate-ping"
                    />
                  )}

                  {/* Clean stationery solid point center */}
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={isHovered ? 4.5 : 3.5}
                    fill={isHovered ? '#fff' : 'var(--color-techo-teal, #4b8f8c)'}
                    stroke="var(--color-techo-teal, #4b8f8c)"
                    strokeWidth={isHovered ? 3 : 1}
                    className="transition-all duration-150"
                  />

                  {/* Static tiny on-chart values at-a-glance (non-clashing offset) */}
                  <text
                    x={p.cx}
                    y={p.cy - 7}
                    textAnchor="middle"
                    className={`font-mono text-[8px] font-bold fill-gray-500 transition-opacity duration-150 ${
                      isHovered ? 'opacity-0' : 'opacity-82'
                    }`}
                  >
                    {p.rate}%
                  </text>
                </g>
              );
            })}

            {/* Axis day texts rendered under columns */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.cx}
                y={height - 6}
                textAnchor="middle"
                className={`font-sans text-[8.5px] font-medium transition-colors ${
                  hoveredIndex === i ? 'fill-techo-teal font-extrabold scale-105' : 'fill-[#7d755c]'
                }`}
              >
                {p.dayName}
              </text>
            ))}
          </svg>

          {/* Floating stationery-styled detailed Tooltip rendering */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div 
              style={{
                left: `${Math.min(containerWidth - 110, Math.max(10, points[hoveredIndex].cx - 50))}px`,
                top: `${Math.max(-10, points[hoveredIndex].cy - 48)}px`
              }}
              className="absolute pointer-events-none bg-white/95 backdrop-blur-xs border border-[#cbd5e1] rounded p-1.5 shadow-md flex flex-col scale-95 origin-bottom transition-all duration-150 text-[9px] leading-tight z-30 font-sans"
            >
              <div className="font-extrabold text-[#3a3528] flex items-center justify-between gap-1 mb-0.5">
                <span>{points[hoveredIndex].dayName} 打卡率</span>
                <span className="text-techo-teal text-[10px] font-bold">{points[hoveredIndex].rate}%</span>
              </div>
              <div className="text-gray-500 font-mono">
                完成 {points[hoveredIndex].done} / 总共 {points[hoveredIndex].total}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
