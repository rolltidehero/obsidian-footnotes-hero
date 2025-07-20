# Changelog

All notable changes to the Obsidian Footnote Backreference Synchronization Plugin will be documented in this file.

## [0.2.0] - 2024-12-19

### Added
- **User Preferences Panel**
  - Complete settings tab in Obsidian plugin settings
  - Enable/disable custom label display toggle
  - Display style options: brackets, emoji, superscript, plain text
  - Custom emoji selection for emoji display style
  - Show both label and number option
  - Label priority settings: auto, label, number
  - Performance tuning with adjustable debounce delay (100-1000ms)
  - Hover effects toggle for backreference interactions
  - Tooltip display option for enhanced user experience
  - Real-time settings preview and refresh functionality
  - Settings persistence between sessions

### Enhanced
- **Settings Integration**
  - All backreference functionality now respects user preferences
  - Dynamic display style application based on settings
  - Conditional rendering based on enabled/disabled state
  - Performance optimization through configurable debounce delays
  - Improved user experience with customizable interactions

### Technical Improvements
- **Settings Management**
  - TypeScript interfaces for type-safe settings
  - Default settings configuration
  - Automatic settings loading and saving
  - Real-time settings application without restart
  - Settings validation and error handling

- **UI/UX Enhancements**
  - Intuitive settings organization with clear sections
  - Visual preview of settings effects
  - Responsive settings controls with proper validation
  - Accessibility improvements with proper labels and descriptions
  - Consistent styling with Obsidian's design system

### Files Modified
- `main.ts` - Added comprehensive settings system and UI
- `RULES.TASKS.md` - Updated task completion status
- `changelog.md` - Added new version documentation

### Settings Options
- **Enable Custom Label Display**: Master toggle for the feature
- **Display Style**: Choose between brackets, emoji, superscript, or plain text
- **Custom Emoji**: Set custom emoji for emoji display style
- **Show Both Label and Number**: Display both label and number simultaneously
- **Label Priority**: Choose between auto, label, or number priority
- **Update Delay**: Adjust performance with debounce delay (100-1000ms)
- **Enable Hover Effects**: Toggle underline effects on hover
- **Show Tooltips**: Enable tooltip display for backreferences

---

## [0.1.0] - 2024-12-19

### Added
- **Core Backreference Synchronization Feature**
  - Replace generic backreference icons (↩️) with actual footnote label text
  - Support for both numeric labels (`[^1]`, `[^2]`) and custom labels (`[^video]`, `[^source]`)
  - Real-time synchronization with debounced updates (300ms delay)
  - Automatic DOM manipulation of `.footnote-backref` elements
  - Preservation of clickability and navigation functionality

### Enhanced
- **Extended Footnote Parsing**
  - Updated regex patterns to support non-numeric labels: `/\[\^([^\]]+)\]/gi`
  - Enhanced parsing logic to handle mixed numeric and custom labels
  - Improved footnote data structure with `FootnoteData` interface
  - Better handling of special characters in custom labels

### Technical Improvements
- **Event Handling**
  - Added file modification event listeners (`app.vault.on('modify')`)
  - Added workspace layout change listeners
  - Implemented proper event cleanup in `onunload()`
  - Debounced updates to prevent performance issues

- **DOM Manipulation**
  - Custom styling for backreference text with hover effects
  - Fallback handling for missing or malformed footnotes
  - Prevention of duplicate processing with `data-custom-backref` attribute
  - Graceful error handling for DOM operations

### Compatibility
- **Existing Features Preserved**
  - All existing footnote navigation features continue to work
  - Auto-incrementing numeric footnotes still function
  - Jump between references and definitions maintained
  - Hotkey integration preserved

### Files Modified
- `main.ts` - Core plugin implementation with backreference synchronization
- `test-footnotes.md` - Test file with various footnote types
- `RULES.TASKS.md` - Updated task completion status
- `FEATURES.md` - Comprehensive feature documentation
- `PROJECT_RULES.md` - Development guidelines and rules

### Known Limitations
- Multi-line footnote definitions may need additional testing
- Edge cases with deleted/reordered footnotes need further validation
- Performance testing on very large documents pending
- Unit tests not yet implemented

### Next Steps
- Implement user preferences panel for display customization
- Add comprehensive testing framework
- Create user documentation with screenshots
- Performance optimization for large documents
- Handle edge cases for deleted/reordered footnotes

---

## [0.0.7] - Previous Version

### Original Features
- Footnote creation with auto-incrementing numbers
- Navigation between footnote references and definitions
- Hotkey integration for footnote operations
- Basic TypeScript plugin structure

### Technical Foundation
- Rollup build system with hot-reload
- TypeScript configuration
- Obsidian plugin API integration
- Basic event handling 