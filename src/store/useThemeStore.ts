import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface ThemeTokens {
  mode: ThemeMode;
  lightColors: ColorPalette;
  darkColors: ColorPalette;
  typography: {
    fontFamily: string;
    headingFont: string;
  };
  spacing: {
    base: number;
  };
  radius: {
    global: number;
  };
  shadows: {
    opacity: number;
    blur: number;
  };
}

const defaultTokens: ThemeTokens = {
  mode: 'light',
  lightColors: {
    primary: '#2563eb',
    secondary: '#475569',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    border: '#e2e8f0',
  },
  darkColors: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
  },
  spacing: {
    base: 16,
  },
  radius: {
    global: 8,
  },
  shadows: {
    opacity: 0.1,
    blur: 10,
  },
};

interface ThemeState {
  tokens: ThemeTokens;
  updateTokens: (newTokens: Partial<ThemeTokens>) => void;
  updateMode: (mode: ThemeMode) => void;
  updateColor: (mode: 'light' | 'dark', key: keyof ColorPalette, value: string) => void;
  updateTypography: (key: keyof ThemeTokens['typography'], value: string) => void;
  updateSpacing: (value: number) => void;
  updateRadius: (value: number) => void;
  updateShadows: (key: keyof ThemeTokens['shadows'], value: number) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  tokens: defaultTokens,
  updateTokens: (newTokens) => set((state) => ({ tokens: { ...state.tokens, ...newTokens } })),
  updateMode: (mode) => set((state) => ({ tokens: { ...state.tokens, mode } })),
  updateColor: (mode, key, value) => set((state) => {
    const targetColors = mode === 'dark' ? 'darkColors' : 'lightColors';
    return {
      tokens: {
        ...state.tokens,
        [targetColors]: {
          ...state.tokens[targetColors],
          [key]: value,
        }
      }
    };
  }),
  updateTypography: (key, value) => set((state) => ({
    tokens: {
      ...state.tokens,
      typography: {
        ...state.tokens.typography,
        [key]: value,
      }
    }
  })),
  updateSpacing: (value) => set((state) => ({
    tokens: { ...state.tokens, spacing: { ...state.tokens.spacing, base: value } }
  })),
  updateRadius: (value) => set((state) => ({
    tokens: { ...state.tokens, radius: { ...state.tokens.radius, global: value } }
  })),
  updateShadows: (key, value) => set((state) => ({
    tokens: { ...state.tokens, shadows: { ...state.tokens.shadows, [key]: value } }
  })),
}));
