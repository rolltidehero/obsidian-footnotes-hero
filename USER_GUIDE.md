# User Guide - Footnote Backreference Synchronization Plugin

## Overview

The Footnote Backreference Synchronization Plugin enhances Obsidian's footnote functionality by replacing generic backreference icons (↩️) with actual footnote label text. This makes it much easier to navigate between footnotes and their definitions, especially when using custom labels like `[^video]` or `[^source]`.

## Features

### Core Functionality
- **Custom Label Display**: Replace generic backreference icons with actual footnote labels
- **Real-time Synchronization**: Updates automatically when you edit footnotes
- **Mixed Label Support**: Works with both numeric (`[^1]`, `[^2]`) and custom labels (`[^video]`, `[^source]`)
- **Preserved Navigation**: All existing footnote navigation features continue to work
- **Performance Optimized**: Debounced updates prevent performance issues

### User Preferences Panel
- **Complete Customization**: Extensive settings for personalizing the experience
- **Display Style Options**: Choose from brackets, emoji, superscript, or plain text
- **Performance Tuning**: Adjustable update delays for optimal performance
- **Visual Feedback**: Hover effects and tooltips for better user experience

## Installation

1. **Manual Installation**:
   - Download the plugin files
   - Place them in your Obsidian plugins folder: `{vault}/.obsidian/plugins/obsidian-footnotes/`
   - Enable the plugin in Obsidian Settings → Community Plugins

2. **Community Plugins** (when available):
   - Go to Settings → Community Plugins
   - Turn off Safe mode
   - Browse and search for "Footnote Backreference Synchronization"
   - Install and enable the plugin

## Basic Usage

### Creating Footnotes
The plugin preserves all existing footnote functionality:

1. **Auto-incrementing Footnotes**: Use your configured hotkey (default: `Ctrl+Shift+6`) to create footnotes
2. **Navigation**: Click on footnote references to jump to definitions, and vice versa
3. **Custom Labels**: Manually type custom labels like `[^video]` or `[^source]`

### Example Usage

```markdown
Here's a sentence with a numeric footnote[^1] and a custom label footnote[^video].

[^1]: This is a numeric footnote definition.
[^video]: This is a video reference with custom label.
```

**Before Plugin**: Backreferences show generic icons (↩️)
**After Plugin**: Backreferences show actual labels (`[1]`, `video`)

## User Preferences Panel

Access the settings by going to **Settings → Community Plugins → Footnote Backreference Synchronization**.

### Main Settings

#### Enable Custom Label Display
- **Purpose**: Master toggle for the entire feature
- **Default**: Enabled
- **Usage**: Turn off to revert to default Obsidian behavior

#### Display Options

**Display Style**
- **Brackets**: Shows labels in brackets `[label]` (default)
- **Emoji**: Shows emoji followed by label `↩️ label`
- **Superscript**: Shows labels as superscript text
- **Plain**: Shows labels as plain text without formatting

**Custom Emoji** (only visible when Emoji style is selected)
- **Purpose**: Choose your preferred emoji for emoji display style
- **Default**: ↩️
- **Usage**: Enter any emoji or symbol

**Show Both Label and Number**
- **Purpose**: Display both the label and number for all footnotes
- **Default**: Disabled
- **Usage**: Useful for documents with mixed footnote types

**Label Priority**
- **Auto**: Smart selection (numeric as numbers, custom as labels) (default)
- **Label**: Always show custom labels when available
- **Number**: Always show numbers when available

### Performance & Behavior

**Update Delay**
- **Purpose**: Control how quickly backreferences update after changes
- **Range**: 100-1000 milliseconds
- **Default**: 300ms
- **Usage**: Lower values = faster updates, higher values = better performance

**Enable Hover Effects**
- **Purpose**: Show underline effect when hovering over backreferences
- **Default**: Enabled
- **Usage**: Provides visual feedback for interactive elements

**Show Tooltips**
- **Purpose**: Display helpful tooltips when hovering over backreferences
- **Default**: Disabled
- **Usage**: Shows "Back to footnote: [label]" on hover

### Preview Section
The settings panel includes a preview section showing how your current settings will affect the display of backreferences.

## Advanced Usage

### Custom Label Examples

```markdown
# Academic Writing
This research builds on previous work[^smith2020] and introduces new methodology[^methodology].

[^smith2020]: Smith, J. (2020). Previous research findings.
[^methodology]: Detailed methodology description.

# Content Creation
Watch this tutorial[^video] and check the source code[^github].

[^video]: Link to video tutorial
[^github]: GitHub repository link

# Research Notes
Important quote from the interview[^quote] and statistical data[^stats].

[^quote]: "This is a significant finding..."
[^stats]: 85% of participants agreed...
```

### Performance Tips

1. **Large Documents**: Increase the Update Delay to 500-700ms for better performance
2. **Frequent Editing**: Use lower Update Delay (100-200ms) for real-time feedback
3. **Mixed Content**: Enable "Show Both Label and Number" for clarity
4. **Custom Styling**: Use "Plain" display style for minimal visual impact

### Troubleshooting

**Backreferences not updating:**
1. Check that "Enable Custom Label Display" is enabled
2. Verify the plugin is enabled in Community Plugins
3. Try refreshing the document (Ctrl+R)
4. Check the console for error messages

**Performance issues:**
1. Increase the Update Delay setting
2. Disable hover effects if not needed
3. Close unnecessary documents
4. Restart Obsidian if issues persist

**Custom labels not working:**
1. Ensure custom labels follow the format `[^label]`
2. Check that definitions exist at the bottom of the document
3. Verify the label matches exactly between reference and definition

## Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Enable Custom Label Display | Toggle | Enabled | Master toggle for the feature |
| Display Style | Dropdown | Brackets | How backreferences are displayed |
| Custom Emoji | Text | ↩️ | Emoji for emoji display style |
| Show Both Label and Number | Toggle | Disabled | Display both label and number |
| Label Priority | Dropdown | Auto | Which label type to prioritize |
| Update Delay | Slider | 300ms | Delay before updating backreferences |
| Enable Hover Effects | Toggle | Enabled | Show hover effects |
| Show Tooltips | Toggle | Disabled | Display tooltips on hover |

## Keyboard Shortcuts

The plugin preserves all existing footnote keyboard shortcuts:

- **Default Hotkey**: `Ctrl+Shift+6` (configurable in Hotkeys settings)
- **Function**: Insert footnote and navigate between references/definitions

## Compatibility

- **Obsidian Version**: 0.9.12 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Other Plugins**: Compatible with most other footnote-related plugins
- **Themes**: Works with all Obsidian themes

## Support

For issues, feature requests, or questions:

1. **Check the console** for error messages (Ctrl+Shift+I)
2. **Review settings** to ensure proper configuration
3. **Test with minimal setup** to isolate issues
4. **Report bugs** with detailed information about your setup

## Changelog

See `changelog.md` for detailed version history and feature updates.

---

**Version**: 0.2.0  
**Last Updated**: December 19, 2024 