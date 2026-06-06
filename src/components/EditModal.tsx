/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function EditModal({ isOpen, onClose, title, children }: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-lg bg-[#fbfaf5] rounded-lg border-2 border-[#d3cfc3] shadow-xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stationery Header with perforations */}
        <div className="relative bg-[#f5f3e9] px-6 py-4 border-b-2 border-[#e5e2d6] flex items-center justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-around px-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#d5cfbe] -mt-1 shadow-inner" />
            ))}
          </div>
          <h3 className="font-display font-semibold text-[#48453f] flex items-center gap-2 text-md mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-techo-teal inline-block"></span>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-[#888375] hover:bg-[#eae6d8] hover:text-[#48453f] transition-all cursor-pointer"
            title="关闭 (Close)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form area */}
        <div className="p-6 overflow-y-auto max-h-[75vh] techo-grid-bg bg-[#fbfaf5]/60">
          {children}
        </div>
      </div>
    </div>
  );
}
