'use client';

import { useState, useRef, useCallback } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { BRAND_PERSONALITIES, type BrandPersonality, type HarmonyMode, getContrastRatio, hexToHsl } from '@/lib/colorEngine';
import { extractDominantColors, selectBrandColor } from '@/lib/logoAnalyzer';
import FontSelect from './FontSelect';
import type { ColorOverrides, DevicePreview } from '@/store/useThemeStore';
import s from './Sidebar.module.css';

const HARMONY_MODES: { key: HarmonyMode; label: string }[] = [
  { key: 'analogous', label: 'Analogous' },
  { key: 'complementary', label: 'Complement' },
  { key: 'triadic', label: 'Triadic' },
  { key: 'split-complementary', label: 'Split' },
  { key: 'monochromatic', label: 'Mono' },
];



const PREVIEW_SECTIONS = [
  { key: 'all', label: 'All Components' },
  { key: 'hero', label: 'Hero' },
  { key: 'navbar', label: 'Navbar' },
  { key: 'cards', label: 'Cards' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'forms', label: 'Forms' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'blog', label: 'Blog' },
  { key: 'footer', label: 'Footer' },
];

const DEVICE_OPTIONS: { key: DevicePreview; label: string; icon: string }[] = [
  { key: 'desktop', label: 'Desktop', icon: '🖥' },
  { key: 'tablet', label: 'Tablet', icon: '📱' },
  { key: 'mobile', label: 'Mobile', icon: '📲' },
];

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={s.section}>
      <button className={s.sectionHeader} onClick={() => setOpen(!open)}>
        <span className={s.sectionTitle}>{title}</span>
        <span className={`${s.sectionChevron} ${open ? s.open : ''}`}>▾</span>
      </button>
      {open && <div className={s.sectionContent}>{children}</div>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy} title="Copy">
      {copied ? '✓' : '⎘'}
    </button>
  );
}

// Reusable color override row
function ColorOverrideRow({
  label,
  overrideKey,
  currentValue,
  isOverridden,
}: {
  label: string;
  overrideKey: keyof ColorOverrides;
  currentValue: string;
  isOverridden: boolean;
}) {
  const { setColorOverride } = useThemeStore();
  return (
    <div className={s.controlGroup}>
      <div className={s.controlLabel}>
        {label}
        <span className={s.controlLabelValue}>{isOverridden ? 'Manual' : 'Auto'}</span>
      </div>
      <div className={s.colorInputRow}>
        <div className={s.colorSwatch} style={{ background: currentValue }}>
          <input type="color" value={currentValue} onChange={(e) => setColorOverride(overrideKey, e.target.value)} />
        </div>
        <input className={s.colorHexInput} value={currentValue} readOnly style={{ opacity: 0.7 }} />
        {isOverridden ? (
          <button className={s.copyBtn} onClick={() => setColorOverride(overrideKey, null)} title="Reset to Auto" style={{ fontSize: '0.65rem' }}>↺</button>
        ) : (
          <CopyButton text={currentValue} />
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const {
    tokens, logoSrc, logoDominantColors, recentColors, savedPresets, activePreviewSection,
    devicePreview, sidebarOpen,
    setPrimaryColor, setMode, setHarmonyMode, setBrandPersonality,
    setTypography, setSpacing, setRadius, setShadows,
    setLogoData, savePreset, loadPreset, deletePreset,
    setActivePreviewSection, setDevicePreview, toggleSidebar,
  } = useThemeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetName, setPresetName] = useState('');
  const [hexInput, setHexInput] = useState(tokens.primarySource);

  // Keep hexInput in sync when primary changes externally
  const lastPrimary = useRef(tokens.primarySource);
  if (lastPrimary.current !== tokens.primarySource) {
    lastPrimary.current = tokens.primarySource;
    setHexInput(tokens.primarySource);
  }

  const applyHexInput = () => {
    if (/^#[0-9a-f]{6}$/i.test(hexInput)) {
      setPrimaryColor(hexInput);
    } else {
      setHexInput(tokens.primarySource);
    }
  };

  const palette = tokens.mode === 'dark' ? tokens.darkPalette : tokens.lightPalette;
  const ovr = tokens.colorOverrides;

  // Logo upload handler
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const colors = extractDominantColors(img, 6);
        const brandColor = selectBrandColor(colors);
        setLogoData(src, colors);
        setPrimaryColor(brandColor);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [setLogoData, setPrimaryColor]);

  // Export handler
  const handleExport = (format: 'json' | 'css' | 'tailwind') => {
    let content = '', filename = '';
    const lp = tokens.lightPalette;
    const dp = tokens.darkPalette;
    const typo = tokens.typography;
    const sp = tokens.spacing.base;
    const rad = tokens.radius.global;
    const shOp = tokens.shadows.opacity;
    const shBl = tokens.shadows.blur;

    if (format === 'json') {
      const payload = {
        _meta: {
          generator: 'Theme Studio v1.0',
          primarySource: tokens.primarySource,
          personality: tokens.brandPersonality,
          harmonyMode: tokens.harmonyMode,
          exportedAt: new Date().toISOString(),
        },
        light: {
          colors: {
            primary: { DEFAULT: lp.primary, hover: lp.primaryHover, active: lp.primaryActive, muted: lp.primaryMuted },
            secondary: { DEFAULT: lp.secondary, hover: lp.secondaryHover },
            accent: { DEFAULT: lp.accent, hover: lp.accentHover },
            background: lp.background,
            surface: { DEFAULT: lp.surface, hover: lp.surfaceHover },
            text: { DEFAULT: lp.text, secondary: lp.textSecondary, muted: lp.textMuted, onPrimary: lp.textOnPrimary },
            border: { DEFAULT: lp.border, hover: lp.borderHover },
            ring: lp.ring,
            disabled: { DEFAULT: lp.disabled, text: lp.disabledText },
            success: { DEFAULT: lp.success, bg: lp.successBg },
            warning: { DEFAULT: lp.warning, bg: lp.warningBg },
            error: { DEFAULT: lp.error, bg: lp.errorBg },
            info: { DEFAULT: lp.info, bg: lp.infoBg },
          },
          gradient: lp.gradient,
          gradientSubtle: lp.gradientSubtle,
        },
        dark: {
          colors: {
            primary: { DEFAULT: dp.primary, hover: dp.primaryHover, active: dp.primaryActive, muted: dp.primaryMuted },
            secondary: { DEFAULT: dp.secondary, hover: dp.secondaryHover },
            accent: { DEFAULT: dp.accent, hover: dp.accentHover },
            background: dp.background,
            surface: { DEFAULT: dp.surface, hover: dp.surfaceHover },
            text: { DEFAULT: dp.text, secondary: dp.textSecondary, muted: dp.textMuted, onPrimary: dp.textOnPrimary },
            border: { DEFAULT: dp.border, hover: dp.borderHover },
            ring: dp.ring,
            disabled: { DEFAULT: dp.disabled, text: dp.disabledText },
            success: { DEFAULT: dp.success, bg: dp.successBg },
            warning: { DEFAULT: dp.warning, bg: dp.warningBg },
            error: { DEFAULT: dp.error, bg: dp.errorBg },
            info: { DEFAULT: dp.info, bg: dp.infoBg },
          },
          gradient: dp.gradient,
          gradientSubtle: dp.gradientSubtle,
        },
        typography: {
          fontFamily: { sans: `'${typo.fontFamily}', sans-serif`, heading: `'${typo.headingFont}', sans-serif` },
        },
        spacing: { base: sp, xs: sp * 0.25, sm: sp * 0.5, md: sp, lg: sp * 1.5, xl: sp * 2, '2xl': sp * 3 },
        borderRadius: { none: '0px', sm: `${Math.round(rad * 0.5)}px`, DEFAULT: `${rad}px`, md: `${Math.round(rad * 1.25)}px`, lg: `${Math.round(rad * 1.5)}px`, xl: `${Math.round(rad * 2)}px`, full: '9999px' },
        boxShadow: {
          sm: `0 1px ${Math.round(shBl * 0.25)}px rgba(0,0,0,${shOp * 0.5})`,
          DEFAULT: `0 2px ${shBl}px rgba(0,0,0,${shOp})`,
          md: `0 4px ${Math.round(shBl * 1.5)}px rgba(0,0,0,${shOp})`,
          lg: `0 8px ${Math.round(shBl * 2)}px rgba(0,0,0,${shOp * 1.5})`,
          xl: `0 16px ${Math.round(shBl * 3)}px rgba(0,0,0,${shOp * 2})`,
        },
      };
      content = JSON.stringify(payload, null, 2);
      filename = 'theme-tokens.json';

    } else if (format === 'css') {
      const mapVars = (p: typeof lp, prefix = '') => [
        `  --color-primary: ${p.primary};`,
        `  --color-primary-hover: ${p.primaryHover};`,
        `  --color-primary-active: ${p.primaryActive};`,
        `  --color-primary-muted: ${p.primaryMuted};`,
        `  --color-secondary: ${p.secondary};`,
        `  --color-secondary-hover: ${p.secondaryHover};`,
        `  --color-accent: ${p.accent};`,
        `  --color-accent-hover: ${p.accentHover};`,
        `  --color-background: ${p.background};`,
        `  --color-surface: ${p.surface};`,
        `  --color-surface-hover: ${p.surfaceHover};`,
        `  --color-text: ${p.text};`,
        `  --color-text-secondary: ${p.textSecondary};`,
        `  --color-text-muted: ${p.textMuted};`,
        `  --color-text-on-primary: ${p.textOnPrimary};`,
        `  --color-border: ${p.border};`,
        `  --color-border-hover: ${p.borderHover};`,
        `  --color-ring: ${p.ring};`,
        `  --color-disabled: ${p.disabled};`,
        `  --color-disabled-text: ${p.disabledText};`,
        `  --color-success: ${p.success};`,
        `  --color-success-bg: ${p.successBg};`,
        `  --color-warning: ${p.warning};`,
        `  --color-warning-bg: ${p.warningBg};`,
        `  --color-error: ${p.error};`,
        `  --color-error-bg: ${p.errorBg};`,
        `  --color-info: ${p.info};`,
        `  --color-info-bg: ${p.infoBg};`,
        `  --gradient-primary: ${p.gradient};`,
        `  --gradient-subtle: ${p.gradientSubtle};`,
      ].join('\n');
      content = `/* Theme Studio v1.0 — Generated ${new Date().toISOString()} */\n\n`
        + `/* ─── Typography ──────────────── */\n`
        + `@import url('https://fonts.googleapis.com/css2?family=${typo.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&family=${typo.headingFont.replace(/ /g, '+')}:wght@400;600;700;800&display=swap');\n\n`
        + `:root {\n`
        + `  /* Typography */\n`
        + `  --font-sans: '${typo.fontFamily}', system-ui, sans-serif;\n`
        + `  --font-heading: '${typo.headingFont}', system-ui, sans-serif;\n\n`
        + `  /* Spacing */\n`
        + `  --spacing-xs: ${sp * 0.25}px;\n`
        + `  --spacing-sm: ${sp * 0.5}px;\n`
        + `  --spacing-md: ${sp}px;\n`
        + `  --spacing-lg: ${sp * 1.5}px;\n`
        + `  --spacing-xl: ${sp * 2}px;\n`
        + `  --spacing-2xl: ${sp * 3}px;\n\n`
        + `  /* Border Radius */\n`
        + `  --radius-sm: ${Math.round(rad * 0.5)}px;\n`
        + `  --radius: ${rad}px;\n`
        + `  --radius-md: ${Math.round(rad * 1.25)}px;\n`
        + `  --radius-lg: ${Math.round(rad * 1.5)}px;\n`
        + `  --radius-xl: ${Math.round(rad * 2)}px;\n\n`
        + `  /* Shadows */\n`
        + `  --shadow-sm: 0 1px ${Math.round(shBl * 0.25)}px rgba(0,0,0,${shOp * 0.5});\n`
        + `  --shadow: 0 2px ${shBl}px rgba(0,0,0,${shOp});\n`
        + `  --shadow-md: 0 4px ${Math.round(shBl * 1.5)}px rgba(0,0,0,${shOp});\n`
        + `  --shadow-lg: 0 8px ${Math.round(shBl * 2)}px rgba(0,0,0,${(shOp * 1.5).toFixed(3)});\n\n`
        + `  /* Colors — Light Mode */\n`
        + mapVars(lp) + '\n'
        + `}\n\n`
        + `/* ─── Dark Mode ───────────────── */\n`
        + `[data-theme="dark"],\n.dark,\n@media (prefers-color-scheme: dark) {\n  :root {\n`
        + mapVars(dp).split('\n').map(l => '  ' + l).join('\n') + '\n'
        + `  }\n}`;
      filename = 'theme.css';

    } else {
      content = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${lp.primary}',
          hover: '${lp.primaryHover}',
          active: '${lp.primaryActive}',
          muted: '${lp.primaryMuted}',
        },
        secondary: {
          DEFAULT: '${lp.secondary}',
          hover: '${lp.secondaryHover}',
        },
        accent: {
          DEFAULT: '${lp.accent}',
          hover: '${lp.accentHover}',
        },
        background: '${lp.background}',
        surface: {
          DEFAULT: '${lp.surface}',
          hover: '${lp.surfaceHover}',
        },
        foreground: {
          DEFAULT: '${lp.text}',
          secondary: '${lp.textSecondary}',
          muted: '${lp.textMuted}',
          'on-primary': '${lp.textOnPrimary}',
        },
        border: {
          DEFAULT: '${lp.border}',
          hover: '${lp.borderHover}',
        },
        ring: '${lp.ring}',
        disabled: {
          DEFAULT: '${lp.disabled}',
          text: '${lp.disabledText}',
        },
        success: {
          DEFAULT: '${lp.success}',
          bg: '${lp.successBg}',
        },
        warning: {
          DEFAULT: '${lp.warning}',
          bg: '${lp.warningBg}',
        },
        error: {
          DEFAULT: '${lp.error}',
          bg: '${lp.errorBg}',
        },
        info: {
          DEFAULT: '${lp.info}',
          bg: '${lp.infoBg}',
        },

        /* ─── Dark Mode Overrides ─── */
        dark: {
          primary: {
            DEFAULT: '${dp.primary}',
            hover: '${dp.primaryHover}',
            active: '${dp.primaryActive}',
            muted: '${dp.primaryMuted}',
          },
          secondary: {
            DEFAULT: '${dp.secondary}',
            hover: '${dp.secondaryHover}',
          },
          accent: {
            DEFAULT: '${dp.accent}',
            hover: '${dp.accentHover}',
          },
          background: '${dp.background}',
          surface: {
            DEFAULT: '${dp.surface}',
            hover: '${dp.surfaceHover}',
          },
          foreground: {
            DEFAULT: '${dp.text}',
            secondary: '${dp.textSecondary}',
            muted: '${dp.textMuted}',
            'on-primary': '${dp.textOnPrimary}',
          },
          border: {
            DEFAULT: '${dp.border}',
            hover: '${dp.borderHover}',
          },
          ring: '${dp.ring}',
          success: {
            DEFAULT: '${dp.success}',
            bg: '${dp.successBg}',
          },
          warning: {
            DEFAULT: '${dp.warning}',
            bg: '${dp.warningBg}',
          },
          error: {
            DEFAULT: '${dp.error}',
            bg: '${dp.errorBg}',
          },
          info: {
            DEFAULT: '${dp.info}',
            bg: '${dp.infoBg}',
          },
        },
      },

      fontFamily: {
        sans: ["'${typo.fontFamily}'", 'system-ui', 'sans-serif'],
        heading: ["'${typo.headingFont}'", 'system-ui', 'sans-serif'],
      },

      spacing: {
        'xs': '${sp * 0.25}px',
        'sm': '${sp * 0.5}px',
        'md': '${sp}px',
        'lg': '${sp * 1.5}px',
        'xl': '${sp * 2}px',
        '2xl': '${sp * 3}px',
      },

      borderRadius: {
        'sm': '${Math.round(rad * 0.5)}px',
        DEFAULT: '${rad}px',
        'md': '${Math.round(rad * 1.25)}px',
        'lg': '${Math.round(rad * 1.5)}px',
        'xl': '${Math.round(rad * 2)}px',
      },

      boxShadow: {
        'sm': '0 1px ${Math.round(shBl * 0.25)}px rgba(0,0,0,${(shOp * 0.5).toFixed(3)})',
        DEFAULT: '0 2px ${shBl}px rgba(0,0,0,${shOp})',
        'md': '0 4px ${Math.round(shBl * 1.5)}px rgba(0,0,0,${shOp})',
        'lg': '0 8px ${Math.round(shBl * 2)}px rgba(0,0,0,${(shOp * 1.5).toFixed(3)})',
        'xl': '0 16px ${Math.round(shBl * 3)}px rgba(0,0,0,${(shOp * 2).toFixed(3)})',
      },
    },
  },
  plugins: [],
}`;
      filename = 'tailwind.config.js';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tokenEntries: [string, string][] = [
    ['Primary', palette.primary], ['Primary Hover', palette.primaryHover], ['Primary Muted', palette.primaryMuted],
    ['Secondary', palette.secondary], ['Accent', palette.accent],
    ['Background', palette.background], ['Surface', palette.surface],
    ['Text', palette.text], ['Text Secondary', palette.textSecondary], ['Text Muted', palette.textMuted],
    ['Border', palette.border], ['Border Hover', palette.borderHover],
    ['Success', palette.success], ['Warning', palette.warning], ['Error', palette.error], ['Info', palette.info],
    ['Disabled', palette.disabled], ['Ring', palette.ring],
  ];

  const bgTextContrast = getContrastRatio(palette.background, palette.text);
  const primaryContrast = getContrastRatio(palette.primary, palette.textOnPrimary);

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button className={s.hamburger} onClick={toggleSidebar} aria-label="Toggle sidebar">
        <span className={s.hamburgerIcon}>{sidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className={s.overlay} onClick={toggleSidebar} />}

      <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : s.sidebarClosed}`}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.logoMark}>
            <div className={s.logoIcon}>T</div>
            <span className={s.logoText}>Theme Studio</span>
            <span className={s.logoVersion}>v1.0</span>
          </div>
          <div className={s.modeToggle}>
            <button className={`${s.modeBtn} ${tokens.mode === 'light' ? s.active : ''}`} onClick={() => setMode('light')}>☀ Light</button>
            <button className={`${s.modeBtn} ${tokens.mode === 'dark' ? s.active : ''}`} onClick={() => setMode('dark')}>◑ Dark</button>
          </div>
        </div>

        <div className={s.scrollContainer}>
          {/* Primary Color */}
          <CollapsibleSection title="Brand Color" defaultOpen>
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Primary Color</div>
              <div className={s.colorInputRow}>
                <div className={s.colorSwatch} style={{ background: tokens.primarySource }}>
                  <input type="color" value={tokens.primarySource} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
                <input className={s.colorHexInput} value={hexInput} onChange={(e) => setHexInput(e.target.value)} onBlur={applyHexInput} onKeyDown={(e) => { if (e.key === 'Enter') applyHexInput(); }} />
                <CopyButton text={tokens.primarySource} />
              </div>
            </div>

            {/* Color Overrides */}
            <ColorOverrideRow label="Button Text" overrideKey="textOnPrimary" currentValue={palette.textOnPrimary} isOverridden={!!ovr.textOnPrimary} />
            <ColorOverrideRow label="Heading / Text" overrideKey="text" currentValue={palette.text} isOverridden={!!ovr.text} />
            <ColorOverrideRow label="Secondary Text" overrideKey="textSecondary" currentValue={palette.textSecondary} isOverridden={!!ovr.textSecondary} />
            <ColorOverrideRow label="Secondary Color" overrideKey="secondary" currentValue={palette.secondary} isOverridden={!!ovr.secondary} />
            <ColorOverrideRow label="Border Color" overrideKey="border" currentValue={palette.border} isOverridden={!!ovr.border} />

            {/* Harmony Mode */}
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Color Harmony</div>
              <div className={s.chipGrid}>
                {HARMONY_MODES.map(m => (
                  <button key={m.key} className={`${s.chip} ${tokens.harmonyMode === m.key ? s.active : ''}`} onClick={() => setHarmonyMode(m.key)}>{m.label}</button>
                ))}
              </div>
              <div className={s.harmonyRow}>
                {tokens.harmonyColors.map((c, i) => (
                  <div key={i} className={s.harmonySwatch} style={{ background: c }} onClick={() => setPrimaryColor(c)} title={c} />
                ))}
              </div>
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className={s.controlGroup}>
                <div className={s.controlLabel}>Recent</div>
                <div className={s.recentGrid}>
                  {recentColors.map((c, i) => (
                    <div key={i} className={s.recentSwatch} style={{ background: c }} onClick={() => setPrimaryColor(c)} title={c} />
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* Brand Personality */}
          <CollapsibleSection title="Brand Personality" defaultOpen>
            <div className={s.presetGrid}>
              {(Object.entries(BRAND_PERSONALITIES) as [BrandPersonality, typeof BRAND_PERSONALITIES[BrandPersonality]][]).map(([key, val]) => (
                <button key={key} className={`${s.presetCard} ${tokens.brandPersonality === key ? s.active : ''}`} onClick={() => setBrandPersonality(key)}>
                  <div className={s.presetName}>{val.label}</div>
                  <div className={s.presetDesc}>{val.description}</div>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Logo Upload */}
          <CollapsibleSection title="Logo Upload">
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleLogoUpload} />
            <div className={s.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <div className={s.uploadIcon}>🖼</div>
              <div className={s.uploadText}>Upload your logo</div>
              <div className={s.uploadSubtext}>PNG, SVG, JPG — auto-extract brand color</div>
            </div>
            {logoSrc && (
              <>
                <div className={s.logoPreviewGrid}>
                  <div className={s.logoPreviewBox} style={{ background: '#ffffff' }}>
                    <img src={logoSrc} alt="Logo on light" />
                    <span className={s.logoPreviewLabel} style={{ color: '#666' }}>Light</span>
                  </div>
                  <div className={s.logoPreviewBox} style={{ background: '#111' }}>
                    <img src={logoSrc} alt="Logo on dark" />
                    <span className={s.logoPreviewLabel} style={{ color: '#aaa' }}>Dark</span>
                  </div>
                  <div className={s.logoPreviewBox} style={{ background: palette.primary }}>
                    <img src={logoSrc} alt="Logo on primary" style={{ filter: 'brightness(0) invert(1)' }} />
                    <span className={s.logoPreviewLabel} style={{ color: 'rgba(255,255,255,0.6)' }}>Mono</span>
                  </div>
                  <div className={s.logoPreviewBox} style={{ background: palette.surface }}>
                    <img src={logoSrc} alt="Logo on surface" />
                    <span className={s.logoPreviewLabel} style={{ color: palette.textMuted }}>Surface</span>
                  </div>
                </div>
                {logoDominantColors.length > 0 && (
                  <div className={s.controlGroup} style={{ marginTop: 12 }}>
                    <div className={s.controlLabel}>Extracted Colors</div>
                    <div className={s.paletteRow}>
                      {logoDominantColors.map((c, i) => (
                        <div key={i} className={s.paletteSwatch} style={{ background: c }} onClick={() => setPrimaryColor(c)} title={c} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CollapsibleSection>

          {/* Token Panel */}
          <CollapsibleSection title="Design Tokens">
            <div className={s.paletteRow}>
              {[palette.primary, palette.secondary, palette.accent, palette.success, palette.warning, palette.error].map((c, i) => (
                <div key={i} className={s.paletteSwatch} style={{ background: c }} title={c} />
              ))}
            </div>
            <div className={s.tokenList}>
              {tokenEntries.map(([name, value]) => (
                <div key={name} className={s.tokenRow} onClick={() => navigator.clipboard.writeText(value)}>
                  <div className={s.tokenDot} style={{ background: value }} />
                  <span className={s.tokenName}>{name}</span>
                  <span className={s.tokenValue}>{value}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Accessibility */}
          <CollapsibleSection title="Accessibility">
            <div className={s.scoreCard}>
              <div className={s.scoreRow}>
                <span className={s.scoreLabel}>Theme Score</span>
                <span className={s.scoreValue} style={{ color: tokens.score.overall >= 70 ? 'var(--studio-success)' : tokens.score.overall >= 50 ? 'var(--studio-warning)' : 'var(--studio-error)' }}>{tokens.score.overall}/100</span>
              </div>
              <div className={s.scoreBar}><div className={s.scoreBarFill} style={{ width: `${tokens.score.overall}%`, background: tokens.score.overall >= 70 ? 'var(--studio-success)' : tokens.score.overall >= 50 ? 'var(--studio-warning)' : 'var(--studio-error)' }} /></div>
              {(['contrast', 'harmony', 'accessibility'] as const).map(k => (
                <div key={k} className={s.scoreRow}>
                  <span className={s.scoreLabel} style={{ textTransform: 'capitalize' }}>{k}</span>
                  <span className={s.scoreValue}>{tokens.score[k]}</span>
                </div>
              ))}
            </div>
            <div className={s.controlGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className={s.controlLabel} style={{ marginBottom: 0 }}>Text on Background</span>
                <span className={`${s.contrastBadge} ${bgTextContrast >= 4.5 ? s.contrastPass : s.contrastFail}`}>{bgTextContrast.toFixed(1)}:1 {bgTextContrast >= 4.5 ? '✓ AA' : '✗'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={s.controlLabel} style={{ marginBottom: 0 }}>Text on Primary</span>
                <span className={`${s.contrastBadge} ${primaryContrast >= 4.5 ? s.contrastPass : s.contrastFail}`}>{primaryContrast.toFixed(1)}:1 {primaryContrast >= 4.5 ? '✓ AA' : '✗'}</span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Typography */}
          <CollapsibleSection title="Typography">
            <FontSelect
              label="Body Font"
              value={tokens.typography.fontFamily}
              onChange={(font) => setTypography(font, tokens.typography.headingFont)}
            />
            <FontSelect
              label="Heading Font"
              value={tokens.typography.headingFont}
              onChange={(font) => setTypography(tokens.typography.fontFamily, font)}
            />
          </CollapsibleSection>

          {/* Spacing & Layout */}
          <CollapsibleSection title="Spacing & Effects">
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Base Spacing <span className={s.controlLabelValue}>{tokens.spacing.base}px</span></div>
              <input className={s.rangeSlider} type="range" min="8" max="32" step="2" value={tokens.spacing.base} onChange={(e) => setSpacing(Number(e.target.value))} />
            </div>
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Border Radius <span className={s.controlLabelValue}>{tokens.radius.global}px</span></div>
              <input className={s.rangeSlider} type="range" min="0" max="24" value={tokens.radius.global} onChange={(e) => setRadius(Number(e.target.value))} />
            </div>
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Shadow Opacity <span className={s.controlLabelValue}>{tokens.shadows.opacity}</span></div>
              <input className={s.rangeSlider} type="range" min="0" max="0.3" step="0.01" value={tokens.shadows.opacity} onChange={(e) => setShadows(Number(e.target.value), tokens.shadows.blur)} />
            </div>
            <div className={s.controlGroup}>
              <div className={s.controlLabel}>Shadow Blur <span className={s.controlLabelValue}>{tokens.shadows.blur}px</span></div>
              <input className={s.rangeSlider} type="range" min="0" max="40" value={tokens.shadows.blur} onChange={(e) => setShadows(tokens.shadows.opacity, Number(e.target.value))} />
            </div>
          </CollapsibleSection>

          {/* Device Preview */}
          <CollapsibleSection title="Device Preview" defaultOpen>
            <div className={s.chipGrid}>
              {DEVICE_OPTIONS.map(d => (
                <button key={d.key} className={`${s.chip} ${devicePreview === d.key ? s.active : ''}`} onClick={() => setDevicePreview(d.key)}>
                  {d.icon} {d.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Preview Sections */}
          <CollapsibleSection title="Component Preview">
            <div className={s.chipGrid}>
              {PREVIEW_SECTIONS.map(sec => (
                <button key={sec.key} className={`${s.chip} ${activePreviewSection === sec.key ? s.active : ''}`} onClick={() => setActivePreviewSection(sec.key)}>{sec.label}</button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Save Presets */}
          <CollapsibleSection title="Saved Presets">
            <div className={s.savePresetForm}>
              <input className={s.savePresetInput} placeholder="Preset name..." value={presetName} onChange={(e) => setPresetName(e.target.value)} />
              <button className={`${s.studioBtn} ${s.studioBtnPrimary}`} onClick={() => { if (presetName.trim()) { savePreset(presetName.trim()); setPresetName(''); } }}>Save</button>
            </div>
            {savedPresets.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {savedPresets.map(p => (
                  <div key={p.id} className={s.savedPresetRow} onClick={() => loadPreset(p)}>
                    <div className={s.savedPresetColor} style={{ background: p.primarySource }} />
                    <span className={s.savedPresetName}>{p.name}</span>
                    <button className={s.savedPresetDelete} onClick={(e) => { e.stopPropagation(); deletePreset(p.id); }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Export */}
          <CollapsibleSection title="Export Theme">
            <div className={s.exportGrid}>
              <button className={`${s.studioBtn} ${s.studioBtnOutline}`} onClick={() => handleExport('json')}>JSON</button>
              <button className={`${s.studioBtn} ${s.studioBtnOutline}`} onClick={() => handleExport('css')}>CSS</button>
              <button className={`${s.studioBtn} ${s.studioBtnOutline}`} onClick={() => handleExport('tailwind')}>Tailwind</button>
            </div>
          </CollapsibleSection>
        </div>
      </aside>
    </>
  );
}
