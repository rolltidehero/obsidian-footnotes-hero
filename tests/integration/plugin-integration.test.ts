import { createMockSettings, createMockFootnoteElement, waitFor } from '../setup';
import { createMockMarkdownView, createMockWorkspaceLeaf, App } from '../mocks/obsidian';

// Mock plugin class for integration testing
class MockPlugin {
  settings: any;
  app: any;
  cache: Map<string, any> = new Map();
  processingQueue: Set<string> = new Set();

  constructor(app: any, settings: any) {
    this.app = app;
    this.settings = settings;
  }

  updateBackreferences() {
    if (!this.settings.enableCustomLabels) {
      return;
    }

    const leaves = this.app.workspace.getLeavesOfType('markdown');
    leaves.forEach((leaf: any) => {
      if (leaf.view && leaf.view.data) {
        this.updateBackreferencesForView(leaf.view);
      }
    });
  }

  updateBackreferencesForView(mdView: any) {
    const filePath = mdView.file?.path || 'test';
    
    if (this.processingQueue.has(filePath)) {
      return;
    }

    this.processingQueue.add(filePath);

    try {
      const contentEl = mdView.contentEl;
      if (!contentEl) {
        this.processingQueue.delete(filePath);
        return;
      }

      // Check cache first
      let footnotes = this.cache.get(filePath);
      if (!footnotes) {
        footnotes = this.parseFootnotes(mdView.data);
        this.cache.set(filePath, footnotes);
      }

      this.updateBackreferenceElements(contentEl, footnotes);
      this.processingQueue.delete(filePath);
    } catch (error) {
      console.error('Error updating backreferences:', error);
      this.processingQueue.delete(filePath);
    }
  }

  parseFootnotes(markdownText: string): Map<string, any> {
    const footnotes = new Map<string, any>();
    const reOnlyMarkers = /\[\^([^\]]+)\]/gi;
    const detailLineRegex = /\[\^([^\]]+)\]\:/;
    
    // Find all footnote references
    const referenceMatches = markdownText.matchAll(reOnlyMarkers);
    for (const match of referenceMatches) {
      const label = match[1];
      if (!footnotes.has(label)) {
        footnotes.set(label, {
          label: label,
          references: [],
          definition: ''
        });
      }
      footnotes.get(label)!.references.push(match[0]);
    }

    // Find all footnote definitions
    const definitionMatches = markdownText.matchAll(detailLineRegex);
    for (const match of definitionMatches) {
      const label = match[1];
      if (footnotes.has(label)) {
        const definitionStart = match.index! + match[0].length;
        const definitionEnd = markdownText.indexOf('\n', definitionStart);
        const definition = definitionEnd !== -1 
          ? markdownText.substring(definitionStart, definitionEnd).trim()
          : markdownText.substring(definitionStart).trim();
        
        footnotes.get(label)!.definition = definition;
      }
    }

    return footnotes;
  }

  updateBackreferenceElements(contentEl: HTMLElement, footnotes: Map<string, any>) {
    const backrefElements = contentEl.querySelectorAll('.footnote-backref');
    
    backrefElements.forEach((backrefEl) => {
      try {
        this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
      } catch (error) {
        console.error('Error updating single backreference:', error);
      }
    });
  }

  updateSingleBackreference(backrefEl: HTMLElement, footnotes: Map<string, any>) {
    const href = backrefEl.getAttribute('href');
    if (!href) return;

    const labelMatch = href.match(/#fnref:(.+)$/);
    if (!labelMatch) return;

    const label = labelMatch[1];
    const footnoteData = footnotes.get(label);
    
    if (!footnoteData) return;

    if (backrefEl.hasAttribute('data-custom-backref')) {
      return;
    }

    const customText = this.createCustomBackreferenceText(footnoteData);
    this.replaceBackreferenceContent(backrefEl, customText, label);
    backrefEl.setAttribute('data-custom-backref', 'true');
  }

  createCustomBackreferenceText(footnoteData: any): string {
    const label = footnoteData.label;
    const isNumeric = /(\d+)/.test(label);
    
    let displayText = '';
    
    if (this.settings.showBothLabelAndNumber) {
      displayText = `[${label}]`;
    } else {
      switch (this.settings.labelPriority) {
        case 'label':
          displayText = this.cleanLabel(label);
          break;
        case 'number':
          if (isNumeric) {
            displayText = label;
          } else {
            displayText = this.cleanLabel(label);
          }
          break;
        case 'auto':
        default:
          if (isNumeric) {
            displayText = `[${label}]`;
          } else {
            displayText = this.cleanLabel(label);
          }
          break;
      }
    }

    return this.applyDisplayStyle(displayText);
  }

  cleanLabel(label: string): string {
    return label.replace(/[^\w\s-]/g, '') || label;
  }

  applyDisplayStyle(text: string): string {
    switch (this.settings.displayStyle) {
      case 'emoji':
        return `${this.settings.customEmoji} ${text}`;
      case 'superscript':
        return `<sup>${text}</sup>`;
      case 'plain':
        return text;
      case 'brackets':
      default:
        return text.startsWith('[') ? text : `[${text}]`;
    }
  }

  replaceBackreferenceContent(backrefEl: HTMLElement, customText: string, label: string) {
    backrefEl.innerHTML = '';
    
    const textSpan = document.createElement('span');
    
    if (this.settings.displayStyle === 'superscript') {
      textSpan.innerHTML = customText;
    } else {
      textSpan.textContent = customText;
    }
    
    textSpan.className = 'custom-backref-text';
    
    const styles = [
      'color: var(--text-accent)',
      'font-weight: 500',
      'cursor: pointer'
    ];

    if (this.settings.displayStyle === 'superscript') {
      styles.push('font-size: 0.8em');
      styles.push('vertical-align: super');
    }

    textSpan.style.cssText = styles.join('; ');
    backrefEl.appendChild(textSpan);
    
    if (this.settings.showTooltips) {
      backrefEl.title = `Back to footnote: ${label}`;
    }
  }
}

describe('Plugin Integration Tests', () => {
  let app: App;
  let plugin: MockPlugin;
  let container: HTMLElement;

  beforeEach(() => {
    app = new App();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Backreference Updates', () => {
    it('should update backreferences when plugin is enabled', () => {
      const settings = createMockSettings({ enableCustomLabels: true });
      plugin = new MockPlugin(app, settings);

      // Create mock markdown view with footnotes
      const markdownData = `
This is a test[^1] with footnotes[^video].

[^1]: Numeric footnote definition.
[^video]: Video reference definition.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      
      // Add footnote backreference elements to the DOM
      const backref1 = createMockFootnoteElement('#fnref:1');
      const backref2 = createMockFootnoteElement('#fnref:video');
      mdView.contentEl.appendChild(backref1);
      mdView.contentEl.appendChild(backref2);

      // Create workspace leaf
      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      // Update backreferences
      plugin.updateBackreferences();

      // Check that backreferences were updated
      expect(backref1.textContent).toBe('[1]');
      expect(backref2.textContent).toBe('video');
      expect(backref1.hasAttribute('data-custom-backref')).toBe(true);
      expect(backref2.hasAttribute('data-custom-backref')).toBe(true);
    });

    it('should not update backreferences when plugin is disabled', () => {
      const settings = createMockSettings({ enableCustomLabels: false });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^1].

[^1]: Footnote definition.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref = createMockFootnoteElement('#fnref:1');
      mdView.contentEl.appendChild(backref);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      plugin.updateBackreferences();

      // Backreference should remain unchanged
      expect(backref.textContent).toBe('↩️');
      expect(backref.hasAttribute('data-custom-backref')).toBe(false);
    });

    it('should apply different display styles correctly', () => {
      const testCases = [
        { style: 'brackets', expected: '[1]' },
        { style: 'emoji', expected: '↩️ 1' },
        { style: 'plain', expected: '1' },
        { style: 'superscript', expected: '<sup>1</sup>' }
      ];

      testCases.forEach(({ style, expected }) => {
        const settings = createMockSettings({ 
          enableCustomLabels: true, 
          displayStyle: style 
        });
        plugin = new MockPlugin(app, settings);

        const markdownData = `
This is a test[^1].

[^1]: Footnote definition.
        `;

        const mdView = createMockMarkdownView(markdownData, 'test.md');
        const backref = createMockFootnoteElement('#fnref:1');
        mdView.contentEl.appendChild(backref);

        const leaf = createMockWorkspaceLeaf(mdView);
        app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

        plugin.updateBackreferences();

        if (style === 'superscript') {
          expect(backref.innerHTML).toContain(expected);
        } else {
          expect(backref.textContent).toBe(expected);
        }
      });
    });

    it('should handle custom labels correctly', () => {
      const settings = createMockSettings({ 
        enableCustomLabels: true,
        labelPriority: 'label'
      });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^video] with custom label[^source].

[^video]: Video reference.
[^source]: Source code reference.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref1 = createMockFootnoteElement('#fnref:video');
      const backref2 = createMockFootnoteElement('#fnref:source');
      mdView.contentEl.appendChild(backref1);
      mdView.contentEl.appendChild(backref2);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      plugin.updateBackreferences();

      expect(backref1.textContent).toBe('[video]');
      expect(backref2.textContent).toBe('[source]');
    });

    it('should show both label and number when enabled', () => {
      const settings = createMockSettings({ 
        enableCustomLabels: true,
        showBothLabelAndNumber: true
      });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^1] and custom[^video].

[^1]: Numeric footnote.
[^video]: Custom footnote.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref1 = createMockFootnoteElement('#fnref:1');
      const backref2 = createMockFootnoteElement('#fnref:video');
      mdView.contentEl.appendChild(backref1);
      mdView.contentEl.appendChild(backref2);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      plugin.updateBackreferences();

      expect(backref1.textContent).toBe('[1]');
      expect(backref2.textContent).toBe('[video]');
    });
  });

  describe('Caching and Performance', () => {
    it('should cache parsed footnotes', () => {
      const settings = createMockSettings({ enableCustomLabels: true });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^1].

[^1]: Footnote definition.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref = createMockFootnoteElement('#fnref:1');
      mdView.contentEl.appendChild(backref);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      // First update - should parse and cache
      plugin.updateBackreferences();
      expect(plugin.cache.has('test.md')).toBe(true);

      // Second update - should use cache
      const parseSpy = jest.spyOn(plugin, 'parseFootnotes');
      plugin.updateBackreferences();
      expect(parseSpy).not.toHaveBeenCalled();
    });

    it('should prevent duplicate processing', () => {
      const settings = createMockSettings({ enableCustomLabels: true });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^1].

[^1]: Footnote definition.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref = createMockFootnoteElement('#fnref:1');
      mdView.contentEl.appendChild(backref);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      // First update
      plugin.updateBackreferences();
      expect(plugin.processingQueue.has('test.md')).toBe(false);

      // Second update while first is still processing
      plugin.processingQueue.add('test.md');
      const updateSpy = jest.spyOn(plugin, 'updateBackreferencesForView');
      plugin.updateBackreferences();
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing content element gracefully', () => {
      const settings = createMockSettings({ enableCustomLabels: true });
      plugin = new MockPlugin(app, settings);

      const mdView = createMockMarkdownView('', 'test.md');
      mdView.contentEl = null as any;

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      expect(() => {
        plugin.updateBackreferences();
      }).not.toThrow();

      expect(plugin.processingQueue.has('test.md')).toBe(false);
    });

    it('should handle malformed footnotes gracefully', () => {
      const settings = createMockSettings({ enableCustomLabels: true });
      plugin = new MockPlugin(app, settings);

      const markdownData = `
This is a test[^1] with malformed[^].

[^1]: Valid footnote.
[^]: Malformed footnote.
      `;

      const mdView = createMockMarkdownView(markdownData, 'test.md');
      const backref = createMockFootnoteElement('#fnref:1');
      mdView.contentEl.appendChild(backref);

      const leaf = createMockWorkspaceLeaf(mdView);
      app.workspace.getLeavesOfType = jest.fn(() => [leaf]);

      expect(() => {
        plugin.updateBackreferences();
      }).not.toThrow();

      // Valid footnote should still be processed
      expect(backref.textContent).toBe('[1]');
    });
  });
}); 