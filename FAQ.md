# Frequently Asked Questions (FAQ) - Footnote Backreference Synchronization Plugin

## 🤔 General Questions

### Q: What does this plugin do?
**A:** This plugin enhances Obsidian's footnote functionality by replacing generic backreference icons (↩️) with actual footnote labels. Instead of seeing generic icons, you'll see the actual label text like `[1]`, `video`, `source`, etc., making it much easier to navigate between footnotes and their definitions.

### Q: How is this different from other footnote plugins?
**A:** This plugin specifically focuses on **backreference synchronization** - making the backreference display match your actual footnote labels. Other plugins might handle footnote creation, navigation, or formatting, but this one ensures your backreferences show meaningful labels instead of generic icons.

### Q: Does this plugin replace Obsidian's built-in footnote functionality?
**A:** No! This plugin **enhances** Obsidian's existing footnote features. All the built-in functionality (creation, navigation, hotkeys) continues to work exactly as before. This plugin only changes how backreferences are displayed.

### Q: Is this plugin compatible with other footnote plugins?
**A:** Generally yes, but there may be conflicts with plugins that also modify footnote display. If you experience issues, try disabling other footnote-related plugins temporarily to identify conflicts.

## 🛠️ Installation & Setup

### Q: How do I install the plugin?
**A:** 
1. Go to **Settings** → **Community Plugins**
2. Turn off **Safe mode**
3. Click **Browse** and search for "Footnote Backreference Synchronization"
4. Click **Install**, then **Enable**

For manual installation, see our [Installation Guide](INSTALLATION.md).

### Q: The plugin is installed but not working. What should I check?
**A:** 
1. ✅ Ensure the plugin is **enabled** in Community Plugins
2. ✅ Check that **"Enable Custom Label Display"** is turned ON in plugin settings
3. ✅ Make sure you're viewing documents in **Reading mode** (not Editing mode)
4. ✅ Try refreshing the document (Ctrl+R)
5. ✅ Check the console for error messages (Ctrl+Shift+I)

### Q: Do I need to configure anything after installation?
**A:** The plugin works out of the box with default settings, but you can customize:
- **Display Style**: Choose brackets, emoji, superscript, or plain text
- **Update Delay**: Adjust for performance (300ms is recommended)
- **Visual Effects**: Enable/disable hover effects and tooltips

## 📝 Usage Questions

### Q: What footnote formats does the plugin support?
**A:** The plugin supports both:
- **Numeric labels**: `[^1]`, `[^2]`, `[^3]`
- **Custom labels**: `[^video]`, `[^source]`, `[^quote]`, `[^methodology]`

### Q: Can I use both numeric and custom labels in the same document?
**A:** Yes! You can mix numeric and custom labels freely:
```markdown
This research[^1] builds on previous work[^smith2020] and introduces new methodology[^methodology].

[^1]: General reference
[^smith2020]: Smith, J. (2020). Previous research.
[^methodology]: Detailed methodology description.
```

### Q: Do I need to change how I create footnotes?
**A:** No! You can continue using your existing footnote workflow. The plugin works with:
- Obsidian's built-in footnote hotkey (default: Ctrl+Shift+6)
- Manually typed footnotes
- Existing footnotes in your documents

### Q: Why don't I see changes when I'm editing?
**A:** Backreferences only update in **Reading mode**. This is by design because:
- The plugin modifies the rendered view, not the source text
- Changes appear when you switch to Reading mode or refresh the document
- This prevents interference with your editing workflow

## ⚙️ Settings & Customization

### Q: What are the different display styles?
**A:** 
- **Brackets**: Shows `[label]` (default)
- **Emoji**: Shows `↩️ label` with customizable emoji
- **Superscript**: Shows labels as small, raised text
- **Plain**: Shows just the label text without formatting

### Q: How do I change the emoji for emoji display style?
**A:** 
1. Go to **Settings** → **Community Plugins** → **Footnote Backreference Synchronization**
2. Set **Display Style** to "Emoji"
3. The **Custom Emoji** setting will appear
4. Enter your preferred emoji (default: ↩️)

### Q: What does "Show Both Label and Number" do?
**A:** When enabled, this displays both the label and number for all footnotes. For example:
- `[^1]` shows as `[1]`
- `[^video]` shows as `[video]`
- Useful for documents with mixed footnote types

### Q: What's the difference between the label priority options?
**A:** 
- **Auto**: Smart selection (numeric as numbers, custom as labels)
- **Label**: Always show custom labels when available
- **Number**: Always show numbers when available

### Q: How do I adjust performance settings?
**A:** Use the **Update Delay** setting:
- **100-200ms**: Fast updates, good for frequent editing
- **300ms**: Balanced performance (default)
- **500-700ms**: Better performance for large documents
- **800-1000ms**: Maximum performance, slower updates

## 🔧 Technical Questions

### Q: Does the plugin affect my markdown files?
**A:** No! The plugin only modifies the **display** of footnotes in Obsidian's rendered view. Your source markdown files remain unchanged. If you disable the plugin, everything returns to normal.

### Q: Will this work with my theme?
**A:** Yes! The plugin uses Obsidian's CSS variables and should work with all themes. If you notice styling issues, you can:
- Try different display styles
- Disable hover effects
- Use the "Plain" display style for minimal visual impact

### Q: Does the plugin work with mobile Obsidian?
**A:** The plugin should work with mobile Obsidian, but some features (like hover effects) may not be available on touch devices. The core functionality remains the same.

### Q: How does the plugin handle large documents?
**A:** The plugin is optimized for performance:
- **Debounced updates** prevent excessive processing
- **Configurable update delays** let you balance speed vs performance
- **Selective DOM updates** only modify necessary elements
- For very large documents, increase the update delay to 500-700ms

### Q: What happens if I have duplicate footnote labels?
**A:** The plugin will display the label for all instances of the same footnote. If you have multiple `[^1]` references, all backreferences will show `[1]`. This is the expected behavior for footnotes.

## 🐛 Troubleshooting

### Q: Backreferences are still showing generic icons. What's wrong?
**A:** Check these common issues:
1. **Plugin not enabled**: Go to Settings → Community Plugins
2. **Feature not enabled**: Check "Enable Custom Label Display" in plugin settings
3. **Wrong view mode**: Switch to Reading mode
4. **Incorrect format**: Ensure footnotes follow `[^label]` format
5. **Console errors**: Check for error messages (Ctrl+Shift+I)

### Q: The plugin is making Obsidian slow. How can I fix this?
**A:** Try these performance optimizations:
1. **Increase Update Delay** to 500-700ms
2. **Disable hover effects** if not needed
3. **Close unnecessary documents**
4. **Restart Obsidian** to clear memory
5. **Check for plugin conflicts**

### Q: Custom labels aren't working. What should I check?
**A:** 
1. **Format**: Ensure `[^label]: definition` format
2. **Matching**: Labels must match exactly between reference and definition
3. **Simple labels**: Try with basic labels first (avoid special characters)
4. **Console errors**: Check for parsing errors

### Q: Settings aren't saving between sessions. How do I fix this?
**A:** 
1. **Check permissions**: Ensure Obsidian has write access to the plugins folder
2. **File location**: Verify vault is not in a restricted location
3. **Reinstall**: Try removing and reinstalling the plugin
4. **Clear settings**: Delete the plugin's data.json file and reconfigure

## 🚀 Advanced Usage

### Q: Can I use special characters in custom labels?
**A:** Yes, but with some limitations:
- **Recommended**: Letters, numbers, hyphens, underscores
- **Avoid**: Spaces, special symbols, emojis in labels
- **Test**: If a label doesn't work, try a simpler version

### Q: How do I create footnotes for academic writing?
**A:** Use descriptive labels for better navigation:
```markdown
This research builds on previous work[^smith2020] and introduces new methodology[^methodology].

[^smith2020]: Smith, J. (2020). Previous research findings.
[^methodology]: Detailed methodology description.
```

### Q: Can I use this for content creation and tutorials?
**A:** Absolutely! Use meaningful labels:
```markdown
Watch this tutorial[^video] and check the source code[^github].

[^video]: Link to video tutorial
[^github]: GitHub repository link
```

### Q: How do I optimize for different use cases?
**A:** 
- **Academic writing**: Use "Brackets" or "Superscript" style
- **Content creation**: Use "Emoji" style with custom symbols
- **Minimal impact**: Use "Plain" style
- **Large documents**: Increase update delay to 500-700ms
- **Frequent editing**: Use 100-200ms update delay

## 📚 Best Practices

### Q: What are some good naming conventions for custom labels?
**A:** 
- **Academic**: `[^author2020]`, `[^methodology]`, `[^results]`
- **Content**: `[^video]`, `[^source]`, `[^tutorial]`
- **Research**: `[^quote]`, `[^stats]`, `[^interview]`
- **Technical**: `[^code]`, `[^api]`, `[^docs]`

### Q: How should I organize footnotes in large documents?
**A:** 
- Use descriptive labels for easy navigation
- Group related footnotes with similar prefixes
- Consider using "Show Both Label and Number" for clarity
- Use consistent naming conventions throughout

### Q: What's the best way to handle multiple references to the same source?
**A:** Use the same label for all references to the same source:
```markdown
This concept[^smith2020] is further developed[^smith2020] in later work.

[^smith2020]: Smith, J. (2020). Comprehensive reference.
```

## 🤝 Support & Community

### Q: Where can I get help if I have issues?
**A:** 
1. **📖 Documentation**: Check our [User Guide](USER_GUIDE.md) and [Troubleshooting Guide](TROUBLESHOOTING.md)
2. **💬 Community**: Ask in [GitHub Discussions](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)
3. **🐛 Bug Reports**: Create an issue on [GitHub](https://github.com/rolltidehero/obsidian-footnotes-hero/issues)
4. **📧 Direct Contact**: [Contact via GitHub](https://github.com/rolltidehero)

### Q: How can I contribute to the plugin?
**A:** 
- **Report bugs** with detailed information
- **Suggest features** in GitHub Discussions
- **Share feedback** about your experience
- **Contribute code** via pull requests
- **Help others** in the community

### Q: Is there a way to test the plugin before installing?
**A:** You can:
- **Read the documentation** to understand features
- **Check the GitHub repository** for screenshots and examples
- **Ask the community** about their experience
- **Try in a test vault** first before using in your main vault

---

**Still have questions?** Check out our [Troubleshooting Guide](TROUBLESHOOTING.md) or ask the community in [GitHub Discussions](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)! 