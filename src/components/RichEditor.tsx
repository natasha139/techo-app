/**
 * RichEditor — contentEditable rich text editor with:
 *   - Bold / Italic / Underline formatting
 *   - Image upload (resizable, base64)
 *   - Doc/PDF attachment (<=1MB, stored as base64 download link)
 *
 * No external library dependencies.
 * HTML is sanitized before rendering via sanitizeHtml().
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Bold, Italic, Underline, Link2, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { InboxAttachment } from '../types';

interface RichEditorProps {
  value: string;                        // HTML string
  onChange: (html: string) => void;
  attachments?: InboxAttachment[];
  onAttachmentsChange?: (list: InboxAttachment[]) => void;
  placeholder?: string;
  minHeight?: number;                   // px, default 80
}

const MAX_DOC_SIZE = 1 * 1024 * 1024;  // 1MB

// Allowed tags and attributes (whitelist-based sanitizer, no DOMPurify dep)
const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'div', 'span',
  'a', 'img', 'ul', 'ol', 'li',
]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'style', 'class', 'width', 'height']),
  span: new Set(['style']),
  p: new Set(['style']),
  div: new Set(['style']),
};

function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');

  function clean(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(false);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      // Keep text content of unknown tags (e.g. <font>)
      const frag = document.createDocumentFragment();
      el.childNodes.forEach(child => {
        const cleaned = clean(child);
        if (cleaned) frag.appendChild(cleaned);
      });
      return frag;
    }

    const newEl = document.createElement(tag);
    const allowed = ALLOWED_ATTRS[tag];
    if (allowed) {
      Array.from(el.attributes).forEach(attr => {
        if (!allowed.has(attr.name)) return;
        // Block javascript: URLs in href/src
        if ((attr.name === 'href' || attr.name === 'src') &&
            /^\s*javascript:/i.test(attr.value)) return;
        newEl.setAttribute(attr.name, attr.value);
      });
    }
    // Force safe target on links
    if (tag === 'a') {
      newEl.setAttribute('target', '_blank');
      newEl.setAttribute('rel', 'noopener noreferrer');
    }

    el.childNodes.forEach(child => {
      const cleaned = clean(child);
      if (cleaned) newEl.appendChild(cleaned);
    });
    return newEl;
  }

  const result = document.createDocumentFragment();
  doc.body.childNodes.forEach(child => {
    const cleaned = clean(child);
    if (cleaned) result.appendChild(cleaned);
  });
  const container = document.createElement('div');
  container.appendChild(result);
  return container.innerHTML;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export { sanitizeHtml };

export default function RichEditor({
  value,
  onChange,
  attachments = [],
  onAttachmentsChange,
  placeholder = '写点什么...',
  minHeight = 80,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // Sync external value into DOM only when not focused (avoids cursor jump)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || focused) return;
    const safe = sanitizeHtml(value ?? '');
    if (el.innerHTML !== safe) {
      el.innerHTML = safe;
    }
  }, [value, focused]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (el) onChange(el.innerHTML);
  }, [onChange]);

  function execCmd(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emitChange();
  }

  function handleLink() {
    const url = window.prompt('输入链接地址', 'https://');
    if (url && /^https?:\/\//i.test(url)) {
      execCmd('createLink', url);
    }
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  }

  function handleDocPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_SIZE) {
      alert(`文件超过1MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩后再上传`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUri = ev.target?.result as string;
      const att: InboxAttachment = {
        id: uid(), name: file.name, type: 'doc',
        mimeType: file.type, size: file.size, data: dataUri,
      };
      onAttachmentsChange?.([...attachments, att]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removeAttachment(id: string) {
    onAttachmentsChange?.(attachments.filter(a => a.id !== id));
  }

  const [isDragOver, setIsDragOver] = useState(false);

  function processImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUri = ev.target?.result as string;
      editorRef.current?.focus();
      const imgHtml = `<img src="${dataUri}" alt="${file.name.replace(/"/g, '')}" style="max-width:100%;height:auto;border-radius:4px;display:block;margin:4px 0;" class="rich-img" />`;
      document.execCommand('insertHTML', false, imgHtml);
      emitChange();
      const att: InboxAttachment = {
        id: uid(), name: file.name, type: 'image',
        mimeType: file.type, size: file.size, data: dataUri,
      };
      onAttachmentsChange?.([...attachments, att]);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (file) processImageFile(file);
  }

  const isEmpty = !value || value === '<br>' || value.trim() === '';

  return (
    <div className={`rounded border transition-all ${isDragOver ? 'border-amber-500 ring-2 ring-amber-300/60' : focused ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-[#c2bdae]'} bg-white overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#ebe7da] bg-[#faf8f3]">
        <ToolBtn title="加粗 (Cmd+B)" onClick={() => execCmd('bold')}><Bold size={12} /></ToolBtn>
        <ToolBtn title="斜体 (Cmd+I)" onClick={() => execCmd('italic')}><Italic size={12} /></ToolBtn>
        <ToolBtn title="下划线 (Cmd+U)" onClick={() => execCmd('underline')}><Underline size={12} /></ToolBtn>
        <div className="w-px h-3.5 bg-[#d6d0c4] mx-1" />
        <ToolBtn title="插入链接" onClick={handleLink}><Link2 size={12} /></ToolBtn>
        <ToolBtn title="上传图片" onClick={() => imageInputRef.current?.click()}><ImageIcon size={12} /></ToolBtn>
        <ToolBtn title="附加文档 (<=1MB)" onClick={() => docInputRef.current?.click()}><Paperclip size={12} /></ToolBtn>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" className="hidden" onChange={handleDocPick} />
      </div>

      {/* Editable area */}
      <div className="relative">
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-amber-50/80 border-2 border-dashed border-amber-400 rounded pointer-events-none">
            <span className="text-[11px] text-amber-600 font-medium">松开以插入图片</span>
          </div>
        )}
        {isEmpty && !focused && !isDragOver && (
          <div className="absolute inset-0 p-2 text-[11px] text-gray-400 pointer-events-none select-none leading-relaxed">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); emitChange(); }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{ minHeight }}
          className="p-2 text-xs text-[#3a3528] leading-relaxed outline-none"
        />
      </div>

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-2 pb-2 pt-1 border-t border-[#ebe7da] bg-[#fdfcf8]">
          {attachments.map(att => (
            <AttachChip key={att.id} att={att} onRemove={() => removeAttachment(att.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ onClick, title, children }: {
  onClick: () => void; title?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className="p-1 rounded text-[#6e685a] hover:bg-amber-100 hover:text-amber-800 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function AttachChip({ att, onRemove }: { att: InboxAttachment; onRemove: () => void; key?: string }) {
  const sizeLabel = att.size < 1024
    ? `${att.size}B`
    : att.size < 1024 * 1024
      ? `${(att.size / 1024).toFixed(0)}KB`
      : `${(att.size / 1024 / 1024).toFixed(1)}MB`;

  return (
    <div className="flex items-center gap-1 bg-[#f0ece2] border border-[#d6d0c4] rounded px-1.5 py-0.5 text-[10px] text-[#5a5548] max-w-[200px]">
      {att.type === 'image' ? <ImageIcon size={9} /> : <Paperclip size={9} />}
      <a
        href={att.data}
        download={att.name}
        title={att.name}
        className="truncate hover:underline cursor-pointer"
      >
        {att.name}
      </a>
      <span className="text-gray-400 shrink-0">({sizeLabel})</span>
      <button type="button" onClick={onRemove} className="ml-0.5 text-gray-400 hover:text-red-400 cursor-pointer shrink-0">
        <X size={9} />
      </button>
    </div>
  );
}
