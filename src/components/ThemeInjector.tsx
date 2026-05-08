'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { useEffect } from 'react';

export default function ThemeInjector() {
  const { tokens } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (tokens.mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [tokens.mode]);

  // Load Google Font dynamically
  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${tokens.typography.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
    let link = document.getElementById('dynamic-font') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = fontUrl;
  }, [tokens.typography.fontFamily]);

  // Generate CSS dynamically
  const css = `
    :root {
      --primary: ${tokens.lightColors.primary};
      --secondary: ${tokens.lightColors.secondary};
      --accent: ${tokens.lightColors.accent};
      --background: ${tokens.lightColors.background};
      --surface: ${tokens.lightColors.surface};
      --text: ${tokens.lightColors.text};
      --border: ${tokens.lightColors.border};
      
      --font-sans: '${tokens.typography.fontFamily}', sans-serif;
      --font-heading: '${tokens.typography.headingFont}', sans-serif;
      
      --spacing-base: ${tokens.spacing.base}px;
      --radius-global: ${tokens.radius.global}px;
      
      --shadow-opacity: ${tokens.shadows.opacity};
      --shadow-blur: ${tokens.shadows.blur}px;
      --shadow-sm: 0 1px 2px 0 rgba(0,0,0,var(--shadow-opacity));
      --shadow-md: 0 4px var(--shadow-blur) -1px rgba(0,0,0,var(--shadow-opacity));
      --shadow-lg: 0 10px calc(var(--shadow-blur) * 1.5) -3px rgba(0,0,0,var(--shadow-opacity));
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
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
