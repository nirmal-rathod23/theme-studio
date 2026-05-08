'use client';

import { useThemeStore } from '@/store/useThemeStore';
import styles from './EditorSidebar.module.css';

export default function ExportPanel() {
  const { tokens } = useThemeStore();

  const handleExport = (format: 'json' | 'css' | 'tailwind') => {
    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(tokens, null, 2);
      filename = 'theme-tokens.json';
    } else if (format === 'css') {
      content = `
:root {
  --primary: ${tokens.lightColors.primary};
  --secondary: ${tokens.lightColors.secondary};
  --accent: ${tokens.lightColors.accent};
  --background: ${tokens.lightColors.background};
  --surface: ${tokens.lightColors.surface};
  --text: ${tokens.lightColors.text};
  --border: ${tokens.lightColors.border};
  --font-sans: '${tokens.typography.fontFamily}', sans-serif;
  --spacing-base: ${tokens.spacing.base}px;
  --radius-global: ${tokens.radius.global}px;
}

[data-theme="dark"] {
  --primary: ${tokens.darkColors.primary};
  --secondary: ${tokens.darkColors.secondary};
  --accent: ${tokens.darkColors.accent};
  --background: ${tokens.darkColors.background};
  --surface: ${tokens.darkColors.surface};
  --text: ${tokens.darkColors.text};
  --border: ${tokens.darkColors.border};
}
      `.trim();
      filename = 'theme.css';
    } else if (format === 'tailwind') {
      content = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      spacing: {
        base: 'var(--spacing-base)',
      },
      borderRadius: {
        global: 'var(--radius-global)',
      }
    }
  }
}
      `.trim();
      filename = 'tailwind.config.js';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.section}>
      <h3>Export Theme</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className={styles.exportBtn} onClick={() => handleExport('json')}>JSON</button>
        <button className={styles.exportBtn} onClick={() => handleExport('css')}>CSS</button>
        <button className={styles.exportBtn} onClick={() => handleExport('tailwind')}>Tailwind</button>
      </div>
    </div>
  );
}
