/**
 * Logo Analyzer — Smart color extraction from uploaded logos
 * 
 * Uses simplified k-means clustering to find dominant colors,
 * then selects the most brand-relevant color as primary.
 */

import { hexToHsl, hslToHex, rgbToHex, isNeutralColor, type HSL, type RGB } from './colorEngine';

interface ColorCluster {
  r: number;
  g: number;
  b: number;
  count: number;
}

/**
 * Extract dominant colors from an image element using k-means-like clustering
 */
export function extractDominantColors(
  imgElement: HTMLImageElement,
  numColors: number = 5
): string[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Scale down for performance
  const maxSize = 100;
  const scale = Math.min(maxSize / imgElement.naturalWidth, maxSize / imgElement.naturalHeight, 1);
  canvas.width = Math.floor(imgElement.naturalWidth * scale);
  canvas.height = Math.floor(imgElement.naturalHeight * scale);
  
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Collect valid pixels (skip near-white, near-black, and transparent)
  const validPixels: RGB[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    if (a < 128) continue; // Skip transparent pixels
    
    // Skip near-white and near-black
    const brightness = (r + g + b) / 3;
    if (brightness > 240 || brightness < 15) continue;
    
    validPixels.push({ r, g, b });
  }

  if (validPixels.length === 0) return ['#6366f1']; // Fallback

  // Simple k-means clustering
  const clusters = kMeansClustering(validPixels, numColors, 10);
  
  // Sort by count (most dominant first)
  clusters.sort((a, b) => b.count - a.count);
  
  return clusters.map(c => rgbToHex(
    Math.round(c.r),
    Math.round(c.g),
    Math.round(c.b)
  ));
}

function kMeansClustering(pixels: RGB[], k: number, iterations: number): ColorCluster[] {
  // Initialize centroids randomly from pixels
  const centroids: RGB[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) {
    const idx = Math.min(i * step, pixels.length - 1);
    centroids.push({ ...pixels[idx] });
  }

  let assignments = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    // Assign each pixel to nearest centroid
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let best = 0;
      for (let j = 0; j < centroids.length; j++) {
        const dr = pixels[i].r - centroids[j].r;
        const dg = pixels[i].g - centroids[j].g;
        const db = pixels[i].b - centroids[j].b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
          minDist = dist;
          best = j;
        }
      }
      assignments[i] = best;
    }

    // Update centroids
    const sums: { r: number; g: number; b: number; count: number }[] = centroids.map(() => ({
      r: 0, g: 0, b: 0, count: 0
    }));
    
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r;
      sums[c].g += pixels[i].g;
      sums[c].b += pixels[i].b;
      sums[c].count++;
    }

    for (let j = 0; j < centroids.length; j++) {
      if (sums[j].count > 0) {
        centroids[j].r = sums[j].r / sums[j].count;
        centroids[j].g = sums[j].g / sums[j].count;
        centroids[j].b = sums[j].b / sums[j].count;
      }
    }
  }

  // Build final clusters with counts
  const result: ColorCluster[] = centroids.map((c, i) => ({
    r: c.r,
    g: c.g,
    b: c.b,
    count: assignments.filter((a: number) => a === i).length,
  }));

  return result.filter(c => c.count > 0);
}

/**
 * Select the best brand color from extracted colors
 * Prefers: saturated, vivid, not too dark, not too light
 */
export function selectBrandColor(colors: string[]): string {
  if (colors.length === 0) return '#6366f1';

  let bestScore = -Infinity;
  let bestColor = colors[0];

  for (const color of colors) {
    const hsl = hexToHsl(color);
    let score = 0;

    // Prefer higher saturation
    score += hsl.s * 2;
    
    // Prefer mid-range lightness (30-60)
    const lDist = Math.abs(hsl.l - 45);
    score -= lDist * 1.5;
    
    // Penalize very low saturation (grays)
    if (hsl.s < 15) score -= 100;
    
    // Penalize very dark or very light
    if (hsl.l < 15 || hsl.l > 85) score -= 80;

    if (score > bestScore) {
      bestScore = score;
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * Generate a usable brand color from a neutral/grayscale logo
 * Returns a curated color based on a neutral tone system
 */
export function generateFromNeutral(): string[] {
  const suggestions = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];
  return suggestions;
}

/**
 * Generate logo variants (simulated via CSS filters guidance)
 */
export interface LogoVariants {
  original: string; // data URL of the original
  lightBg: boolean; // true if logo looks good on light bg
  darkBg: boolean; // true if logo looks good on dark bg
  dominantColors: string[];
  suggestedPrimary: string;
}

export function analyzeLogoVariants(
  imgElement: HTMLImageElement,
  dominantColors: string[]
): LogoVariants {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      original: '',
      lightBg: true,
      darkBg: false,
      dominantColors,
      suggestedPrimary: selectBrandColor(dominantColors),
    };
  }

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0);

  // Check average brightness of the logo
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let totalBrightness = 0;
  let count = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 128) {
      totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      count++;
    }
  }
  const avgBrightness = count > 0 ? totalBrightness / count : 128;

  return {
    original: canvas.toDataURL(),
    lightBg: avgBrightness < 180, // Dark logo = good on light
    darkBg: avgBrightness > 80, // Light logo = good on dark
    dominantColors,
    suggestedPrimary: selectBrandColor(dominantColors),
  };
}
