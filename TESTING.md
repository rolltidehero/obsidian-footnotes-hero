# Testing Framework Documentation

## Overview

The Footnote Backreference Synchronization Plugin includes a comprehensive testing framework designed to ensure reliability, performance, and maintainability. The testing suite covers unit tests, integration tests, and performance benchmarks.

## Test Structure

```
tests/
├── setup.ts                    # Test environment setup and utilities
├── types.d.ts                  # TypeScript declarations for Jest
├── mocks/
│   └── obsidian.ts            # Mock Obsidian API for testing
├── unit/
│   └── footnote-parsing.test.ts # Unit tests for core parsing logic
├── integration/
│   └── plugin-integration.test.ts # Integration tests for plugin functionality
├── performance/
│   └── performance-benchmarks.test.ts # Performance benchmarks
├── benchmark/
│   └── run-benchmarks.js      # Standalone benchmark runner
└── simple.test.ts             # Basic test to verify setup
```

## Test Categories

### 1. Unit Tests (`tests/unit/`)

**Purpose**: Test individual functions and methods in isolation.

**Coverage**:
- Footnote parsing logic
- Label validation
- Smart suggestions algorithm
- Display style application
- Settings management

**Key Tests**:
- `parseFootnotes()` - Tests parsing of numeric and custom labels
- `validateFootnoteLabels()` - Tests validation logic
- `suggestLabels()` - Tests content analysis for suggestions
- `createCustomBackreferenceText()` - Tests display text generation

**Example**:
```typescript
describe('Footnote Parsing', () => {
  it('should parse numeric footnotes correctly', () => {
    const markdown = 'Test[^1] with footnote[^2].\n[^1]: First.\n[^2]: Second.';
    const footnotes = plugin.parseFootnotes(markdown);
    expect(footnotes.size).toBe(2);
    expect(footnotes.get('1').definition).toBe('First.');
  });
});
```

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test how different components work together.

**Coverage**:
- Plugin initialization
- Settings integration
- DOM manipulation
- Event handling
- Caching system
- Error handling

**Key Tests**:
- Backreference updates with different settings
- Performance mode functionality
- Caching and duplicate prevention
- Error handling for malformed content
- Settings persistence

**Example**:
```typescript
describe('Plugin Integration Tests', () => {
  it('should update backreferences when plugin is enabled', () => {
    const settings = createMockSettings({ enableCustomLabels: true });
    const plugin = new MockPlugin(app, settings);
    const mdView = createMockMarkdownView(markdownData);
    
    plugin.updateBackreferences();
    
    expect(backref.textContent).toBe('[1]');
    expect(backref.hasAttribute('data-custom-backref')).toBe(true);
  });
});
```

### 3. Performance Tests (`tests/performance/`)

**Purpose**: Ensure the plugin performs well with large documents and edge cases.

**Coverage**:
- Large document processing (100-1000+ footnotes)
- Memory usage optimization
- Caching effectiveness
- Concurrent processing
- Performance mode benefits

**Key Benchmarks**:
- Parse 100/500/1000 footnotes
- Update 100/500/1000 backreferences
- Memory usage with repeated operations
- Caching performance improvements
- Multiple document processing

**Example**:
```typescript
describe('Performance Benchmarks', () => {
  it('should parse 1000 footnotes efficiently', () => {
    const markdown = generateLargeDocument(1000);
    const startTime = performance.now();
    const footnotes = plugin.parseFootnotes(markdown);
    const duration = performance.now() - startTime;
    
    expect(footnotes.size).toBe(1000);
    expect(duration).toBeLessThan(200); // Under 200ms
  });
});
```

## Running Tests

### Prerequisites

Install testing dependencies:
```bash
npm install --save-dev jest @types/jest jest-environment-jsdom ts-jest @testing-library/jest-dom jsdom
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test categories
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:performance   # Performance tests only

# Run standalone benchmarks
npm run benchmark
```

### Jest Configuration

The testing framework uses Jest with the following configuration (`jest.config.js`):

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'main.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^obsidian$': '<rootDir>/tests/mocks/obsidian.ts'
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};
```

## Test Utilities

### Mock Objects

**Obsidian API Mock** (`tests/mocks/obsidian.ts`):
- `Plugin` class with mocked methods
- `MarkdownView` with DOM manipulation capabilities
- `WorkspaceLeaf` for workspace management
- `Setting` and `PluginSettingTab` for settings UI
- `App` with workspace and vault mocks

**Test Utilities** (`tests/setup.ts`):
- `createMockElement()` - Create DOM elements
- `createMockFootnoteElement()` - Create footnote backreference elements
- `createMockSettings()` - Generate test settings
- `waitFor()` - Async test utilities

### Test Data Generators

**Large Document Generator**:
```typescript
const generateLargeDocument = (footnoteCount: number) => {
  // Generates documents with specified number of footnotes
  // Used for performance testing
};
```

**Custom Label Generator**:
```typescript
const generateCustomLabelDocument = (footnoteCount: number) => {
  // Generates documents with custom footnote labels
  // Tests smart suggestions and validation
};
```

## Performance Benchmarks

### Standalone Benchmark Runner

The `tests/benchmark/run-benchmarks.js` script provides comprehensive performance testing:

```bash
# Run all benchmarks
node tests/benchmark/run-benchmarks.js

# Or use npm script
npm run benchmark
```

### Benchmark Categories

1. **Parsing Performance**:
   - 100, 500, 1000 numeric footnotes
   - 500 custom label footnotes
   - Target: < 200ms for 1000 footnotes

2. **DOM Update Performance**:
   - 100, 500, 1000 backreferences
   - Performance mode with limits
   - Target: < 500ms for 1000 backreferences

3. **Memory Usage**:
   - Memory leak detection
   - Caching effectiveness
   - Target: < 10MB increase for repeated operations

4. **Concurrent Processing**:
   - Multiple document handling
   - Duplicate prevention
   - Target: Efficient concurrent processing

### Performance Targets

| Operation | Target Time | Target Memory |
|-----------|-------------|---------------|
| Parse 100 footnotes | < 50ms | < 1MB |
| Parse 500 footnotes | < 100ms | < 2MB |
| Parse 1000 footnotes | < 200ms | < 5MB |
| Update 100 backrefs | < 100ms | < 1MB |
| Update 500 backrefs | < 500ms | < 3MB |
| Update 1000 backrefs | < 1000ms | < 5MB |
| Performance mode | < 300ms | < 3MB |

## Coverage Goals

### Code Coverage Targets

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### Test Coverage Areas

1. **Core Functionality** (100%):
   - Footnote parsing
   - Label validation
   - Display text generation
   - Settings management

2. **Integration Features** (95%):
   - Plugin initialization
   - DOM manipulation
   - Event handling
   - Caching system

3. **Performance Features** (90%):
   - Performance mode
   - Batch processing
   - Memory management
   - Concurrent processing

4. **Edge Cases** (85%):
   - Malformed footnotes
   - Missing definitions
   - Invalid labels
   - Error conditions

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - run: npm run benchmark
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## Debugging Tests

### Common Issues

1. **Jest not found**: Ensure Jest is installed as dev dependency
2. **TypeScript errors**: Check `tsconfig.json` includes test files
3. **DOM errors**: Verify jsdom is properly configured
4. **Mock failures**: Check mock implementations match real API

### Debug Commands

```bash
# Run specific test with verbose output
npm test -- --verbose --testNamePattern="should parse numeric footnotes"

# Run tests with debugging
npm test -- --detectOpenHandles --forceExit

# Run performance tests only
npm run test:performance -- --verbose

# Generate coverage report
npm run test:coverage -- --coverageReporters=html
```

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Edge Cases**: Test boundary conditions

### Performance Testing

1. **Baseline**: Establish performance baselines
2. **Regression**: Detect performance regressions
3. **Profiling**: Use performance profiling tools
4. **Monitoring**: Track performance over time

### Maintenance

1. **Regular Updates**: Keep testing dependencies current
2. **Coverage Monitoring**: Track coverage metrics
3. **Test Review**: Regularly review and refactor tests
4. **Documentation**: Keep test documentation updated

## Conclusion

The testing framework provides comprehensive coverage of the plugin's functionality, ensuring reliability and performance. The combination of unit tests, integration tests, and performance benchmarks creates a robust foundation for maintaining and improving the plugin.

For questions or issues with the testing framework, please refer to the Jest documentation or create an issue in the project repository. 