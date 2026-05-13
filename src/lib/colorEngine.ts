/**
 * Color Engine — The brain of Theme Studio
 * 
 * Generates an entire design system from a single primary brand color.
 * Uses HSL color space for intelligent manipulation.
 */

// ─── HSL Types ───────────────────────────────────────────────────────
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type HarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic';

export type BrandPersonality = 'modern' | 'luxury' | 'friendly' | 'enterprise' | 'playful' | 'minimal' | 'bold' | 'elegant' | 'tech';

// ─── Conversions ─────────────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function hexToHsl(hex: string): HSL {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex(v, v, v);
  }
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  
  return rgbToHex(r, g, b);
}

// ─── Color Manipulation ─────────────────────────────────────────────

function adjustHsl(hex: string, hDelta: number, sDelta: number, lDelta: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: ((hsl.h + hDelta) % 360 + 360) % 360,
    s: Math.max(0, Math.min(100, hsl.s + sDelta)),
    l: Math.max(0, Math.min(100, hsl.l + lDelta)),
  });
}

function setHsl(hex: string, overrides: Partial<HSL>): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: overrides.h ?? hsl.h,
    s: overrides.s ?? hsl.s,
    l: overrides.l ?? hsl.l,
  });
}

// Determine if a color is "warm" (red/orange/yellow spectrum)
export function isWarmColor(hex: string): boolean {
  const { h } = hexToHsl(hex);
  return (h >= 0 && h <= 60) || h >= 300;
}

// Determine if a color is very low saturation (grayscale-ish)
export function isNeutralColor(hex: string): boolean {
  const { s } = hexToHsl(hex);
  return s < 15;
}

// ─── Contrast & Accessibility ────────────────────────────────────────

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Get optimal text color (black or white) for a given background
// Uses a higher threshold (0.35) so mid-brightness brand colors default to white text
// which looks much better visually on primary buttons
export function getOptimalTextColor(bgHex: string): string {
  const lum = getLuminance(bgHex);
  return lum > 0.35 ? '#000000' : '#ffffff';
}

// ─── Harmony Modes ───────────────────────────────────────────────────

export function getHarmonyColors(primary: string, mode: HarmonyMode): string[] {
  const hsl = hexToHsl(primary);
  
  switch (mode) {
    case 'complementary':
      return [
        primary,
        hslToHex({ ...hsl, h: (hsl.h + 180) % 360 }),
      ];
    case 'analogous':
      return [
        hslToHex({ ...hsl, h: (hsl.h - 30 + 360) % 360 }),
        primary,
        hslToHex({ ...hsl, h: (hsl.h + 30) % 360 }),
      ];
    case 'triadic':
      return [
        primary,
        hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }),
      ];
    case 'split-complementary':
      return [
        primary,
        hslToHex({ ...hsl, h: (hsl.h + 150) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h + 210) % 360 }),
      ];
    case 'monochromatic':
      return [
        setHsl(primary, { l: Math.max(0, hsl.l - 20) }),
        primary,
        setHsl(primary, { l: Math.min(100, hsl.l + 20) }),
      ];
  }
}

// ─── Generate Full Palette from Primary ──────────────────────────────

export interface GeneratedPalette {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryMuted: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  borderHover: string;
  ring: string;
  disabled: string;
  disabledText: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  gradient: string;
  gradientSubtle: string;
}

export function generateLightPalette(primaryHex: string): GeneratedPalette {
  const hsl = hexToHsl(primaryHex);
  const warm = isWarmColor(primaryHex);
  
  // Use exact user-chosen color as primary (buttons, badges, etc.)
  const primary = primaryHex;
  
  // Derive a "working" version for calculating other palette tokens
  const workHsl = {
    h: hsl.h,
    s: Math.max(55, hsl.s),
    l: Math.max(35, Math.min(55, hsl.l)),
  };
  const pHsl = workHsl;
  
  // Secondary: shift hue slightly, desaturate
  const secondary = hslToHex({
    h: (pHsl.h + (warm ? 15 : -15) + 360) % 360,
    s: Math.max(20, pHsl.s - 30),
    l: Math.min(65, pHsl.l + 15),
  });
  
  // Accent: complementary-ish shift
  const accent = hslToHex({
    h: (pHsl.h + 45) % 360,
    s: Math.max(50, pHsl.s - 5),
    l: Math.min(55, pHsl.l + 5),
  });
  
  // Neutral base shifts based on color temperature
  const neutralH = pHsl.h;
  const neutralS = Math.min(10, pHsl.s * 0.15);
  
  // Background: very slight tint of primary
  const background = hslToHex({ h: neutralH, s: neutralS, l: 99 });
  const surface = hslToHex({ h: neutralH, s: neutralS + 2, l: 96 });
  const surfaceHover = hslToHex({ h: neutralH, s: neutralS + 3, l: 93 });
  
  // Text
  const text = hslToHex({ h: pHsl.h, s: Math.min(25, pHsl.s * 0.3), l: 10 });
  const textSecondary = hslToHex({ h: pHsl.h, s: Math.min(15, pHsl.s * 0.2), l: 40 });
  const textMuted = hslToHex({ h: pHsl.h, s: Math.min(10, pHsl.s * 0.15), l: 55 });
  
  // Border
  const border = hslToHex({ h: neutralH, s: neutralS + 5, l: 88 });
  const borderHover = hslToHex({ h: neutralH, s: neutralS + 8, l: 78 });
  
  // Semantic colors — harmonized with primary hue
  const successH = (pHsl.h + 145) % 360;
  const warningH = warm ? 38 : 42;
  const errorH = (pHsl.h + 190) % 360 < 180 ? 0 : (pHsl.h + 340) % 360;
  const infoH = pHsl.h;
  
  return {
    primary,
    primaryHover: adjustHsl(primary, 0, 5, -7),
    primaryActive: adjustHsl(primary, 0, 5, -12),
    primaryMuted: hslToHex({ h: hsl.h, s: Math.max(30, hsl.s - 15), l: 92 }),
    secondary,
    secondaryHover: adjustHsl(secondary, 0, 5, -7),
    accent,
    accentHover: adjustHsl(accent, 0, 5, -7),
    background,
    surface,
    surfaceHover,
    text,
    textSecondary,
    textMuted,
    textOnPrimary: getOptimalTextColor(primary),
    border,
    borderHover,
    ring: hslToHex({ h: hsl.h, s: hsl.s, l: 80 }),
    disabled: hslToHex({ h: neutralH, s: 5, l: 90 }),
    disabledText: hslToHex({ h: neutralH, s: 5, l: 60 }),
    success: hslToHex({ h: successH < 90 || successH > 200 ? 142 : successH, s: 65, l: 40 }),
    successBg: hslToHex({ h: successH < 90 || successH > 200 ? 142 : successH, s: 60, l: 95 }),
    warning: hslToHex({ h: warningH, s: 90, l: 45 }),
    warningBg: hslToHex({ h: warningH, s: 85, l: 95 }),
    error: hslToHex({ h: errorH < 10 || errorH > 350 ? 0 : errorH, s: 72, l: 50 }),
    errorBg: hslToHex({ h: errorH < 10 || errorH > 350 ? 0 : errorH, s: 70, l: 95 }),
    info: hslToHex({ h: infoH, s: 65, l: 50 }),
    infoBg: hslToHex({ h: infoH, s: 60, l: 95 }),
    gradient: `linear-gradient(135deg, ${primary}, ${accent})`,
    gradientSubtle: `linear-gradient(135deg, ${hslToHex({ h: pHsl.h, s: 30, l: 96 })}, ${hslToHex({ h: (pHsl.h + 45) % 360, s: 30, l: 96 })})`,
  };
}

export function generateDarkPalette(primaryHex: string): GeneratedPalette {
  const hsl = hexToHsl(primaryHex);
  const warm = isWarmColor(primaryHex);
  
  // Use exact user-chosen color as primary (buttons, badges, etc.)
  const primary = primaryHex;
  
  // Derive a "working" version for calculating other palette tokens
  const workHsl = {
    h: hsl.h,
    s: Math.max(55, Math.min(85, hsl.s + 10)),
    l: Math.max(55, Math.min(70, hsl.l + 15)),
  };
  const pHsl = workHsl;
  
  // Secondary
  const secondary = hslToHex({
    h: (pHsl.h + (warm ? 15 : -15) + 360) % 360,
    s: Math.max(15, pHsl.s - 25),
    l: 65,
  });
  
  // Accent
  const accent = hslToHex({
    h: (pHsl.h + 45) % 360,
    s: Math.max(50, pHsl.s),
    l: 65,
  });
  
  // Dark neutral base with subtle primary tinting
  const neutralH = pHsl.h;
  const neutralS = Math.min(15, pHsl.s * 0.2);
  
  const background = hslToHex({ h: neutralH, s: neutralS, l: 7 });
  const surface = hslToHex({ h: neutralH, s: neutralS + 2, l: 12 });
  const surfaceHover = hslToHex({ h: neutralH, s: neutralS + 3, l: 16 });
  
  // Text
  const text = hslToHex({ h: pHsl.h, s: Math.min(10, pHsl.s * 0.1), l: 95 });
  const textSecondary = hslToHex({ h: pHsl.h, s: Math.min(10, pHsl.s * 0.15), l: 70 });
  const textMuted = hslToHex({ h: pHsl.h, s: Math.min(8, pHsl.s * 0.1), l: 50 });
  
  // Border
  const border = hslToHex({ h: neutralH, s: neutralS + 5, l: 18 });
  const borderHover = hslToHex({ h: neutralH, s: neutralS + 8, l: 28 });
  
  // Semantic colors for dark mode
  const successH = 142;
  const warningH = warm ? 38 : 42;
  const errorH = 0;
  const infoH = pHsl.h;
  
  return {
    primary,
    primaryHover: adjustHsl(primary, 0, 5, 7),
    primaryActive: adjustHsl(primary, 0, 5, 12),
    primaryMuted: hslToHex({ h: hsl.h, s: Math.max(20, hsl.s - 20), l: 18 }),
    secondary,
    secondaryHover: adjustHsl(secondary, 0, 5, 7),
    accent,
    accentHover: adjustHsl(accent, 0, 5, 7),
    background,
    surface,
    surfaceHover,
    text,
    textSecondary,
    textMuted,
    textOnPrimary: getOptimalTextColor(primary),
    border,
    borderHover,
    ring: hslToHex({ h: hsl.h, s: hsl.s, l: 30 }),
    disabled: hslToHex({ h: neutralH, s: 5, l: 20 }),
    disabledText: hslToHex({ h: neutralH, s: 5, l: 40 }),
    success: hslToHex({ h: successH, s: 60, l: 55 }),
    successBg: hslToHex({ h: successH, s: 40, l: 15 }),
    warning: hslToHex({ h: warningH, s: 80, l: 55 }),
    warningBg: hslToHex({ h: warningH, s: 50, l: 15 }),
    error: hslToHex({ h: errorH, s: 65, l: 55 }),
    errorBg: hslToHex({ h: errorH, s: 45, l: 15 }),
    info: hslToHex({ h: infoH, s: 55, l: 60 }),
    infoBg: hslToHex({ h: infoH, s: 40, l: 15 }),
    gradient: `linear-gradient(135deg, ${primary}, ${accent})`,
    gradientSubtle: `linear-gradient(135deg, ${hslToHex({ h: pHsl.h, s: 20, l: 12 })}, ${hslToHex({ h: (pHsl.h + 45) % 360, s: 20, l: 12 })})`,
  };
}

// ─── Brand Personality Configs ───────────────────────────────────────

interface PersonalityConfig {
  radiusMultiplier: number;
  shadowIntensity: number;
  shadowBlur: number;
  fontFamily: string;
  headingFont: string;
  spacingBase: number;
}

export const BRAND_PERSONALITIES: Record<BrandPersonality, PersonalityConfig & { label: string; description: string }> = {
  modern: { label: 'Modern', description: 'Clean and contemporary', radiusMultiplier: 1, shadowIntensity: 0.08, shadowBlur: 12, fontFamily: 'Inter', headingFont: 'Inter', spacingBase: 16 },
  luxury: { label: 'Luxury', description: 'Sophisticated and premium', radiusMultiplier: 0.25, shadowIntensity: 0.04, shadowBlur: 20, fontFamily: 'Playfair Display', headingFont: 'Playfair Display', spacingBase: 20 },
  friendly: { label: 'Friendly', description: 'Approachable and warm', radiusMultiplier: 2, shadowIntensity: 0.1, shadowBlur: 16, fontFamily: 'Nunito', headingFont: 'Nunito', spacingBase: 16 },
  enterprise: { label: 'Enterprise', description: 'Professional and trustworthy', radiusMultiplier: 0.5, shadowIntensity: 0.06, shadowBlur: 8, fontFamily: 'Source Sans 3', headingFont: 'Source Sans 3', spacingBase: 16 },
  playful: { label: 'Playful', description: 'Fun and energetic', radiusMultiplier: 3, shadowIntensity: 0.12, shadowBlur: 20, fontFamily: 'Poppins', headingFont: 'Poppins', spacingBase: 18 },
  minimal: { label: 'Minimal', description: 'Less is more', radiusMultiplier: 0.5, shadowIntensity: 0.03, shadowBlur: 4, fontFamily: 'Inter', headingFont: 'Inter', spacingBase: 16 },
  bold: { label: 'Bold', description: 'Strong and impactful', radiusMultiplier: 1.5, shadowIntensity: 0.15, shadowBlur: 24, fontFamily: 'Outfit', headingFont: 'Outfit', spacingBase: 20 },
  elegant: { label: 'Elegant', description: 'Graceful and refined', radiusMultiplier: 0.75, shadowIntensity: 0.05, shadowBlur: 16, fontFamily: 'Cormorant Garamond', headingFont: 'Cormorant Garamond', spacingBase: 20 },
  tech: { label: 'Tech', description: 'Cutting edge and innovative', radiusMultiplier: 1, shadowIntensity: 0.1, shadowBlur: 16, fontFamily: 'JetBrains Mono', headingFont: 'Space Grotesk', spacingBase: 16 },
};

// ─── Theme Score ─────────────────────────────────────────────────────

export interface ThemeScore {
  overall: number;
  contrast: number;
  harmony: number;
  accessibility: number;
}

export function calculateThemeScore(palette: GeneratedPalette): ThemeScore {
  // Contrast score (how good is text readability)
  const bgTextContrast = getContrastRatio(palette.background, palette.text);
  const surfaceTextContrast = getContrastRatio(palette.surface, palette.text);
  const primaryTextContrast = getContrastRatio(palette.primary, palette.textOnPrimary);
  
  const contrastScore = Math.min(100, Math.round(
    (Math.min(bgTextContrast / 7, 1) * 40) +
    (Math.min(surfaceTextContrast / 7, 1) * 30) +
    (Math.min(primaryTextContrast / 4.5, 1) * 30)
  ));
  
  // Harmony score (how well colors work together)
  const pHsl = hexToHsl(palette.primary);
  const sHsl = hexToHsl(palette.secondary);
  const aHsl = hexToHsl(palette.accent);
  
  const hueDiff1 = Math.abs(pHsl.h - sHsl.h);
  const hueDiff2 = Math.abs(pHsl.h - aHsl.h);
  const harmonyScore = Math.round(
    (Math.min(hueDiff1, 360 - hueDiff1) > 10 ? 50 : 30) +
    (Math.min(hueDiff2, 360 - hueDiff2) > 20 ? 50 : 30)
  );
  
  // Accessibility score
  const aa = bgTextContrast >= 4.5 && surfaceTextContrast >= 4.5 && primaryTextContrast >= 3;
  const aaa = bgTextContrast >= 7 && surfaceTextContrast >= 7;
  const accessibilityScore = aaa ? 100 : aa ? 80 : Math.round((bgTextContrast / 4.5) * 60);
  
  const overall = Math.round(contrastScore * 0.4 + harmonyScore * 0.3 + accessibilityScore * 0.3);
  
  return { overall, contrast: contrastScore, harmony: harmonyScore, accessibility: accessibilityScore };
}
