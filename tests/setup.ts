// Test setup file for Jest
import '@testing-library/jest-dom';

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null as any,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Test utilities
export const createMockElement = (tag: string = 'div', className?: string): HTMLElement => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  return element;
};

export const createMockFootnoteElement = (href: string, text: string = '↩️'): HTMLElement => {
  const element = createMockElement('a', 'footnote-backref');
  element.setAttribute('href', href);
  element.textContent = text;
  return element;
};

export const createMockMarkdownContent = (content: string): string => {
  return content;
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const createMockSettings = (overrides: any = {}) => {
  return {
    enableCustomLabels: true,
    displayStyle: 'brackets' as const,
    showBothLabelAndNumber: false,
    labelPriority: 'auto' as const,
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
    ...overrides
  };
}; 