import { rgbToHex, rgbToHsl, parseHex, familyByChipClass, TAILWIND_FAMILIES } from "./colorUtils";
import { parseCustomColor } from "./colorRender";

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

export function extractHue(color: string): number | null {
  if (color.startsWith("custom:")) {
    const parsed = parseCustomColor(color);
    if (parsed) {
      const hsl = rgbToHsl(parsed.rgb);
      return hsl[0];
    }
  } else {
    const family = familyByChipClass(color);
    if (family) {
      const parsed = parseHex(family.bg || family.swatch);
      if (parsed) {
        const hsl = rgbToHsl(parsed);
        return hsl[0];
      }
    }
  }
  return null;
}

export function generateRandomSourceColor(usedHues: number[]): string {
  let bestHue = 0;
  let maxMinDiff = -1;

  for (let attempt = 0; attempt < 40; attempt++) {
    const hue = Math.floor(Math.random() * 360);
    
    let minDiff = 360;
    if (usedHues.length === 0) {
        minDiff = 360;
    }
    
    for (const usedHue of usedHues) {
      let diff = Math.abs(hue - usedHue);
      if (diff > 180) {
        diff = 360 - diff;
      }
      if (diff < minDiff) {
        minDiff = diff;
      }
    }
    
    if (minDiff >= 18) {
      bestHue = hue;
      maxMinDiff = minDiff;
      break;
    }
    
    if (minDiff > maxMinDiff) {
      maxMinDiff = minDiff;
      bestHue = hue;
    }
  }
  
  const saturation = 70;
  const lightness = 85;
  
  const rgb = hslToRgb(bestHue, saturation, lightness);
  const hex = rgbToHex(rgb);
  
  return `custom:${hex}@100`;
}
