import re

with open('src/components/AddRowModal.tsx', 'r') as f:
    content = f.read()

# Add to destructuring
content = re.sub(r'    allRows,\n', '    allRows,\n    allPagesRows,\n', content)

# Add to type
content = re.sub(r'    allRows\?: RowData\[\];\n', '    allRows?: RowData[];\n    allPagesRows?: Record<string, RowData[]>;\n', content)

with open('src/components/AddRowModal.tsx', 'w') as f:
    f.write(content)
