'use client';

import { useThemeStore } from '@/store/useThemeStore';
import ExportPanel from './ExportPanel';
import LogoExtractor from './LogoExtractor';
import AccessibilityChecker from './AccessibilityChecker';
import PresetLibrary from './PresetLibrary';
import styles from './EditorSidebar.module.css';

const FONTS = ['Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Fira Code'];

export default function EditorSidebar() {
  const { tokens, updateColor, updateTypography, updateSpacing, updateRadius, updateShadows, updateMode } = useThemeStore();

  const activeMode = tokens.mode === 'dark' ? 'dark' : 'light';
  const activeColors = tokens.mode === 'dark' ? tokens.darkColors : tokens.lightColors;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2>Theme Studio</h2>
        <select 
          value={tokens.mode} 
          onChange={(e) => updateMode(e.target.value as any)}
          className={styles.select}
        >
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
        </select>
      </div>
      
      <div className={styles.section}>
        <h3>Colors ({activeMode})</h3>
        {['primary', 'secondary', 'background', 'surface', 'text', 'border'].map((color) => (
          <div className={styles.controlGroup} key={color}>
            <label style={{ textTransform: 'capitalize' }}>{color}</label>
            <div className={styles.colorInputWrapper}>
              <input 
                type="color" 
                value={activeColors[color as keyof typeof activeColors]} 
                onChange={(e) => updateColor(activeMode, color as any, e.target.value)} 
              />
              <span>{activeColors[color as keyof typeof activeColors]}</span>
            </div>
          </div>
        ))}
      </div>

      <LogoExtractor />

      <div className={styles.section}>
        <h3>Typography</h3>
        <div className={styles.controlGroup}>
          <label>Font Family</label>
          <select 
            value={tokens.typography.fontFamily}
            onChange={(e) => updateTypography('fontFamily', e.target.value)}
            className={styles.select}
          >
            {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Spacing & Layout</h3>
        <div className={styles.controlGroup}>
          <label>Base Spacing ({tokens.spacing.base}px)</label>
          <input 
            type="range" 
            min="4" 
            max="32" 
            step="4"
            value={tokens.spacing.base} 
            onChange={(e) => updateSpacing(Number(e.target.value))} 
          />
        </div>
        <div className={styles.controlGroup}>
          <label>Global Radius ({tokens.radius.global}px)</label>
          <input 
            type="range" 
            min="0" 
            max="32" 
            value={tokens.radius.global} 
            onChange={(e) => updateRadius(Number(e.target.value))} 
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3>Shadows</h3>
        <div className={styles.controlGroup}>
          <label>Shadow Opacity ({tokens.shadows.opacity})</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={tokens.shadows.opacity} 
            onChange={(e) => updateShadows('opacity', Number(e.target.value))} 
          />
        </div>
        <div className={styles.controlGroup}>
          <label>Shadow Blur ({tokens.shadows.blur}px)</label>
          <input 
            type="range" 
            min="0" 
            max="40" 
            value={tokens.shadows.blur} 
            onChange={(e) => updateShadows('blur', Number(e.target.value))} 
          />
        </div>
      </div>

      <PresetLibrary />
      <AccessibilityChecker />
      <ExportPanel />
    </aside>
  );
}
