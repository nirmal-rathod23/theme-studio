'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GOOGLE_FONTS, FONT_CATEGORIES, preloadFont, type GoogleFont } from '@/lib/googleFonts';
import s from './FontSelect.module.css';

interface FontSelectProps {
  value: string;
  onChange: (fontName: string) => void;
  label: string;
}

export default function FontSelect({ value, onChange, label }: FontSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<GoogleFont['category'] | 'all'>('all');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered fonts
  const filtered = useMemo(() => {
    let fonts = GOOGLE_FONTS;
    if (activeCategory !== 'all') {
      fonts = fonts.filter(f => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      fonts = fonts.filter(f => f.name.toLowerCase().includes(q));
    }
    return fonts;
  }, [search, activeCategory]);

  // Reset highlight when filter changes
  useEffect(() => setHighlightIdx(-1), [filtered]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearch('');
    }
  }, [open]);

  // Preload fonts as they enter the viewport (lazy)
  const observedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!open || !listRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fontName = (entry.target as HTMLElement).dataset.font;
          if (fontName && !observedRef.current.has(fontName)) {
            observedRef.current.add(fontName);
            preloadFont(fontName);
          }
        }
      });
    }, { root: listRef.current, rootMargin: '100px' });

    const items = listRef.current.querySelectorAll('[data-font]');
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [open, filtered]);

  // Keyboard nav
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      const font = filtered[highlightIdx];
      if (font) {
        onChange(font.name);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [filtered, highlightIdx, onChange]);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  // Preload current font
  useEffect(() => { preloadFont(value); }, [value]);

  const categoryLabel = FONT_CATEGORIES.find(c =>
    GOOGLE_FONTS.find(f => f.name === value)?.category === c.key
  )?.label || '';

  return (
    <div className={s.fontSelect} ref={containerRef}>
      <div className={s.fontLabel}>{label}</div>

      {/* Trigger button */}
      <button
        className={s.fontTrigger}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={s.fontPreviewText} style={{ fontFamily: `'${value}', sans-serif` }}>
          {value}
        </span>
        <span className={s.fontCategory}>{categoryLabel}</span>
        <span className={`${s.fontChevron} ${open ? s.open : ''}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={s.dropdown}>
          {/* Search */}
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>⌕</span>
            <input
              ref={inputRef}
              className={s.searchInput}
              placeholder="Search fonts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <button className={s.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Category tabs */}
          <div className={s.categoryTabs}>
            <button
              className={`${s.catTab} ${activeCategory === 'all' ? s.active : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {FONT_CATEGORIES.map(c => (
              <button
                key={c.key}
                className={`${s.catTab} ${activeCategory === c.key ? s.active : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Font count */}
          <div className={s.fontCount}>
            {filtered.length} font{filtered.length !== 1 ? 's' : ''}
          </div>

          {/* Font list */}
          <div className={s.fontList} ref={listRef}>
            {filtered.length === 0 && (
              <div className={s.emptyState}>No fonts match &ldquo;{search}&rdquo;</div>
            )}
            {filtered.map((font, i) => (
              <button
                key={font.name}
                data-font={font.name}
                className={`${s.fontItem} ${font.name === value ? s.selected : ''} ${i === highlightIdx ? s.highlighted : ''}`}
                onClick={() => { onChange(font.name); setOpen(false); }}
                onMouseEnter={() => setHighlightIdx(i)}
              >
                <span
                  className={s.fontItemName}
                  style={{ fontFamily: `'${font.name}', ${font.category}` }}
                >
                  {font.name}
                </span>
                <span className={s.fontItemCategory}>{font.category}</span>
                {font.name === value && <span className={s.fontItemCheck}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
