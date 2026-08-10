export type Rgb = [number, number, number];

export interface TailwindFamily {
  name: string;
  swatch: string;
  chipClass: string;
  bg: string;
  text: string;
  border: string;
}

export const TAILWIND_FAMILIES: TailwindFamily[] = [
  { name: 'slate', swatch: '#64748b', chipClass: 'bg-slate-100 text-slate-800 border-slate-200', bg: '#f1f5f9', text: '#1e293b', border: '#e2e8f0' },
  { name: 'gray', swatch: '#6b7280', chipClass: 'bg-gray-100 text-gray-800 border-gray-200', bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' },
  { name: 'zinc', swatch: '#71717a', chipClass: 'bg-zinc-100 text-zinc-800 border-zinc-200', bg: '#f4f4f5', text: '#27272a', border: '#e4e4e7' },
  { name: 'red', swatch: '#ef4444', chipClass: 'bg-red-100 text-red-800 border-red-200', bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  { name: 'orange', swatch: '#f97316', chipClass: 'bg-orange-100 text-orange-800 border-orange-200', bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
  { name: 'amber', swatch: '#f59e0b', chipClass: 'bg-amber-100 text-amber-800 border-amber-200', bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  { name: 'yellow', swatch: '#eab308', chipClass: 'bg-yellow-100 text-yellow-800 border-yellow-200', bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
  { name: 'lime', swatch: '#84cc16', chipClass: 'bg-lime-100 text-lime-800 border-lime-200', bg: '#ecfccb', text: '#3f6212', border: '#d9f99d' },
  { name: 'green', swatch: '#22c55e', chipClass: 'bg-green-100 text-green-800 border-green-200', bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  { name: 'emerald', swatch: '#10b981', chipClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  { name: 'teal', swatch: '#14b8a6', chipClass: 'bg-teal-100 text-teal-800 border-teal-200', bg: '#ccfbf1', text: '#115e59', border: '#99f6e4' },
  { name: 'cyan', swatch: '#06b6d4', chipClass: 'bg-cyan-100 text-cyan-800 border-cyan-200', bg: '#cffafe', text: '#155e75', border: '#a5f3fc' },
  { name: 'sky', swatch: '#0ea5e9', chipClass: 'bg-sky-100 text-sky-800 border-sky-200', bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
  { name: 'blue', swatch: '#3b82f6', chipClass: 'bg-blue-100 text-blue-800 border-blue-200', bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  { name: 'indigo', swatch: '#6366f1', chipClass: 'bg-indigo-100 text-indigo-800 border-indigo-200', bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  { name: 'violet', swatch: '#8b5cf6', chipClass: 'bg-violet-100 text-violet-800 border-violet-200', bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  { name: 'purple', swatch: '#a855f7', chipClass: 'bg-purple-100 text-purple-800 border-purple-200', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
  { name: 'fuchsia', swatch: '#d946ef', chipClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', bg: '#fae8ff', text: '#86198f', border: '#f5d0fe' },
  { name: 'pink', swatch: '#ec4899', chipClass: 'bg-pink-100 text-pink-800 border-pink-200', bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  { name: 'rose', swatch: '#f43f5e', chipClass: 'bg-rose-100 text-rose-800 border-rose-200', bg: '#ffe4e6', text: '#9f1239', border: '#fecdd3' }
];

export const FALLBACK_CHIP_CLASS = "bg-gray-100 text-gray-800 border-gray-200";

export const DEFAULT_SAVED_COLORS = ["#EF4444", "#22C55E", "#3B82F6"];

export const MAX_SAVED_COLORS = 20;

export function isValidHex(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val.trim());
}

export function parseHex(val: unknown): Rgb | null {
  if (typeof val !== 'string') return null;
  let s = val.trim().replace(/^#/, '');
  if (s.length === 3) {
    s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  if (s.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(s)) {
    return null;
  }
  const r = parseInt(s.substring(0, 2), 16);
  const g = parseInt(s.substring(2, 4), 16);
  const b = parseInt(s.substring(4, 6), 16);
  return [r, g, b];
}

export function rgbToHex(rgb: Rgb): string {
  if (!Array.isArray(rgb) || rgb.length !== 3) return "#000000";
  const r = Math.max(0, Math.min(255, Math.round(rgb[0]))).toString(16).padStart(2, '0');
  const g = Math.max(0, Math.min(255, Math.round(rgb[1]))).toString(16).padStart(2, '0');
  const b = Math.max(0, Math.min(255, Math.round(rgb[2]))).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

export function hsvToRgb(h: number, s: number, v: number): Rgb {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

export function rgbToHsv(rgb: Rgb): [number, number, number] {
  if (!Array.isArray(rgb) || rgb.length !== 3) return [0, 0, 0];
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else h = 60 * (((r - g) / delta) + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return [h, s, v];
}

export function rgbToHsl(rgb: Rgb): [number, number, number] {
  if (!Array.isArray(rgb) || rgb.length !== 3) return [0, 0, 0];
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else h = 60 * (((r - g) / delta) + 4);
  }
  if (h < 0) h += 360;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function relativeLuminance(rgb: Rgb): number {
  if (!Array.isArray(rgb) || rgb.length !== 3) return 0;
  const [r, g, b] = rgb.map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(rgb1: Rgb, rgb2: Rgb): number {
  if (!Array.isArray(rgb1) || rgb1.length !== 3 || !Array.isArray(rgb2) || rgb2.length !== 3) return 1;
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

export function nearestFamily(rgb: Rgb): TailwindFamily {
  let bestDistance = Infinity;
  let bestFamily: TailwindFamily = TAILWIND_FAMILIES[0];
  if (!Array.isArray(rgb) || rgb.length !== 3) return bestFamily;
  for (const family of TAILWIND_FAMILIES) {
    const familyRgb = parseHex(family.swatch);
    if (!familyRgb) continue;
    const rDiff = rgb[0] - familyRgb[0];
    const gDiff = rgb[1] - familyRgb[1];
    const bDiff = rgb[2] - familyRgb[2];
    const distance = 2 * (rDiff * rDiff) + 4 * (gDiff * gDiff) + 3 * (bDiff * bDiff);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestFamily = family;
    }
  }
  return bestFamily;
}

export function familyByName(name: string): TailwindFamily | null {
  if (typeof name !== 'string') return null;
  for (const family of TAILWIND_FAMILIES) {
    if (family.name === name) return family;
  }
  return null;
}

export function familyByChipClass(chipClass: unknown): TailwindFamily | null {
  if (typeof chipClass !== 'string') return null;
  const trimmed = chipClass.trim();
  if (!trimmed) return null;
  for (const family of TAILWIND_FAMILIES) {
    if (family.chipClass === trimmed) return family;
  }
  const tokens = trimmed.split(/\s+/);
  for (const family of TAILWIND_FAMILIES) {
    if (tokens.includes(`bg-${family.name}-100`)) return family;
  }
  return null;
}

export function formatRgba(rgb: Rgb, alpha: number = 1): string {
  if (!Array.isArray(rgb) || rgb.length !== 3) return "rgba(0, 0, 0, 1)";
  const a = Math.max(0, Math.min(1, alpha));
  if (a < 1) {
    const aStr = Number(a.toFixed(2));
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${aStr})`;
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function readableTextColor(rgb: Rgb): string {
  if (!Array.isArray(rgb) || rgb.length !== 3) return "#101828";
  const white: Rgb = [255, 255, 255];
  if (contrastRatio(rgb, white) >= 3.4) {
    return "#ffffff";
  }
  return "#101828";
}
