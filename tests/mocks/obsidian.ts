// Mock Obsidian API for testing
export class Plugin {
  app: any;
  manifest: any;
  settings: any;

  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  async onload() {}
  async onunload() {}
  async loadData() { return {}; }
  async saveData(data: any) {}
  addCommand(command: any) {}
  addSettingTab(tab: any) {}
  registerEvent(event: any) {}
}

export class MarkdownView {
  file: any;
  data: string;
  editor: any;
  contentEl: HTMLElement;
  getMode() { return 'source'; }

  constructor(data: string = '') {
    this.data = data;
    this.contentEl = document.createElement('div');
    this.editor = {
      getCursor: () => ({ line: 0, ch: 0 }),
      setCursor: jest.fn(),
      getLine: jest.fn(),
      lineCount: () => 1,
      replaceRange: jest.fn()
    };
  }
}

export class WorkspaceLeaf {
  view: any;
  constructor(view?: any) {
    this.view = view;
  }
}

export class Setting {
  constructor(containerEl: HTMLElement) {}
  setName(name: string) { return this; }
  setDesc(desc: string) { return this; }
  addToggle(callback: (toggle: any) => void) { return this; }
  addDropdown(callback: (dropdown: any) => void) { return this; }
  addSlider(callback: (slider: any) => void) { return this; }
  addText(callback: (text: any) => void) { return this; }
  addButton(callback: (button: any) => void) { return this; }
}

export class PluginSettingTab {
  app: any;
  plugin: any;

  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
  }

  display() {}
}

export class Notice {
  constructor(message: string) {}
}

export class App {
  workspace: any;
  vault: any;

  constructor() {
    this.workspace = {
      getActiveViewOfType: jest.fn(),
      getLeavesOfType: jest.fn((): any[] => []),
      on: jest.fn(() => ({ unref: jest.fn() }))
    };
    this.vault = {
      on: jest.fn(() => ({ unref: jest.fn() }))
    };
  }
}

// Mock workspace and vault events
export const mockWorkspace = {
  getActiveViewOfType: jest.fn(),
  getLeavesOfType: jest.fn((): any[] => []),
  on: jest.fn(() => ({ unref: jest.fn() }))
};

export const mockVault = {
  on: jest.fn(() => ({ unref: jest.fn() }))
};

// Mock file object
export const createMockFile = (path: string = 'test.md') => ({
  path,
  name: path.split('/').pop() || 'test.md',
  basename: path.split('/').pop()?.replace('.md', '') || 'test'
});

// Mock markdown view
export const createMockMarkdownView = (data: string = '', filePath?: string) => {
  const view = new MarkdownView(data);
  if (filePath) {
    view.file = createMockFile(filePath);
  }
  return view;
};

// Mock workspace leaf
export const createMockWorkspaceLeaf = (view?: MarkdownView) => {
  return new WorkspaceLeaf(view);
}; 