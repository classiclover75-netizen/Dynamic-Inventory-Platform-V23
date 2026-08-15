import { parseMultiSource } from './appUtils';

export function getSourcesFromTotalQty(row: any): string[] {
  if (!row.total_qty) return [];
  const parsed = parseMultiSource(row.total_qty);
  return parsed.map((p: any) => p.source);
}

export function getSumForSourceAcrossKeys(row: any, sourceName: string | null, keys: string[]): number {
  let total = 0;
  for (const key of keys) {
    const val = row[key];
    if (!val) continue;
    const parsed = parseMultiSource(val);
    if (sourceName) {
      const match = parsed.find((p: any) => p.source === sourceName);
      if (match) {
        total += parseFloat(String(match.qty)) || 0;
      }
    } else {
      for (const match of parsed) {
        total += parseFloat(String(match.qty)) || 0;
      }
    }
  }
  return total;
}
