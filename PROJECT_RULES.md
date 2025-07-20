# Obsidian Footnote Backreference Synchronization Plugin - Project Rules

## Project Overview
This is an Obsidian plugin that enhances footnote functionality by synchronizing backreference display with actual footnote labels. The plugin replaces generic backreference icons (↩️) with the actual footnote label text (e.g., `[^video]` shows "video" instead of a generic icon).

## Current Project State

### ✅ What's Already Built
- **Plugin Infrastructure**: Complete TypeScript setup with Rollup build system
- **Footnote Creation**: Auto-incrementing numeric footnotes with smart insertion
- **Navigation Features**: Jump between footnote references and definitions
- **Command System**: Hotkey integration for footnote operations
- **Basic Parsing**: Regex patterns for numeric footnotes (`[^1]`, `[^2]`, etc.)

### ❌ What's Missing (Core Goal)
- **Backreference Synchronization**: Replace generic backreference icons with actual label text
- **Custom Label Support**: Handle non-numeric labels like `[^video]`, `[^source]`
- **Real-Time Updates**: Live synchronization during document editing
- **DOM Manipulation**: Locate and modify `.footnote-backref` nodes

## Development Guidelines

### Code Structure
- **Main File**: `main.ts` - Contains the core plugin class
- **Build System**: Rollup with TypeScript and hot-reload
- **Dependencies**: Obsidian API, TypeScript, Rollup plugins
- **Testing**: Unit tests for all core logic (to be implemented)

### Technical Requirements
1. **Performance**: Plugin must not impact Obsidian responsiveness
2. **Compatibility**: Work with existing Obsidian footnote features
3. **Error Handling**: Graceful degradation when features fail
4. **Memory Management**: Efficient handling of large documents
5. **Event Handling**: Proper cleanup and event listener management

### Obsidian Plugin Best Practices
- Use TypeScript for type safety
- Follow Obsidian's plugin API patterns
- Implement proper `onload()` and `unload()` lifecycle hooks
- Register commands and event listeners appropriately
- Handle workspace and file events correctly
- Use debouncing for frequent operations

## Feature Implementation Priority

### HIGH PRIORITY (Implement First)
1. **Core Backreference Synchronization**
   - Locate `.footnote-backref` nodes in DOM
   - Replace generic icons with actual label text
   - Preserve clickability and functionality
   - Handle both numeric and custom labels

2. **Real-Time Synchronization**
   - Listen for file edit/save events
   - Implement debounced updates
   - Handle dynamic DOM changes
   - Manage edge cases (deleted/reordered footnotes)

3. **Custom Label Support**
   - Extend regex patterns for non-numeric labels
   - Validate custom label formats
   - Handle mixed numeric and custom labels
   - Support special characters in labels

4. **Testing Framework**
   - Unit tests for parsing logic
   - Integration tests with Obsidian features
   - Performance testing on large documents
   - Edge case testing

### MEDIUM PRIORITY (Implement Second)
1. **User Preferences Panel**
   - Display style options (brackets, emoji, superscript)
   - Toggle for custom label display
   - Settings persistence
   - Label vs number priority options

2. **Enhanced Navigation**
   - Custom label navigation support
   - Multiple occurrence handling
   - Cross-document navigation
   - Updated jump logic for custom labels

3. **Documentation**
   - User setup instructions
   - Before/after screenshots
   - Custom label examples
   - Troubleshooting guide

### LOW PRIORITY (Future Enhancements)
1. **Advanced Features**
   - Smart label suggestions
   - Label templates
   - Bulk label management
   - Custom CSS styling

2. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast themes
   - RTL language support

## Code Implementation Rules

### When Adding New Features
1. **Preserve Existing Functionality**: Don't break current footnote navigation features
2. **Follow TypeScript Patterns**: Use proper types and interfaces
3. **Add Error Handling**: Graceful degradation for edge cases
4. **Performance First**: Optimize for large documents and frequent updates
5. **Test Thoroughly**: Unit tests for all new logic

### When Modifying Existing Code
1. **Backward Compatibility**: Ensure existing features still work
2. **Incremental Changes**: Make small, testable changes
3. **Document Changes**: Update comments and documentation
4. **Refactor Safely**: Use TypeScript to catch breaking changes

### DOM Manipulation Guidelines
1. **Target Specific Elements**: Use precise selectors for `.footnote-backref` nodes
2. **Preserve Functionality**: Maintain clickability and navigation
3. **Handle Edge Cases**: Account for missing or malformed elements
4. **Performance**: Minimize DOM queries and updates
5. **Cleanup**: Remove event listeners and references on unload

### Event Handling Rules
1. **Debounce Frequent Events**: Use debouncing for file changes and edits
2. **Proper Cleanup**: Remove all event listeners in `unload()`
3. **Error Boundaries**: Catch and handle event handler errors
4. **Memory Management**: Avoid memory leaks from event listeners

## Testing Requirements

### Unit Tests
- Footnote parsing logic
- Regex pattern matching
- Label validation
- DOM manipulation functions
- Event handling logic

### Integration Tests
- Interaction with Obsidian API
- File system operations
- Workspace event handling
- Plugin lifecycle management

### Performance Tests
- Large document handling
- Frequent update scenarios
- Memory usage monitoring
- Response time benchmarks

## Documentation Standards

### Code Documentation
- JSDoc comments for all public methods
- Inline comments for complex logic
- TypeScript interfaces for data structures
- README updates for new features

### User Documentation
- Clear setup instructions
- Visual examples with screenshots
- Troubleshooting guides
- Feature comparison with existing plugins

## Release Process

### Pre-Release Checklist
- [ ] All critical features implemented and tested
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Error handling comprehensive
- [ ] Cross-platform testing completed

### Release Steps
1. Update version numbers in `manifest.json` and `package.json`
2. Build production version
3. Test in clean Obsidian environment
4. Update changelog
5. Submit to Obsidian Community Plugins (if applicable)

## Common Pitfalls to Avoid

### Performance Issues
- Don't query DOM on every keystroke
- Use debouncing for frequent operations
- Cache parsed footnote data when possible
- Avoid synchronous operations in event handlers

### Compatibility Issues
- Don't break existing footnote navigation
- Test with different Obsidian versions
- Handle missing or malformed footnotes gracefully
- Don't assume DOM structure will remain constant

### User Experience Issues
- Don't make the plugin too intrusive
- Provide clear feedback for errors
- Make settings intuitive and discoverable
- Don't change user's existing workflow unnecessarily

## Success Criteria

### Technical Success
- [ ] Backreferences show actual label text instead of generic icons
- [ ] Custom labels work seamlessly with navigation
- [ ] Performance impact is minimal
- [ ] All edge cases handled gracefully

### User Success
- [ ] Users can easily understand and use custom labels
- [ ] Navigation between footnotes remains intuitive
- [ ] Settings are clear and useful
- [ ] Plugin enhances rather than complicates workflow

### Community Success
- [ ] Plugin is accepted into Obsidian Community Plugins
- [ ] Positive user feedback and ratings
- [ ] Active community support
- [ ] Regular maintenance and updates

---

## Quick Reference

### Key Files
- `main.ts` - Core plugin logic
- `manifest.json` - Plugin metadata
- `package.json` - Dependencies and scripts
- `rollup.config.js` - Build configuration
- `tsconfig.json` - TypeScript configuration

### Key Commands
- `npm run dev` - Development with hot-reload
- `npm run build` - Production build
- `Ctrl+Shift+6` - Default footnote hotkey (user-configurable)

### Key Classes
- `MyPlugin` - Main plugin class extending `Plugin`
- `MarkdownView` - Obsidian markdown view interface
- `CodeMirror.Editor` - Editor instance for text manipulation

### Key Events
- `file-open` - When a file is opened
- `file-save` - When a file is saved
- `workspace-change` - When workspace changes
- `editor-change` - When editor content changes 