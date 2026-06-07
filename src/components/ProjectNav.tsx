/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

const PROJECTS = [
  { id: 'input-pipeline', emoji: '🔬', label: 'Input Pipeline', url: 'https://input-pipeline.pages.dev' },
  { id: 'writing-archive', emoji: '📝', label: 'Writing Archive', url: 'https://natasha-ielts-library.pages.dev' },
  { id: 'encounter',       emoji: '📖', label: 'Encounter',       url: 'https://encounter-app.pages.dev' },
  { id: 'techo',           emoji: '🗒️', label: 'Techo App',       url: 'https://techo-app.pages.dev' },
  { id: 'phd',             emoji: '🎓', label: 'PhD Toolkit',     url: 'https://phd-app-toolkit.pages.dev' },
];

const DOT_COLORS: Record<string, string> = {
  'input-pipeline':  '#60a5fa',
  'writing-archive': '#34d399',
  'encounter':       '#a78bfa',
  'techo':           '#f59e0b',
  'phd':             '#fb7185',
};

const CURRENT_COLORS: Record<string, string> = {
  'input-pipeline':  '#eff6ff',
  'writing-archive': '#ecfdf5',
  'encounter':       '#f5f3ff',
  'techo':           '#fffbeb',
  'phd':             '#fff1f2',
};

const CURRENT_TEXT: Record<string, string> = {
  'input-pipeline':  '#2563eb',
  'writing-archive': '#059669',
  'encounter':       '#7c3aed',
  'techo':           '#d97706',
  'phd':             '#e11d48',
};

interface Props {
  current: string;
}

export default function ProjectNav({ current }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentProject = PROJECTS.find(p => p.id === current);
  const dotColor = DOT_COLORS[current] || '#94a3b8';

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: 14, right: 16, zIndex: 9999, fontFamily: 'inherit' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 11px',
          background: '#1e293b', color: '#fff',
          borderRadius: 20, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,.22)',
          whiteSpace: 'nowrap', userSelect: 'none',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
        {currentProject?.emoji} {currentProject?.label}
        <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 14, padding: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          minWidth: 200,
        }}>
          {PROJECTS.map((p, i) => {
            const isCurrent = p.id === current;
            return (
              <React.Fragment key={p.id}>
                {i === 1 && (
                  <div style={{ height: 1, background: '#f1f5f9', margin: '4px 2px' }} />
                )}
                <a
                  href={p.url}
                  target={isCurrent ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', borderRadius: 9,
                    textDecoration: 'none',
                    color: isCurrent ? CURRENT_TEXT[p.id] : '#334155',
                    background: isCurrent ? CURRENT_COLORS[p.id] : 'transparent',
                    fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                    whiteSpace: 'nowrap',
                    pointerEvents: isCurrent ? 'none' : 'auto',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                  onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{p.emoji}</span>
                  {p.label}
                </a>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
