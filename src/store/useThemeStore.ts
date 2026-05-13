import { create } from 'zustand';
import {
  generateLightPalette,
  generateDarkPalette,
  calculateThemeScore,
  getHarmonyColors,
  BRAND_PERSONALITIES,
  type GeneratedPalette,
  type HarmonyMode,
  type BrandPersonality,
  type ThemeScore,
} from '@/lib/colorEngine';

// ─── Types ───────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';
export type DevicePreview = 'desktop' | 'tablet' | 'mobile';

// Color override keys the user can manually set
export interface ColorOverrides {
  textOnPrimary: string | null;  // Button text color
  text: string | null;           // Heading / primary text
  textSecondary: string | null;  // Secondary text
  secondary: string | null;      // Secondary brand color
  border: string | null;         // Border color
}

export interface ThemeTokens {
  mode: ThemeMode;
  primarySource: string;
  harmonyMode: HarmonyMode;
  brandPersonality: BrandPersonality;
  colorOverrides: ColorOverrides;
  lightPalette: GeneratedPalette;
  darkPalette: GeneratedPalette;
  harmonyColors: string[];
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
  score: ThemeScore;
}

export interface SavedPreset {
  id: string;
  name: string;
  primarySource: string;
  personality: BrandPersonality;
  timestamp: number;
}

interface ThemeState {
  tokens: ThemeTokens;
  logoSrc: string | null;
  logoDominantColors: string[];
  recentColors: string[];
  savedPresets: SavedPreset[];
  activePreviewSection: string;
  devicePreview: DevicePreview;
  sidebarOpen: boolean;

  // Actions
  setPrimaryColor: (hex: string) => void;
  setMode: (mode: ThemeMode) => void;
  setHarmonyMode: (mode: HarmonyMode) => void;
  setBrandPersonality: (personality: BrandPersonality) => void;
  setTypography: (fontFamily: string, headingFont: string) => void;
  setSpacing: (base: number) => void;
  setRadius: (global: number) => void;
  setShadows: (opacity: number, blur: number) => void;
  setColorOverride: (key: keyof ColorOverrides, value: string | null) => void;
  setLogoData: (src: string | null, colors: string[]) => void;
  savePreset: (name: string) => void;
  loadPreset: (preset: SavedPreset) => void;
  deletePreset: (id: string) => void;
  setActivePreviewSection: (section: string) => void;
  setDevicePreview: (device: DevicePreview) => void;
  toggleSidebar: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const EMPTY_OVERRIDES: ColorOverrides = {
  textOnPrimary: null,
  text: null,
  textSecondary: null,
  secondary: null,
  border: null,
};

function applyOverrides(palette: GeneratedPalette, overrides: ColorOverrides): void {
  if (overrides.textOnPrimary) palette.textOnPrimary = overrides.textOnPrimary;
  if (overrides.text) palette.text = overrides.text;
  if (overrides.textSecondary) palette.textSecondary = overrides.textSecondary;
  if (overrides.secondary) {
    palette.secondary = overrides.secondary;
    // Also update secondary hover to be slightly shifted
    palette.secondaryHover = overrides.secondary;
  }
  if (overrides.border) {
    palette.border = overrides.border;
    palette.borderHover = overrides.border;
  }
}

function buildTokens(
  primarySource: string,
  harmonyMode: HarmonyMode,
  personality: BrandPersonality,
  overrides?: {
    typography?: { fontFamily: string; headingFont: string };
    spacing?: { base: number };
    radius?: { global: number };
    shadows?: { opacity: number; blur: number };
    colorOverrides?: ColorOverrides;
  }
): Omit<ThemeTokens, 'mode'> {
  const config = BRAND_PERSONALITIES[personality];
  const lightPalette = generateLightPalette(primarySource);
  const darkPalette = generateDarkPalette(primarySource);
  const harmonyColors = getHarmonyColors(primarySource, harmonyMode);

  // Apply color overrides to both palettes
  const colorOvr = overrides?.colorOverrides ?? EMPTY_OVERRIDES;
  applyOverrides(lightPalette, colorOvr);
  applyOverrides(darkPalette, colorOvr);

  const score = calculateThemeScore(lightPalette);

  return {
    primarySource,
    harmonyMode,
    brandPersonality: personality,
    colorOverrides: colorOvr,
    lightPalette,
    darkPalette,
    harmonyColors,
    typography: overrides?.typography ?? {
      fontFamily: config.fontFamily,
      headingFont: config.headingFont,
    },
    spacing: overrides?.spacing ?? { base: config.spacingBase },
    radius: overrides?.radius ?? { global: Math.round(8 * config.radiusMultiplier) },
    shadows: overrides?.shadows ?? {
      opacity: config.shadowIntensity,
      blur: config.shadowBlur,
    },
    score,
  };
}

const DEFAULT_PRIMARY = '#6366f1';
const DEFAULT_PERSONALITY: BrandPersonality = 'modern';
const DEFAULT_HARMONY: HarmonyMode = 'analogous';

const initialTokens: ThemeTokens = {
  mode: 'light',
  ...buildTokens(DEFAULT_PRIMARY, DEFAULT_HARMONY, DEFAULT_PERSONALITY),
};

// Helper to get current overrides for rebuild
function getCurrentOverrides(state: ThemeState) {
  return {
    typography: state.tokens.typography,
    spacing: state.tokens.spacing,
    radius: state.tokens.radius,
    shadows: state.tokens.shadows,
    colorOverrides: state.tokens.colorOverrides,
  };
}

// ─── Store ───────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>((set, get) => ({
  tokens: initialTokens,
  logoSrc: null,
  logoDominantColors: [],
  recentColors: [],
  savedPresets: [],
  activePreviewSection: 'all',
  devicePreview: 'desktop',
  sidebarOpen: true,

  setPrimaryColor: (hex) => {
    const state = get();
    const newTokens = buildTokens(hex, state.tokens.harmonyMode, state.tokens.brandPersonality, getCurrentOverrides(state));
    const recentColors = [hex, ...state.recentColors.filter(c => c !== hex)].slice(0, 12);
    set({ tokens: { ...state.tokens, ...newTokens }, recentColors });
  },

  setMode: (mode) => set((state) => ({
    tokens: { ...state.tokens, mode },
  })),

  setHarmonyMode: (harmonyMode) => {
    const state = get();
    const newTokens = buildTokens(state.tokens.primarySource, harmonyMode, state.tokens.brandPersonality, getCurrentOverrides(state));
    set({ tokens: { ...state.tokens, ...newTokens } });
  },

  setBrandPersonality: (personality) => {
    const state = get();
    const newTokens = buildTokens(state.tokens.primarySource, state.tokens.harmonyMode, personality, {
      colorOverrides: state.tokens.colorOverrides,
    });
    set({ tokens: { ...state.tokens, ...newTokens } });
  },

  setTypography: (fontFamily, headingFont) => set((state) => ({
    tokens: { ...state.tokens, typography: { fontFamily, headingFont } },
  })),

  setSpacing: (base) => set((state) => ({
    tokens: { ...state.tokens, spacing: { base } },
  })),

  setRadius: (global) => set((state) => ({
    tokens: { ...state.tokens, radius: { global } },
  })),

  setShadows: (opacity, blur) => set((state) => ({
    tokens: { ...state.tokens, shadows: { opacity, blur } },
  })),

  setColorOverride: (key, value) => {
    const state = get();
    const newOverrides = { ...state.tokens.colorOverrides, [key]: value };
    const newTokens = buildTokens(state.tokens.primarySource, state.tokens.harmonyMode, state.tokens.brandPersonality, {
      ...getCurrentOverrides(state),
      colorOverrides: newOverrides,
    });
    set({ tokens: { ...state.tokens, ...newTokens } });
  },

  setLogoData: (src, colors) => set({
    logoSrc: src,
    logoDominantColors: colors,
  }),

  savePreset: (name) => {
    const state = get();
    const preset: SavedPreset = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      primarySource: state.tokens.primarySource,
      personality: state.tokens.brandPersonality,
      timestamp: Date.now(),
    };
    set({ savedPresets: [...state.savedPresets, preset] });
  },

  loadPreset: (preset) => {
    const state = get();
    const newTokens = buildTokens(preset.primarySource, state.tokens.harmonyMode, preset.personality, {
      colorOverrides: state.tokens.colorOverrides,
    });
    set({ tokens: { ...state.tokens, ...newTokens } });
  },

  deletePreset: (id) => set((state) => ({
    savedPresets: state.savedPresets.filter(p => p.id !== id),
  })),

  setActivePreviewSection: (section) => set({ activePreviewSection: section }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
