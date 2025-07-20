# Footnote Backreference Synchronization Plugin for Obsidian

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/rolltidehero/obsidian-footnotes-hero)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.9.12+-purple.svg)](https://obsidian.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Transform your footnote experience** by replacing generic backreference icons with actual footnote labels for better navigation and clarity.

## 🚀 Features

### ✨ Core Functionality
- **🔄 Real-time Synchronization**: Backreferences update automatically as you edit
- **🎯 Custom Label Support**: Works with both numeric (`[^1]`) and custom labels (`[^video]`, `[^source]`)
- **⚡ Performance Optimized**: Debounced updates prevent lag during editing
- **🔗 Preserved Navigation**: All existing footnote features continue to work seamlessly

### 🎨 User Preferences Panel
- **🎛️ Complete Customization**: 8 different settings to personalize your experience
- **📱 Multiple Display Styles**: Brackets, emoji, superscript, or plain text
- **⚙️ Performance Tuning**: Adjustable update delays for optimal performance
- **🎯 Visual Feedback**: Hover effects and tooltips for better UX

## 📸 Before & After

### Before (Default Obsidian)
```markdown
This is a sentence with a footnote[^1] and a custom label[^video].

[^1]: Numeric footnote definition
[^video]: Video reference definition
```
*Backreferences show generic icons: ↩️ ↩️*

### After (With Plugin)
```markdown
This is a sentence with a footnote[^1] and a custom label[^video].

[^1]: Numeric footnote definition
[^video]: Video reference definition
```
*Backreferences show actual labels: [1] video*

## 🛠️ Installation

### Method 1: Community Plugins (Recommended)
1. Open **Settings** → **Community Plugins**
2. Turn off **Safe mode**
3. Click **Browse** and search for "Footnote Backreference Synchronization"
4. Click **Install**, then **Enable**

### Method 2: Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/rolltidehero/obsidian-footnotes-hero/releases)
2. Extract the files to your vault's plugins folder:
   ```
   {vault}/.obsidian/plugins/obsidian-footnotes/
   ```
3. Enable the plugin in **Settings** → **Community Plugins**

## 🎯 Quick Start

### 1. Basic Usage
The plugin works automatically with existing footnotes:

```markdown
Here's a sentence with a numeric footnote[^1] and a custom label[^video].

[^1]: This is a numeric footnote definition.
[^video]: This is a video reference with custom label.
```

### 2. Customize Display
Go to **Settings** → **Community Plugins** → **Footnote Backreference Synchronization** to customize:

- **Display Style**: Choose brackets, emoji, superscript, or plain text
- **Performance**: Adjust update delay for your workflow
- **Visual Effects**: Enable/disable hover effects and tooltips

### 3. Advanced Features
- **Mixed Labels**: Use both numeric and custom labels in the same document
- **Real-time Updates**: Changes apply immediately as you type
- **Navigation**: Click backreferences to jump to footnote definitions

## ⚙️ Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Enable Custom Label Display** | Toggle | ✅ | Master toggle for the feature |
| **Display Style** | Dropdown | Brackets | Visual style for backreferences |
| **Custom Emoji** | Text | ↩️ | Emoji for emoji display style |
| **Show Both Label and Number** | Toggle | ❌ | Display both simultaneously |
| **Label Priority** | Dropdown | Auto | Smart label selection |
| **Update Delay** | Slider | 300ms | Performance tuning |
| **Enable Hover Effects** | Toggle | ✅ | Visual feedback on hover |
| **Show Tooltips** | Toggle | ❌ | Helpful tooltips |

## 📖 Usage Examples

### Academic Writing
```markdown
This research builds on previous work[^smith2020] and introduces new methodology[^methodology].

[^smith2020]: Smith, J. (2020). Previous research findings.
[^methodology]: Detailed methodology description.
```

### Content Creation
```markdown
Watch this tutorial[^video] and check the source code[^github].

[^video]: Link to video tutorial
[^github]: GitHub repository link
```

### Research Notes
```markdown
Important quote from the interview[^quote] and statistical data[^stats].

[^quote]: "This is a significant finding..."
[^stats]: 85% of participants agreed...
```

## 🎨 Display Style Examples

### Brackets Style (Default)
```
[1] [video] [source]
```

### Emoji Style
```
↩️ 1 ↩️ video ↩️ source
```

### Superscript Style
```
¹ ᵛⁱᵈᵉᵒ ˢᵒᵘʳᶜᵉ
```

### Plain Style
```
1 video source
```

## 🔧 Troubleshooting

### Backreferences Not Updating
1. ✅ Check that "Enable Custom Label Display" is enabled
2. ✅ Verify the plugin is enabled in Community Plugins
3. ✅ Try refreshing the document (Ctrl+R)
4. ✅ Check the console for error messages (Ctrl+Shift+I)

### Performance Issues
1. ⚡ Increase the Update Delay setting (500-700ms for large documents)
2. ⚡ Disable hover effects if not needed
3. ⚡ Close unnecessary documents
4. ⚡ Restart Obsidian if issues persist

### Custom Labels Not Working
1. 🔍 Ensure custom labels follow the format `[^label]`
2. 🔍 Check that definitions exist at the bottom of the document
3. 🔍 Verify the label matches exactly between reference and definition

## 🚀 Advanced Features

### Performance Optimization
- **Large Documents**: Use 500-700ms update delay
- **Frequent Editing**: Use 100-200ms for real-time feedback
- **Mixed Content**: Enable "Show Both Label and Number" for clarity

### Custom Styling
- **Minimal Impact**: Use "Plain" display style
- **Academic Papers**: Use "Brackets" or "Superscript"
- **Creative Writing**: Use "Emoji" with custom symbols

### Keyboard Shortcuts
The plugin preserves all existing footnote shortcuts:
- **Default**: `Ctrl+Shift+6` (configurable in Hotkeys settings)
- **Function**: Insert footnote and navigate between references/definitions

## 📋 Compatibility

- **Obsidian Version**: 0.9.12 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Other Plugins**: Compatible with most footnote-related plugins
- **Themes**: Works with all Obsidian themes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/rolltidehero/obsidian-footnotes-hero.git
cd obsidian-footnotes-hero
npm install
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Obsidian Team** for the amazing platform and plugin API
- **Community Contributors** for feedback and suggestions
- **Beta Testers** for helping refine the user experience

## 📞 Support

- **📖 Documentation**: [User Guide](USER_GUIDE.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/rolltidehero/obsidian-footnotes-hero/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/rolltidehero/obsidian-footnotes-hero/discussions)
- **📧 Email**: [Contact via GitHub](https://github.com/rolltidehero)

---

**Made with ❤️ for the Obsidian community**

[![GitHub stars](https://img.shields.io/github/stars/rolltidehero/obsidian-footnotes-hero?style=social)](https://github.com/rolltidehero/obsidian-footnotes-hero)
[![GitHub forks](https://img.shields.io/github/forks/rolltidehero/obsidian-footnotes-hero?style=social)](https://github.com/rolltidehero/obsidian-footnotes-hero)
