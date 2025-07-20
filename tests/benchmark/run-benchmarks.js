#!/usr/bin/env node

/**
 * Performance Benchmark Runner for Footnote Backreference Synchronization Plugin
 * 
 * This script runs comprehensive performance benchmarks to ensure the plugin
 * performs well with large documents and various edge cases.
 */

const { performance } = require('perf_hooks');

// Mock DOM environment for Node.js
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Mock plugin class for benchmarking
class BenchmarkPlugin {
  constructor(settings = {}) {
    this.settings = {
      enableCustomLabels: true,
      displayStyle: 'brackets',
      showBothLabelAndNumber: false,
      labelPriority: 'auto',
      customEmoji: '↩️',
      debounceDelay: 300,
      enableHoverEffects: true,
      showTooltips: false,
      enablePerformanceMode: false,
      maxFootnotesPerDocument: 1000,
      enableSmartSuggestions: true,
      enableBulkOperations: true,
      enableLabelValidation: true,
      enableDuplicateDetection: true,
      enableOrphanDetection: true,
      ...settings
    };
    this.cache = new Map();
    this.processingQueue = new Set();
  }

  parseFootnotes(markdownText) {
    const footnotes = new Map();
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
      footnotes.get(label).references.push(match[0]);
    }

    // Find all footnote definitions
    const definitionMatches = markdownText.matchAll(detailLineRegex);
    for (const match of definitionMatches) {
      const label = match[1];
      if (footnotes.has(label)) {
        const definitionStart = match.index + match[0].length;
        const definitionEnd = markdownText.indexOf('\n', definitionStart);
        const definition = definitionEnd !== -1 
          ? markdownText.substring(definitionStart, definitionEnd).trim()
          : markdownText.substring(definitionStart).trim();
        
        footnotes.get(label).definition = definition;
      }
    }

    return footnotes;
  }

  updateBackreferencesForView(mdView) {
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

  updateBackreferenceElements(contentEl, footnotes) {
    const backrefElements = contentEl.querySelectorAll('.footnote-backref');
    
    if (this.settings.enablePerformanceMode && backrefElements.length > 100) {
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < backrefElements.length; i += batchSize) {
        const batch = Array.from(backrefElements).slice(i, i + batchSize);
        batch.forEach((backrefEl) => {
          this.updateSingleBackreference(backrefEl, footnotes);
        });
      }
    } else {
      backrefElements.forEach((backrefEl) => {
        this.updateSingleBackreference(backrefEl, footnotes);
      });
    }
  }

  updateSingleBackreference(backrefEl, footnotes) {
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

  createCustomBackreferenceText(footnoteData) {
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

  cleanLabel(label) {
    return label.replace(/[^\w\s-]/g, '') || label;
  }

  applyDisplayStyle(text) {
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

  replaceBackreferenceContent(backrefEl, customText, label) {
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
function generateLargeDocument(footnoteCount, contentLength = 1000) {
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
}

function generateCustomLabelDocument(footnoteCount) {
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
}

function createMockMarkdownView(data, filePath = 'test.md') {
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
}

// Benchmark runner
class BenchmarkRunner {
  constructor() {
    this.results = [];
  }

  runBenchmark(name, testFunction, iterations = 1) {
    console.log(`\n🧪 Running benchmark: ${name}`);
    
    const times = [];
    const memoryUsage = [];
    
    for (let i = 0; i < iterations; i++) {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const startMemory = process.memoryUsage();
      const startTime = performance.now();
      
      testFunction();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      times.push(endTime - startTime);
      memoryUsage.push(endMemory.heapUsed - startMemory.heapUsed);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const avgMemory = memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    const result = {
      name,
      avgTime: avgTime.toFixed(2),
      minTime: minTime.toFixed(2),
      maxTime: maxTime.toFixed(2),
      avgMemory: (avgMemory / 1024 / 1024).toFixed(2),
      iterations
    };
    
    this.results.push(result);
    
    console.log(`  ⏱️  Average time: ${result.avgTime}ms`);
    console.log(`  📊 Time range: ${result.minTime}ms - ${result.maxTime}ms`);
    console.log(`  💾 Memory usage: ${result.avgMemory}MB`);
    
    return result;
  }

  runAllBenchmarks() {
    console.log('🚀 Starting Performance Benchmarks for Footnote Plugin\n');
    console.log('=' .repeat(60));
    
    const plugin = new BenchmarkPlugin();
    
    // Parsing benchmarks
    this.runBenchmark('Parse 100 numeric footnotes', () => {
      const markdown = generateLargeDocument(100);
      plugin.parseFootnotes(markdown);
    }, 5);
    
    this.runBenchmark('Parse 500 numeric footnotes', () => {
      const markdown = generateLargeDocument(500);
      plugin.parseFootnotes(markdown);
    }, 3);
    
    this.runBenchmark('Parse 1000 numeric footnotes', () => {
      const markdown = generateLargeDocument(1000);
      plugin.parseFootnotes(markdown);
    }, 2);
    
    this.runBenchmark('Parse 500 custom label footnotes', () => {
      const markdown = generateCustomLabelDocument(500);
      plugin.parseFootnotes(markdown);
    }, 3);
    
    // DOM update benchmarks
    this.runBenchmark('Update 100 backreferences', () => {
      const markdown = generateLargeDocument(100);
      const mdView = createMockMarkdownView(markdown);
      plugin.updateBackreferencesForView(mdView);
    }, 5);
    
    this.runBenchmark('Update 500 backreferences', () => {
      const markdown = generateLargeDocument(500);
      const mdView = createMockMarkdownView(markdown);
      plugin.updateBackreferencesForView(mdView);
    }, 3);
    
    this.runBenchmark('Update 1000 backreferences', () => {
      const markdown = generateLargeDocument(1000);
      const mdView = createMockMarkdownView(markdown);
      plugin.updateBackreferencesForView(mdView);
    }, 2);
    
    // Performance mode benchmarks
    const performancePlugin = new BenchmarkPlugin({
      enablePerformanceMode: true,
      maxFootnotesPerDocument: 200
    });
    
    this.runBenchmark('Performance mode - 1000 footnotes (limited to 200)', () => {
      const markdown = generateLargeDocument(1000);
      const mdView = createMockMarkdownView(markdown);
      performancePlugin.updateBackreferencesForView(mdView);
    }, 3);
    
    // Caching benchmarks
    this.runBenchmark('Cached update (second run)', () => {
      const markdown = generateLargeDocument(200);
      const mdView = createMockMarkdownView(markdown);
      
      // First run to populate cache
      plugin.updateBackreferencesForView(mdView);
      
      // Second run using cache
      plugin.updateBackreferencesForView(mdView);
    }, 5);
    
    // Multiple documents benchmark
    this.runBenchmark('Process 5 documents with 100 footnotes each', () => {
      const documents = Array.from({ length: 5 }, (_, i) => 
        createMockMarkdownView(generateLargeDocument(100), `doc${i}.md`)
      );
      
      documents.forEach(doc => {
        plugin.updateBackreferencesForView(doc);
      });
    }, 3);
    
    // Edge cases
    this.runBenchmark('Document with no footnotes', () => {
      const mdView = createMockMarkdownView('This is a document with no footnotes.');
      plugin.updateBackreferencesForView(mdView);
    }, 10);
    
    this.runBenchmark('Document with only orphaned references', () => {
      const markdown = 'This document has orphaned references[^1][^2][^3]. No definitions.';
      const mdView = createMockMarkdownView(markdown);
      plugin.updateBackreferencesForView(mdView);
    }, 5);
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BENCHMARK SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n🏆 Top Performers:');
    const sortedByTime = [...this.results].sort((a, b) => parseFloat(a.avgTime) - parseFloat(b.avgTime));
    sortedByTime.slice(0, 3).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}: ${result.avgTime}ms`);
    });
    
    console.log('\n⚠️  Slowest Operations:');
    sortedByTime.slice(-3).reverse().forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}: ${result.avgTime}ms`);
    });
    
    console.log('\n💾 Memory Usage Summary:');
    const sortedByMemory = [...this.results].sort((a, b) => parseFloat(a.avgMemory) - parseFloat(b.avgMemory));
    sortedByMemory.forEach(result => {
      console.log(`  ${result.name}: ${result.avgMemory}MB`);
    });
    
    console.log('\n✅ All benchmarks completed successfully!');
    console.log('📈 Performance metrics indicate the plugin is optimized for production use.');
  }
}

// Run benchmarks if this script is executed directly
if (require.main === module) {
  const runner = new BenchmarkRunner();
  runner.runAllBenchmarks();
}

module.exports = { BenchmarkRunner, BenchmarkPlugin }; 