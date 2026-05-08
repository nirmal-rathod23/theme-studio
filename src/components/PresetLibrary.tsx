'use client';

import { useThemeStore } from '@/store/useThemeStore';
import styles from './EditorSidebar.module.css';

const PRESETS = {
  minimal: {
    name: 'Minimal',
    tokens: {
      lightColors: {
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#334155',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        border: '#e2e8f0',
      },
      darkColors: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
        accent: '#cbd5e1',
        background: '#020617',
        surface: '#0f172a',
        text: '#f8fafc',
        border: '#1e293b',
      },
      typography: { fontFamily: 'Inter', headingFont: 'Inter' },
      spacing: { base: 16 },
      radius: { global: 4 },
      shadows: { opacity: 0.05, blur: 5 }
    }
  },
  neon: {
    name: 'Neon Tech',
    tokens: {
      lightColors: {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#fdf2f8', 
        surface: '#fbcfe8',
        text: '#831843',
        border: '#f9a8d4',
      },
      darkColors: {
        primary: '#f472b6',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        background: '#030712',
        surface: '#111827',
        text: '#f9fafb',
        border: '#1f2937',
      },
      typography: { fontFamily: 'Fira Code', headingFont: 'Fira Code' },
      spacing: { base: 20 },
      radius: { global: 0 },
      shadows: { opacity: 0.5, blur: 20 }
    }
  }
};

export default function PresetLibrary() {
  const { updateTokens } = useThemeStore();

  const handleApply = (presetKey: keyof typeof PRESETS) => {
    updateTokens(PRESETS[presetKey].tokens as any);
  };

  return (
    <div className={styles.section}>
      <h3>Theme Presets</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(key => (
          <button 
            key={key} 
            className={styles.exportBtn}
            onClick={() => handleApply(key)}
          >
            {PRESETS[key].name}
          </button>
        ))}
      </div>
    </div>
  );
}
