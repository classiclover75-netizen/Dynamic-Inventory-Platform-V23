import re

with open('src/components/ColorPickerPanel.tsx', 'r') as f:
    content = f.read()

# Remove ColorPickerMode type
content = re.sub(r'export type ColorPickerMode = "palette" \| "custom";\n', '', content)

# Remove from ColorPickerValue
content = re.sub(r'\s*mode: ColorPickerMode;\n', '\n', content)
content = re.sub(r'\s*family: TailwindFamily;\n', '\n', content)

# Remove from ColorPickerPanelProps
content = re.sub(r'\s*initialMode\?: ColorPickerMode;\n', '\n', content)
content = re.sub(r'\s*showModeToggle\?: boolean;\n', '\n', content)
content = re.sub(r'\s*onModeChange\?: \(mode: ColorPickerMode\) => void;\n', '\n', content)

# Remove imports
content = re.sub(r'TailwindFamily,\n\s*', '', content)
content = re.sub(r'familyByChipClass,\n\s*', '', content)
content = re.sub(r'nearestFamily,\n\s*', '', content)

# Update resolveSeed
new_resolve_seed = """function resolveSeed(seed?: string): { h: number; s: number; v: number } {
  const fallback = { h: 217, s: 72, v: 60 };
  if (typeof seed !== 'string') return fallback;
  
  // Custom formatted color parsing
  if (seed.startsWith("custom:")) {
    const parts = seed.substring(7).split("@");
    if (parts.length > 0) {
      const hexRgb = parseHex(parts[0]);
      if (hexRgb) {
        const [h, s, v] = rgbToHsv(hexRgb);
        return { h, s, v };
      }
    }
  }

  const hexRgb = parseHex(seed);
  if (hexRgb) {
    const [h, s, v] = rgbToHsv(hexRgb);
    return { h, s, v };
  }
  
  return fallback;
}"""
content = re.sub(r'function resolveSeed\(seed\?: string\): \{ h: number; s: number; v: number \} \{.*?return fallback;\n\}', new_resolve_seed, content, flags=re.DOTALL)

# Remove mode state from ColorPickerPanel
content = re.sub(r'\s*initialMode = "palette",\n', '\n', content)
content = re.sub(r'\s*showModeToggle = true,\n', '\n', content)
content = re.sub(r'\s*onModeChange,\n', '\n', content)

# Modify initialSeed
content = re.sub(r'mode: initialMode \|\| "palette"', '', content)
content = re.sub(r'const \[mode, setMode\] = useState<ColorPickerMode>\(initialSeed\.current\.mode\);\n', '', content)

# Remove mode from onChangeRef.current call
content = re.sub(r'\s*mode,', '', content)
content = re.sub(r'\s*family,', '', content)
content = re.sub(r'chipClass: mode === "palette" \? family\.chipClass : buildCustomColor\(hex, Math\.round\(alpha \* 100\)\)', 'chipClass: buildCustomColor(hex, Math.round(alpha * 100))', content)

# Remove mode and family from useEffect deps
content = re.sub(r'\[mode, hex, alpha, rgb, family\]', '[hex, alpha, rgb]', content)

# Remove handleSelectMode
content = re.sub(r'const handleSelectMode = useCallback\(\(m: ColorPickerMode\) => \{.*?\n  \}, \[onModeChange\]\);\n', '', content, flags=re.DOTALL)

# Remove Palette/Custom Tabs
# Search for <div className="flex bg-gray-100 p-1 rounded"> ... </div> (the toggle)
# I will use a simple heuristic to find and remove it, or just use regex on the conditional
# Let's inspect the JSX structure around line 360-390
with open('src/components/ColorPickerPanel.tsx.tmp1', 'w') as f2:
    f2.write(content)

