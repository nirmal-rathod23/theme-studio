'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { useEffect } from 'react';
import type { GeneratedPalette } from '@/lib/colorEngine';

export default function ThemeInjector() {
  const { tokens } = useThemeStore();

  // Load Google Fonts dynamically
  useEffect(() => {
    const fonts = new Set([tokens.typography.fontFamily, tokens.typography.headingFont]);
    fonts.forEach(font => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
      const id = `dynamic-font-${font.replace(/\s/g, '-').toLowerCase()}`;
      let link = document.getElementById(id) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = fontUrl;
    });
  }, [tokens.typography.fontFamily, tokens.typography.headingFont]);

  const palette: GeneratedPalette = tokens.mode === 'dark' ? tokens.darkPalette : tokens.lightPalette;

  const css = `
    :root {
      --t-primary: ${palette.primary};
      --t-primary-hover: ${palette.primaryHover};
      --t-primary-active: ${palette.primaryActive};
      --t-primary-muted: ${palette.primaryMuted};
      --t-secondary: ${palette.secondary};
      --t-secondary-hover: ${palette.secondaryHover};
      --t-accent: ${palette.accent};
      --t-accent-hover: ${palette.accentHover};
      --t-background: ${palette.background};
      --t-surface: ${palette.surface};
      --t-surface-hover: ${palette.surfaceHover};
      --t-text: ${palette.text};
      --t-text-secondary: ${palette.textSecondary};
      --t-text-muted: ${palette.textMuted};
      --t-text-on-primary: ${palette.textOnPrimary};
      --t-border: ${palette.border};
      --t-border-hover: ${palette.borderHover};
      --t-ring: ${palette.ring};
      --t-disabled: ${palette.disabled};
      --t-disabled-text: ${palette.disabledText};
      --t-success: ${palette.success};
      --t-success-bg: ${palette.successBg};
      --t-warning: ${palette.warning};
      --t-warning-bg: ${palette.warningBg};
      --t-error: ${palette.error};
      --t-error-bg: ${palette.errorBg};
      --t-info: ${palette.info};
      --t-info-bg: ${palette.infoBg};
      --t-gradient: ${palette.gradient};
      --t-gradient-subtle: ${palette.gradientSubtle};
      --t-font: '${tokens.typography.fontFamily}', sans-serif;
      --t-font-heading: '${tokens.typography.headingFont}', sans-serif;
      --t-spacing: ${tokens.spacing.base}px;
      --t-radius: ${tokens.radius.global}px;
      --t-shadow-opacity: ${tokens.shadows.opacity};
      --t-shadow-blur: ${tokens.shadows.blur}px;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
