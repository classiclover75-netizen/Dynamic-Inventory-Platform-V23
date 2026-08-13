import re

with open('src/components/AddRowModal.tsx', 'r') as f:
    content = f.read()

# Replace the existing allRows iteration
old_logic = """                                        if (allRows) {
                                          for (const r of allRows) {
                                            try {
                                              const val = r[col.key]; // col.key is the active column being edited
                                              if (!val) continue;
                                              const arr = typeof val === 'string' ? JSON.parse(val) : val;
                                              if (Array.isArray(arr)) {
                                                const match = arr.find((item: any) => item.source?.trim().toLowerCase() === newSourceInput.source.trim().toLowerCase());
                                                if (match && match.color) {
                                                  existingColor = match.color;
                                                  break;
                                                }
                                              }
                                            } catch(e) {} // ignore parsing errors for flat values
                                          }
                                        }"""

new_logic = """                                        const pagesToSearch = allPagesRows ? Object.values(allPagesRows) : (allRows ? [allRows] : []);
                                        for (const rows of pagesToSearch) {
                                          for (const r of rows) {
                                            for (const fieldKey of Object.keys(r)) {
                                              try {
                                                const val = r[fieldKey];
                                                if (!val) continue;
                                                const arr = typeof val === 'string' ? JSON.parse(val) : val;
                                                if (Array.isArray(arr)) {
                                                  const match = arr.find((item: any) => item.source?.trim().toLowerCase() === newSourceInput.source.trim().toLowerCase());
                                                  if (match && match.color) {
                                                    existingColor = match.color;
                                                    break;
                                                  }
                                                }
                                              } catch (e) {}
                                            }
                                            if (existingColor) break;
                                          }
                                          if (existingColor) break;
                                        }"""

content = content.replace(old_logic, new_logic)

with open('src/components/AddRowModal.tsx', 'w') as f:
    f.write(content)

