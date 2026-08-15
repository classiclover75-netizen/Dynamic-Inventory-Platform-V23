def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import
    import_statement = 'import { shouldDisableImagePreviewActions } from "./lib/imagePreviewActions";'
    if import_statement not in content:
        # Find the last import
        import_index = content.rfind('import ')
        next_line_index = content.find('\n', import_index)
        content = content[:next_line_index+1] + import_statement + '\n' + content[next_line_index+1:]

    # Update ImagePreviewModal actionsDisabled prop
    old_prop = 'actionsDisabled={previewContext?.disableActions === true}'
    new_prop = 'actionsDisabled={shouldDisableImagePreviewActions(previewContext, state.pageConfigs)}'
    
    content = content.replace(old_prop, new_prop)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/App.tsx')
