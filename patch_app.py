import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add allPagesRows={state.pageRows} to AddRowModal
content = re.sub(r'(\s*allRows=\{currentRows\}\n)', r'\1        allPagesRows={state.pageRows}\n', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
