# Troubleshooting Guide - Footnote Backreference Synchronization Plugin

## 🔍 Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] **Plugin Enabled**: Check Settings → Community Plugins → Footnote Backreference Synchronization is toggled ON
- [ ] **Feature Enabled**: Check "Enable Custom Label Display" is enabled in plugin settings
- [ ] **Reading View**: Ensure you're viewing the document in Reading mode (not Editing mode)
- [ ] **Correct Format**: Verify footnotes follow the format `[^label]` and definitions `[^label]: content`
- [ ] **No Console Errors**: Check browser console (Ctrl+Shift+I) for error messages
- [ ] **Recent Changes**: Try refreshing the document (Ctrl+R) after making changes

## 🚨 Common Issues & Solutions

### Issue 1: Backreferences Not Updating

**Symptoms:**
- Backreferences still show generic icons (↩️) instead of custom labels
- Changes don't appear after editing footnotes
- Plugin appears to be inactive

**Diagnostic Steps:**
1. **Check Plugin Status**
   ```
   Settings → Community Plugins → Footnote Backreference Synchronization
   ```
   - Toggle should be **blue** (enabled)
   - Click on plugin name to access settings

2. **Verify Feature is Enabled**
   ```
   Settings → Community Plugins → Footnote Backreference Synchronization → Enable Custom Label Display
   ```
   - This toggle should be **ON**

3. **Check View Mode**
   - Switch to **Reading view** (not Editing mode)
   - Backreferences only update in Reading view

4. **Test with Simple Example**
   ```markdown
   Test sentence[^1].
   
   [^1]: Test definition.
   ```
   - Create this in a new document
   - Switch to Reading view
   - Should see `[1]` instead of ↩️

**Solutions:**
- ✅ Enable the plugin and feature toggle
- ✅ Switch to Reading view
- ✅ Refresh the document (Ctrl+R)
- ✅ Restart Obsidian if issues persist

### Issue 2: Performance Problems

**Symptoms:**
- Obsidian becomes slow or unresponsive
- Lag when typing or editing
- High CPU usage
- Delayed backreference updates

**Diagnostic Steps:**
1. **Check Update Delay Setting**
   ```
   Settings → Community Plugins → Footnote Backreference Synchronization → Update Delay
   ```
   - Current value: _____ ms
   - Recommended: 300-500ms for most users

2. **Monitor Console Performance**
   - Open console (Ctrl+Shift+I)
   - Look for repeated error messages
   - Check for memory leaks

3. **Test with Different Document Sizes**
   - Try with a small document (1-2 footnotes)
   - Try with a large document (10+ footnotes)
   - Note performance differences

**Solutions:**
- ⚡ **Increase Update Delay**: Set to 500-700ms for large documents
- ⚡ **Disable Hover Effects**: Turn off in settings if not needed
- ⚡ **Close Other Documents**: Reduce the number of open documents
- ⚡ **Restart Obsidian**: Clear memory and cache
- ⚡ **Check Other Plugins**: Disable other plugins to identify conflicts

### Issue 3: Custom Labels Not Working

**Symptoms:**
- Custom labels like `[^video]` don't display properly
- Only numeric labels work
- Labels show as generic text or don't appear at all

**Diagnostic Steps:**
1. **Check Label Format**
   ```markdown
   ✅ Correct: [^video]: Definition here
   ❌ Wrong: [^video] : Definition here
   ❌ Wrong: [^video]:Definition here
   ```

2. **Verify Label Matching**
   ```markdown
   Reference: [^video]
   Definition: [^video]: Content
   ```
   - Labels must match exactly (case-sensitive)

3. **Test with Simple Labels**
   ```markdown
   Test[^test].
   
   [^test]: Simple test.
   ```

**Solutions:**
- 🔍 **Check Format**: Ensure proper spacing and syntax
- 🔍 **Match Labels**: Verify reference and definition labels are identical
- 🔍 **Use Simple Labels**: Avoid special characters initially
- 🔍 **Check Console**: Look for parsing errors

### Issue 4: Plugin Conflicts

**Symptoms:**
- Other footnote plugins stop working
- Unexpected behavior with footnotes
- Error messages about conflicting functionality

**Diagnostic Steps:**
1. **List Installed Plugins**
   ```
   Settings → Community Plugins
   ```
   - Note all footnote-related plugins
   - Check for similar functionality

2. **Test in Isolation**
   - Disable all other footnote plugins
   - Test this plugin alone
   - Re-enable plugins one by one

3. **Check Plugin Order**
   - Some plugins may need specific loading order
   - Try reordering plugin activation

**Solutions:**
- 🔧 **Disable Conflicting Plugins**: Turn off other footnote plugins temporarily
- 🔧 **Update All Plugins**: Ensure all plugins are on latest versions
- 🔧 **Check Compatibility**: Review plugin documentation for known conflicts
- 🔧 **Report Issues**: Contact plugin developers about conflicts

### Issue 5: Settings Not Saving

**Symptoms:**
- Settings reset after restarting Obsidian
- Changes don't persist between sessions
- Default values keep reappearing

**Diagnostic Steps:**
1. **Check Settings Location**
   ```
   Your Vault/.obsidian/plugins/obsidian-footnotes/data.json
   ```
   - Verify this file exists
   - Check file permissions

2. **Test Settings Persistence**
   - Change a setting
   - Restart Obsidian
   - Check if setting is preserved

3. **Check File Permissions**
   - Ensure Obsidian has write access to the plugins folder
   - Check for read-only file attributes

**Solutions:**
- 💾 **Check Permissions**: Ensure write access to plugin folder
- 💾 **Clear Settings**: Delete `data.json` and reconfigure
- 💾 **Reinstall Plugin**: Remove and reinstall the plugin
- 💾 **Check Vault Location**: Ensure vault is not in a restricted location

### Issue 6: Display Style Issues

**Symptoms:**
- Display style changes don't apply
- Superscript not working properly
- Emoji not displaying correctly

**Diagnostic Steps:**
1. **Check Display Style Setting**
   ```
   Settings → Community Plugins → Footnote Backreference Synchronization → Display Style
   ```
   - Current selection: _____
   - Try different styles

2. **Test Each Style**
   - Brackets: Should show `[label]`
   - Emoji: Should show `↩️ label`
   - Superscript: Should show as small text
   - Plain: Should show `label`

3. **Check Browser Support**
   - Some emojis may not display on all systems
   - Superscript requires proper CSS support

**Solutions:**
- 🎨 **Try Different Styles**: Test all available options
- 🎨 **Check Font Support**: Ensure your font supports the characters
- 🎨 **Use Compatible Emojis**: Stick to common emoji characters
- 🎨 **Refresh Document**: Apply changes with Ctrl+R

## 🔧 Advanced Troubleshooting

### Console Error Analysis

**How to Access Console:**
- **Windows/Linux**: `Ctrl+Shift+I` or `F12`
- **macOS**: `Cmd+Option+I`

**Common Error Messages:**

1. **"Cannot read property 'querySelector' of null"**
   - **Cause**: DOM element not found
   - **Solution**: Refresh document, check if in Reading view

2. **"TypeError: Cannot read property 'settings' of undefined"**
   - **Cause**: Plugin not properly initialized
   - **Solution**: Restart Obsidian, reinstall plugin

3. **"Maximum call stack size exceeded"**
   - **Cause**: Infinite loop in update logic
   - **Solution**: Increase update delay, check for circular references

### Performance Profiling

**Monitor Performance:**
1. Open **Developer Tools** → **Performance** tab
2. Start recording
3. Perform actions that cause lag
4. Stop recording and analyze results

**Performance Metrics:**
- **Update Frequency**: How often backreferences update
- **DOM Manipulation**: Time spent modifying the DOM
- **Memory Usage**: Check for memory leaks

### Debug Mode

**Enable Debug Logging:**
1. Open console (Ctrl+Shift+I)
2. Add this to console:
   ```javascript
   localStorage.setItem('footnote-backref-debug', 'true')
   ```
3. Refresh the document
4. Check for debug messages in console

**Debug Information:**
- Footnote parsing results
- DOM update operations
- Settings application
- Error details

## 📋 Diagnostic Report Template

When reporting issues, include this information:

```markdown
## System Information
- **Obsidian Version**: [Check Settings → About]
- **Plugin Version**: [Check Settings → Community Plugins]
- **Operating System**: [Windows/macOS/Linux version]
- **Vault Size**: [Number of files]

## Issue Description
- **What happened**: [Describe the issue]
- **Expected behavior**: [What should have happened]
- **Actual behavior**: [What actually happened]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Configuration
- **Enable Custom Label Display**: [ON/OFF]
- **Display Style**: [Brackets/Emoji/Superscript/Plain]
- **Update Delay**: [X]ms
- **Other Settings**: [List relevant settings]

## Error Messages
```
[Paste any console errors here]
```

## Additional Information
- **Other Plugins**: [List relevant plugins]
- **Theme**: [Current theme]
- **Recent Changes**: [Any recent changes to setup]
```

## 🆘 Getting Help

### Self-Help Resources
1. **📖 User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
2. **📖 Installation Guide**: [INSTALLATION.md](INSTALLATION.md)
3. **📋 FAQ**: Check [GitHub Discussions](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)

### Community Support
1. **💬 GitHub Discussions**: [Ask the community](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)
2. **🐛 GitHub Issues**: [Report bugs](https://github.com/rolltidehero/obsidian-footnotes-hero/issues)
3. **📧 Direct Contact**: [Contact via GitHub](https://github.com/rolltidehero)

### Emergency Solutions
If nothing else works:
1. **🔄 Complete Reset**: Uninstall and reinstall the plugin
2. **🔄 Fresh Vault**: Test in a new vault to isolate issues
3. **🔄 Clean Install**: Remove all plugin data and start fresh

---

**Remember**: Most issues can be resolved by checking the basic settings and ensuring the plugin is properly enabled. When in doubt, start with the Quick Diagnostic Checklist above. 