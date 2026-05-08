'use client';

import { useThemeStore } from '@/store/useThemeStore';
import styles from './EditorSidebar.module.css';

// Helper to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper to calculate luminance
function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to calculate contrast ratio
function getContrastRatio(hex1: string, hex2: string) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export default function AccessibilityChecker() {
  const { tokens } = useThemeStore();
  const activeColors = tokens.mode === 'dark' ? tokens.darkColors : tokens.lightColors;

  const bgTextContrast = getContrastRatio(activeColors.background, activeColors.text);
  const surfaceTextContrast = getContrastRatio(activeColors.surface, activeColors.text);
  const primaryTextContrast = getContrastRatio(activeColors.primary, '#ffffff'); // Assuming white text on primary button

  const isBgPass = bgTextContrast >= 4.5;
  const isSurfacePass = surfaceTextContrast >= 4.5;
  const isPrimaryPass = primaryTextContrast >= 4.5;

  return (
    <div className={styles.section}>
      <h3>Accessibility (WCAG)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text)' }}>Text on Background</span>
          <span style={{ color: isBgPass ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
            {bgTextContrast.toFixed(1)}:1 {isBgPass ? '✓' : '✗'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text)' }}>Text on Surface</span>
          <span style={{ color: isSurfacePass ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
            {surfaceTextContrast.toFixed(1)}:1 {isSurfacePass ? '✓' : '✗'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text)' }}>White on Primary</span>
          <span style={{ color: isPrimaryPass ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
            {primaryTextContrast.toFixed(1)}:1 {isPrimaryPass ? '✓' : '✗'}
          </span>
        </div>
        
        {(!isBgPass || !isSurfacePass || !isPrimaryPass) && (
          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '4px', fontSize: '0.75rem' }}>
            Warning: Some color combinations fail the WCAG AA contrast ratio of 4.5:1.
          </div>
        )}
      </div>
    </div>
  );
}
