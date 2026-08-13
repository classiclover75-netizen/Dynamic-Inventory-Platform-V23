import re

with open('src/components/AddRowModal.tsx', 'r') as f:
    content = f.read()

# Update import
content = re.sub(r'getNextAvailableFamily', 'getNextAvailableHexColor', content)

# Remove initialMode and showModeToggle
content = re.sub(r'initialMode="palette"\n', '', content)
content = re.sub(r'showModeToggle=\{true\}\n', '', content)
content = re.sub(r'initialMode="palette" ', '', content)
content = re.sub(r'showModeToggle=\{true\} ', '', content)

with open('src/components/AddRowModal.tsx', 'w') as f:
    f.write(content)

