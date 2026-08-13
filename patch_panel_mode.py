import re

with open('src/components/ColorPickerPanel.tsx', 'r') as f:
    content = f.read()

# Fix dependency array
content = re.sub(r'\[ hex, alpha, rgb, family\]', '[hex, alpha, rgb]', content)

# Fix canReset and handleReset
content = re.sub(r'\|\|\n\s*mode !== s\.mode', '', content)
content = re.sub(r'\[hsv, alpha, mode\]', '[hsv, alpha]', content)
content = re.sub(r'\s*setMode\(s\.mode\);\n', '\n', content)

with open('src/components/ColorPickerPanel.tsx', 'w') as f:
    f.write(content)
