import re

with open('src/components/ColorPickerPanel.tsx.tmp1', 'r') as f:
    content = f.read()

# Remove showModeToggle && (...) block
content = re.sub(r'\{showModeToggle && \(\s*<div.*?</div>\s*\)\}', '', content, flags=re.DOTALL)

# Ensure family use is removed in useMemo
content = re.sub(r'const family = useMemo\(\(\) => nearestFamily\(rgb\), \[rgb\]\);\n', '', content)

with open('src/components/ColorPickerPanel.tsx', 'w') as f:
    f.write(content)

