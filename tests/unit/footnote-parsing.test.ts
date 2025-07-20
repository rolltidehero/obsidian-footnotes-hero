import { createMockSettings } from '../setup';

// Mock the main plugin class
class MockPlugin {
  settings: any;
  detailLineRegex = /\[\^([^\]]+)\]\:/;
  reOnlyMarkers = /\[\^([^\]]+)\]/gi;
  numericalRe = /(\d+)/;

  constructor(settings: any) {
    this.settings = settings;
  }

  parseFootnotes(markdownText: string): Map<string, any> {
    const footnotes = new Map<string, any>();
    
    // Find all footnote references
    const referenceMatches = markdownText.matchAll(this.reOnlyMarkers);
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
    const definitionMatches = markdownText.matchAll(this.detailLineRegex);
    for (const match of definitionMatches) {
      const label = match[1];
      if (footnotes.has(label)) {
        // Get the definition content (everything after the label)
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

  validateFootnoteLabels(footnotes: Map<string, any>): string[] {
    const issues: string[] = [];
    
    for (const [label, data] of footnotes) {
      // Check for orphaned references (no definition)
      if (data.references.length > 0 && !data.definition) {
        issues.push(`Orphaned reference: [^${label}] has no definition`);
      }
      
      // Check for duplicate definitions
      if (data.references.length === 0 && data.definition) {
        issues.push(`Unused definition: [^${label}]: has no references`);
      }
      
      // Check for invalid label format
      if (!/^[a-zA-Z0-9_-]+$/.test(label)) {
        issues.push(`Invalid label format: [^${label}] contains special characters`);
      }
    }
    
    return issues;
  }

  suggestLabels(content: string): string[] {
    const suggestions: string[] = [];
    const commonLabels = [
      'video', 'source', 'quote', 'stats', 'methodology', 'results', 'discussion',
      'background', 'context', 'approach', 'findings', 'analysis', 'conclusion',
      'api', 'code', 'docs', 'tutorial', 'example', 'reference', 'citation'
    ];
    
    // Analyze content for common patterns
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    // Find frequent words that match common label patterns
    for (const [word, freq] of wordFreq) {
      if (freq > 2 && commonLabels.includes(word)) {
        suggestions.push(word);
      }
    }
    
    // Add common academic labels
    if (content.includes('research') || content.includes('study')) {
      suggestions.push('methodology', 'results', 'discussion');
    }
    
    if (content.includes('video') || content.includes('tutorial')) {
      suggestions.push('video', 'tutorial', 'demo');
    }
    
    if (content.includes('code') || content.includes('programming')) {
      suggestions.push('code', 'api', 'docs');
    }
    
    return [...new Set(suggestions)].slice(0, 10);
  }
}

describe('Footnote Parsing', () => {
  let plugin: MockPlugin;

  beforeEach(() => {
    plugin = new MockPlugin(createMockSettings());
  });

  describe('parseFootnotes', () => {
    it('should parse numeric footnotes correctly', () => {
      const markdown = `
This is a test[^1] with multiple footnotes[^2].

[^1]: First footnote definition.
[^2]: Second footnote definition.
      `;

      const footnotes = plugin.parseFootnotes(markdown);

      expect(footnotes.size).toBe(2);
      expect(footnotes.get('1')).toEqual({
        label: '1',
        references: ['[^1]'],
        definition: 'First footnote definition.'
      });
      expect(footnotes.get('2')).toEqual({
        label: '2',
        references: ['[^2]'],
        definition: 'Second footnote definition.'
      });
    });

    it('should parse custom label footnotes correctly', () => {
      const markdown = `
This is a test[^video] with custom labels[^source].

[^video]: Video reference definition.
[^source]: Source code reference.
      `;

      const footnotes = plugin.parseFootnotes(markdown);

      expect(footnotes.size).toBe(2);
      expect(footnotes.get('video')).toEqual({
        label: 'video',
        references: ['[^video]'],
        definition: 'Video reference definition.'
      });
      expect(footnotes.get('source')).toEqual({
        label: 'source',
        references: ['[^source]'],
        definition: 'Source code reference.'
      });
    });

    it('should handle multiple references to the same footnote', () => {
      const markdown = `
This is a test[^1] with the same footnote[^1] used twice.

[^1]: Single definition for multiple references.
      `;

      const footnotes = plugin.parseFootnotes(markdown);

      expect(footnotes.size).toBe(1);
      expect(footnotes.get('1')).toEqual({
        label: '1',
        references: ['[^1]', '[^1]'],
        definition: 'Single definition for multiple references.'
      });
    });

    it('should handle footnotes without definitions', () => {
      const markdown = `
This is a test[^1] with no definition.

Some other content.
      `;

      const footnotes = plugin.parseFootnotes(markdown);

      expect(footnotes.size).toBe(1);
      expect(footnotes.get('1')).toEqual({
        label: '1',
        references: ['[^1]'],
        definition: ''
      });
    });

    it('should handle definitions without references', () => {
      const markdown = `
This is a test without any references.

[^1]: Orphaned definition.
      `;

      const footnotes = plugin.parseFootnotes(markdown);

      expect(footnotes.size).toBe(1);
      expect(footnotes.get('1')).toEqual({
        label: '1',
        references: [],
        definition: 'Orphaned definition.'
      });
    });
  });

  describe('validateFootnoteLabels', () => {
    it('should detect orphaned references', () => {
      const footnotes = new Map();
      footnotes.set('1', {
        label: '1',
        references: ['[^1]'],
        definition: ''
      });

      const issues = plugin.validateFootnoteLabels(footnotes);

      expect(issues).toContain('Orphaned reference: [^1] has no definition');
    });

    it('should detect unused definitions', () => {
      const footnotes = new Map();
      footnotes.set('1', {
        label: '1',
        references: [],
        definition: 'Unused definition'
      });

      const issues = plugin.validateFootnoteLabels(footnotes);

      expect(issues).toContain('Unused definition: [^1]: has no references');
    });

    it('should detect invalid label formats', () => {
      const footnotes = new Map();
      footnotes.set('invalid-label!', {
        label: 'invalid-label!',
        references: ['[^invalid-label!]'],
        definition: 'Test'
      });

      const issues = plugin.validateFootnoteLabels(footnotes);

      expect(issues).toContain('Invalid label format: [^invalid-label!] contains special characters');
    });

    it('should not report issues for valid footnotes', () => {
      const footnotes = new Map();
      footnotes.set('1', {
        label: '1',
        references: ['[^1]'],
        definition: 'Valid definition'
      });

      const issues = plugin.validateFootnoteLabels(footnotes);

      expect(issues).toHaveLength(0);
    });
  });

  describe('suggestLabels', () => {
    it('should suggest labels based on content analysis', () => {
      const content = `
This research paper discusses methodology and results.
The study shows significant findings in the analysis.
Video tutorials and code examples are provided.
      `;

      const suggestions = plugin.suggestLabels(content);

      expect(suggestions).toContain('methodology');
      expect(suggestions).toContain('results');
      expect(suggestions).toContain('video');
      expect(suggestions).toContain('code');
    });

    it('should suggest academic labels for research content', () => {
      const content = `
This research study examines the methodology used in previous studies.
The results show significant findings that require further discussion.
      `;

      const suggestions = plugin.suggestLabels(content);

      expect(suggestions).toContain('methodology');
      expect(suggestions).toContain('results');
      expect(suggestions).toContain('discussion');
    });

    it('should suggest technical labels for code content', () => {
      const content = `
This tutorial shows how to use the API.
The code examples demonstrate proper usage.
Documentation is provided for reference.
      `;

      const suggestions = plugin.suggestLabels(content);

      expect(suggestions).toContain('api');
      expect(suggestions).toContain('code');
      expect(suggestions).toContain('docs');
    });

    it('should return empty array for content without common patterns', () => {
      const content = `
This is a simple text without any specific patterns.
It contains basic words and sentences.
      `;

      const suggestions = plugin.suggestLabels(content);

      expect(suggestions).toHaveLength(0);
    });

    it('should limit suggestions to 10 items', () => {
      const content = `
This research methodology shows results in the discussion.
Video tutorials provide code examples with API documentation.
Background context leads to findings in the analysis.
Statistics support the conclusion with reference citations.
      `;

      const suggestions = plugin.suggestLabels(content);

      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });
}); 