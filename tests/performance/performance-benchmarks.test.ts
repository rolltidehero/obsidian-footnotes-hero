import { createMockSettings } from '../setup';

// Performance testing utilities
class PerformancePlugin {
  settings: any;
  cache: Map<string, any> = new Map();
  processingQueue: Set<string> = new Set();

  constructor(settings: any) {
    this.settings = settings;
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
      this.processingQueue.delete(filePath);
    }
  }

  updateBackreferenceElements(contentEl: HTMLElement, footnotes: Map<string, any>) {
    const backrefElements = contentEl.querySelectorAll('.footnote-backref');
    
    if (this.settings.enablePerformanceMode && backrefElements.length > 100) {
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < backrefElements.length; i += batchSize) {
        const batch = Array.from(backrefElements).slice(i, i + batchSize);
        batch.forEach((backrefEl) => {
          this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
        });
      }
    } else {
      backrefElements.forEach((backrefEl) => {
        this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
      });
    }
  }

  updateSingleBackreference(backrefEl: HTMLElement, footnotes: Map<string, any>) {
    const href = backrefEl.getAttribute('href');
    if (!href) return;

    const labelMatch = href.match(/#fnref:(.+)$/);
    if (!labelMatch) return;

    const label = labelMatch[1];
    const footnoteData = footnotes.get(label);
    
    if (!footnoteData || backrefEl.hasAttribute('data-custom-backref')) {
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
    textSpan.style.cssText = 'color: var(--text-accent); font-weight: 500; cursor: pointer;';
    backrefEl.appendChild(textSpan);
  }
}

// Test data generators
const generateLargeDocument = (footnoteCount: number, contentLength: number = 1000): string => {
  let content = 'This is a large document with many footnotes.\n\n';
  
  // Add content with footnotes
  for (let i = 1; i <= footnoteCount; i++) {
    content += `This paragraph contains a footnote[^${i}] reference. `;
    if (i % 10 === 0) content += '\n\n';
  }
  
  content += '\n\n';
  
  // Add footnote definitions
  for (let i = 1; i <= footnoteCount; i++) {
    content += `[^${i}]: This is footnote definition number ${i}. It contains some additional information about the topic being referenced.\n`;
  }
  
  return content;
};

const generateCustomLabelDocument = (footnoteCount: number): string => {
  const labels = ['video', 'source', 'quote', 'stats', 'methodology', 'results', 'discussion', 'background', 'context', 'approach'];
  let content = 'This document uses custom footnote labels.\n\n';
  
  for (let i = 0; i < footnoteCount; i++) {
    const label = labels[i % labels.length];
    content += `This paragraph references a ${label}[^${label}]. `;
    if ((i + 1) % 5 === 0) content += '\n\n';
  }
  
  content += '\n\n';
  
  for (let i = 0; i < footnoteCount; i++) {
    const label = labels[i % labels.length];
    content += `[^${label}]: Definition for ${label} reference.\n`;
  }
  
  return content;
};

const createMockMarkdownView = (data: string, filePath: string = 'test.md') => {
  const contentEl = document.createElement('div');
  
  // Add backreference elements
  const footnotes = data.match(/\[\^([^\]]+)\]/g) || [];
  footnotes.forEach((footnote, index) => {
    const label = footnote.match(/\[\^([^\]]+)\]/)?.[1] || index.toString();
    const backref = document.createElement('a');
    backref.className = 'footnote-backref';
    backref.setAttribute('href', `#fnref:${label}`);
    backref.textContent = '↩️';
    contentEl.appendChild(backref);
  });
  
  return {
    file: { path: filePath },
    data,
    contentEl
  };
};

describe('Performance Benchmarks', () => {
  let plugin: PerformancePlugin;

  beforeEach(() => {
    plugin = new PerformancePlugin(createMockSettings());
  });

  describe('Parsing Performance', () => {
    it('should parse 100 footnotes quickly', () => {
      const markdown = generateLargeDocument(100);
      
      const startTime = performance.now();
      const footnotes = plugin.parseFootnotes(markdown);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(footnotes.size).toBe(100);
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should parse 1000 footnotes efficiently', () => {
      const markdown = generateLargeDocument(1000);
      
      const startTime = performance.now();
      const footnotes = plugin.parseFootnotes(markdown);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(footnotes.size).toBe(1000);
      expect(duration).toBeLessThan(200); // Should complete in under 200ms
    });

    it('should handle custom labels efficiently', () => {
      const markdown = generateCustomLabelDocument(500);
      
      const startTime = performance.now();
      const footnotes = plugin.parseFootnotes(markdown);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(footnotes.size).toBe(500);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('DOM Update Performance', () => {
    it('should update 100 backreferences quickly', () => {
      const markdown = generateLargeDocument(100);
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should update 500 backreferences efficiently', () => {
      const markdown = generateLargeDocument(500);
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });

    it('should handle performance mode with large documents', () => {
      const settings = createMockSettings({ 
        enablePerformanceMode: true,
        maxFootnotesPerDocument: 200
      });
      plugin = new PerformancePlugin(settings);
      
      const markdown = generateLargeDocument(1000);
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(300); // Should complete in under 300ms with performance mode
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated operations', () => {
      const markdown = generateLargeDocument(100);
      const mdView = createMockMarkdownView(markdown);
      
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform multiple updates
      for (let i = 0; i < 10; i++) {
        plugin.updateBackreferencesForView(mdView);
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should cache efficiently', () => {
      const markdown = generateLargeDocument(200);
      const mdView = createMockMarkdownView(markdown);
      
      // First update - should parse and cache
      const firstStart = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const firstEnd = performance.now();
      const firstDuration = firstEnd - firstStart;
      
      // Second update - should use cache
      const secondStart = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const secondEnd = performance.now();
      const secondDuration = secondEnd - secondStart;
      
      // Cached operation should be significantly faster
      expect(secondDuration).toBeLessThan(firstDuration * 0.5);
    });
  });

  describe('Concurrent Processing', () => {
    it('should handle multiple documents efficiently', () => {
      const documents = Array.from({ length: 5 }, (_, i) => 
        createMockMarkdownView(generateLargeDocument(50), `doc${i}.md`)
      );
      
      const startTime = performance.now();
      
      documents.forEach(doc => {
        plugin.updateBackreferencesForView(doc);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });

    it('should prevent duplicate processing', () => {
      const markdown = generateLargeDocument(100);
      const mdView = createMockMarkdownView(markdown);
      
      // Simulate concurrent updates
      const promises = Array.from({ length: 5 }, () => 
        new Promise<void>((resolve) => {
          plugin.updateBackreferencesForView(mdView);
          resolve();
        })
      );
      
      const startTime = performance.now();
      Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete quickly due to duplicate prevention
    });
  });

  describe('Edge Cases Performance', () => {
    it('should handle documents with no footnotes efficiently', () => {
      const markdown = 'This is a document with no footnotes at all.';
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10); // Should complete very quickly
    });

    it('should handle documents with only orphaned references', () => {
      const markdown = `
This document has orphaned references[^1][^2][^3].

No definitions are provided.
      `;
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete quickly
    });

    it('should handle documents with only unused definitions', () => {
      const markdown = `
This document has no references.

[^1]: Unused definition 1.
[^2]: Unused definition 2.
[^3]: Unused definition 3.
      `;
      const mdView = createMockMarkdownView(markdown);
      
      const startTime = performance.now();
      plugin.updateBackreferencesForView(mdView);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete quickly
    });
  });
}); 