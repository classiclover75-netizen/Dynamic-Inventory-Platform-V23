import re

with open('src/components/ColorPickerPopover.tsx', 'r') as f:
    content = f.read()

# Remove ColorPickerMode import
content = re.sub(r' ColorPickerMode,', '', content)
# Remove familyByChipClass import
content = re.sub(r'familyByChipClass, ', '', content)

# Remove props
content = re.sub(r'\s*initialMode\?: ColorPickerMode;\n', '\n', content)
content = re.sub(r'\s*showModeToggle\?: boolean;\n', '\n', content)

content = re.sub(r'initialMode\s*=\s*"palette",\n', '', content)
content = re.sub(r'showModeToggle\s*=\s*true,\n', '', content)

# Remove props from ColorPickerPanel usage
content = re.sub(r'initialMode=\{initialMode\}\n', '', content)
content = re.sub(r'showModeToggle=\{showModeToggle\}\n', '', content)

with open('src/components/ColorPickerPopover.tsx', 'w') as f:
    f.write(content)

