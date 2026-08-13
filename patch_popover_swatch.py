import re

with open('src/components/ColorPickerPopover.tsx', 'r') as f:
    content = f.read()

# Add imports
content = re.sub(r'import \{ parseHex \} from "\.\./lib/colorUtils";', 
                 'import { parseHex } from "../lib/colorUtils";\nimport { CUSTOM_PREFIX, parseCustomColor } from "../lib/colorRender";', content)

# Rewrite resolveSwatchColor
new_func = """function resolveSwatchColor(value?: string): string {
  if (!value) return "#E5E7EB";
  if (value.startsWith(CUSTOM_PREFIX)) {
    const parsed = parseCustomColor(value);
    if (parsed) return parsed.hex;
  }
  if (parseHex(value)) return value;
  return "#E5E7EB";
}"""

content = re.sub(r'function resolveSwatchColor\(value\?: string\): string \{.*?return "#E5E7EB";\n\}', new_func, content, flags=re.DOTALL)

with open('src/components/ColorPickerPopover.tsx', 'w') as f:
    f.write(content)

