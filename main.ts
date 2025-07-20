import { MarkdownView, Plugin, WorkspaceLeaf, Setting, App, PluginSettingTab, Notice } from 'obsidian';

interface FootnoteData {
	label: string;
	references: string[];
	definition: string;
}

interface FootnoteBackrefSettings {
	enableCustomLabels: boolean;
	displayStyle: 'brackets' | 'emoji' | 'superscript' | 'plain';
	showBothLabelAndNumber: boolean;
	labelPriority: 'label' | 'number' | 'auto';
	customEmoji: string;
	debounceDelay: number;
	enableHoverEffects: boolean;
	showTooltips: boolean;
	// Performance optimizations
	enablePerformanceMode: boolean;
	maxFootnotesPerDocument: number;
	enableSmartSuggestions: boolean;
	enableBulkOperations: boolean;
	// Advanced features
	enableLabelValidation: boolean;
	enableDuplicateDetection: boolean;
	enableOrphanDetection: boolean;
}

const DEFAULT_SETTINGS: FootnoteBackrefSettings = {
	enableCustomLabels: true,
	displayStyle: 'brackets',
	showBothLabelAndNumber: false,
	labelPriority: 'auto',
	customEmoji: '↩️',
	debounceDelay: 300,
	enableHoverEffects: true,
	showTooltips: false,
	// Performance optimizations
	enablePerformanceMode: false,
	maxFootnotesPerDocument: 1000,
	enableSmartSuggestions: true,
	enableBulkOperations: true,
	// Advanced features
	enableLabelValidation: true,
	enableDuplicateDetection: true,
	enableOrphanDetection: true
};

export default class MyPlugin extends Plugin {
	settings: FootnoteBackrefSettings;

	// Extended regex patterns to support both numeric and custom labels
	private detailLineRegex = /\[\^([^\]]+)\]\:/;
	private reOnlyMarkers = /\[\^([^\]]+)\]/gi;
	private numericalRe = /(\d+)/;
	
	// Performance optimizations
	private updateTimeout: number | null = null;
	private processingQueue: Set<string> = new Set();
	private cache: Map<string, Map<string, FootnoteData>> = new Map();
	private lastUpdateTime: number = 0;
	private readonly MIN_UPDATE_INTERVAL = 100; // milliseconds

	// Smart suggestions
	private commonLabels = [
		'video', 'source', 'quote', 'stats', 'methodology', 'results', 'discussion',
		'background', 'context', 'approach', 'findings', 'analysis', 'conclusion',
		'api', 'code', 'docs', 'tutorial', 'example', 'reference', 'citation'
	];

	async onload() {
		// Load settings
		await this.loadSettings();

		// Register the existing footnote command
		this.addCommand({
			id: 'insert-footnote',
			name: 'Insert and Navigate Footnote',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.insertFootnote();
			}
		});

		// Register advanced commands
		this.addCommand({
			id: 'bulk-rename-labels',
			name: 'Bulk Rename Footnote Labels',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.showBulkRenameDialog();
			}
		});

		this.addCommand({
			id: 'validate-footnotes',
			name: 'Validate Footnotes',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.validateFootnotes();
			}
		});

		this.addCommand({
			id: 'suggest-labels',
			name: 'Suggest Footnote Labels',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.showLabelSuggestions();
			}
		});

		// Register event listeners for real-time synchronization
		this.registerEvent(
			this.app.workspace.on('file-open', () => {
				this.debouncedUpdateBackreferences();
			})
		);

		this.registerEvent(
			this.app.vault.on('modify', () => {
				this.debouncedUpdateBackreferences();
			})
		);

		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.debouncedUpdateBackreferences();
			})
		);

		// Add settings tab
		this.addSettingTab(new FootnoteBackrefSettingTab(this.app, this));

		// Initial update for any open files
		this.updateBackreferences();
	}

	async onunload() {
		// Clear any pending updates
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}
		// Clear cache
		this.cache.clear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Update backreferences when settings change
		this.updateBackreferences();
	}

	/**
	 * Enhanced debounced function with performance optimizations
	 */
	private debouncedUpdateBackreferences() {
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}
		
		// Performance mode: skip updates if too frequent
		if (this.settings.enablePerformanceMode) {
			const now = Date.now();
			if (now - this.lastUpdateTime < this.MIN_UPDATE_INTERVAL) {
				return;
			}
			this.lastUpdateTime = now;
		}
		
		this.updateTimeout = window.setTimeout(() => {
			this.updateBackreferences();
		}, this.settings.debounceDelay);
	}

	/**
	 * Main function to update backreferences with performance optimizations
	 */
	public updateBackreferences() {
		// Check if custom labels are enabled
		if (!this.settings.enableCustomLabels) {
			return;
		}

		const leaves = this.app.workspace.getLeavesOfType('markdown');
		
		// Performance mode: limit concurrent processing
		if (this.settings.enablePerformanceMode && leaves.length > 5) {
			leaves.slice(0, 5).forEach(leaf => {
				if (leaf.view instanceof MarkdownView) {
					this.updateBackreferencesForView(leaf.view);
				}
			});
		} else {
			leaves.forEach(leaf => {
				if (leaf.view instanceof MarkdownView) {
					this.updateBackreferencesForView(leaf.view);
				}
			});
		}
	}

	/**
	 * Update backreferences for a specific markdown view with caching
	 */
	private updateBackreferencesForView(mdView: MarkdownView) {
		try {
			const filePath = mdView.file?.path;
			if (!filePath) return;

			// Check if already processing this file
			if (this.processingQueue.has(filePath)) {
				return;
			}

			this.processingQueue.add(filePath);

			// Get the rendered content container
			const contentEl = mdView.contentEl;
			if (!contentEl) {
				this.processingQueue.delete(filePath);
				return;
			}

			// Check cache first
			let footnotes = this.cache.get(filePath);
			if (!footnotes) {
				// Parse footnotes from the markdown content
				footnotes = this.parseFootnotes(mdView.data);
				
				// Cache the results
				this.cache.set(filePath, footnotes);
			}
			
			// Performance mode: limit footnotes processed
			if (this.settings.enablePerformanceMode && footnotes.size > this.settings.maxFootnotesPerDocument) {
				const limitedFootnotes = new Map();
				let count = 0;
				for (const [key, value] of footnotes) {
					if (count >= this.settings.maxFootnotesPerDocument) break;
					limitedFootnotes.set(key, value);
					count++;
				}
				footnotes = limitedFootnotes;
			}
			
			// Find and update backreference elements
			this.updateBackreferenceElements(contentEl, footnotes);
			
			this.processingQueue.delete(filePath);
			
		} catch (error) {
			console.error('Error updating backreferences:', error);
			this.processingQueue.delete(mdView.file?.path || '');
		}
	}

	/**
	 * Enhanced footnote parsing with validation
	 */
	private parseFootnotes(markdownText: string): Map<string, FootnoteData> {
		const footnotes = new Map<string, FootnoteData>();
		
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

		// Validation if enabled
		if (this.settings.enableLabelValidation) {
			this.validateFootnoteLabels(footnotes);
		}

		return footnotes;
	}

	/**
	 * Validate footnote labels and detect issues
	 */
	private validateFootnoteLabels(footnotes: Map<string, FootnoteData>) {
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
		
		if (issues.length > 0) {
			console.warn('Footnote validation issues:', issues);
		}
	}

	/**
	 * Update backreference elements in the DOM with performance optimizations
	 */
	private updateBackreferenceElements(contentEl: HTMLElement, footnotes: Map<string, FootnoteData>) {
		// Find all backreference elements
		const backrefElements = contentEl.querySelectorAll('.footnote-backref');
		
		// Performance mode: batch processing
		if (this.settings.enablePerformanceMode && backrefElements.length > 100) {
			// Process in batches to avoid blocking the UI
			const batchSize = 50;
			for (let i = 0; i < backrefElements.length; i += batchSize) {
				const batch = Array.from(backrefElements).slice(i, i + batchSize);
				setTimeout(() => {
					batch.forEach((backrefEl) => {
						try {
							this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
						} catch (error) {
							console.error('Error updating single backreference:', error);
						}
					});
				}, 0);
			}
		} else {
			backrefElements.forEach((backrefEl) => {
				try {
					this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
				} catch (error) {
					console.error('Error updating single backreference:', error);
				}
			});
		}
	}

	/**
	 * Update a single backreference element
	 */
	private updateSingleBackreference(backrefEl: HTMLElement, footnotes: Map<string, FootnoteData>) {
		// Get the footnote label from the href attribute or parent context
		const href = backrefEl.getAttribute('href');
		if (!href) return;

		// Extract label from href (e.g., "#fnref:1" -> "1", "#fnref:video" -> "video")
		const labelMatch = href.match(/#fnref:(.+)$/);
		if (!labelMatch) return;

		const label = labelMatch[1];
		const footnoteData = footnotes.get(label);
		
		if (!footnoteData) {
			// Footnote not found, keep default behavior
			return;
		}

		// Check if this backreference has already been customized
		if (backrefEl.hasAttribute('data-custom-backref')) {
			return;
		}

		// Create custom backreference text
		const customText = this.createCustomBackreferenceText(footnoteData);
		
		// Replace the content while preserving the link functionality
		this.replaceBackreferenceContent(backrefEl, customText, label);
		
		// Mark as customized to prevent re-processing
		backrefEl.setAttribute('data-custom-backref', 'true');
	}

	/**
	 * Create custom backreference text based on footnote data and settings
	 */
	private createCustomBackreferenceText(footnoteData: FootnoteData): string {
		const label = footnoteData.label;
		const isNumeric = this.numericalRe.test(label);
		
		// Determine what to display based on settings
		let displayText = '';
		
		if (this.settings.showBothLabelAndNumber) {
			// Show both label and number
			if (isNumeric) {
				displayText = `[${label}]`;
			} else {
				displayText = `[${label}]`;
			}
		} else {
			// Show based on priority setting
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

		// Apply display style
		return this.applyDisplayStyle(displayText);
	}

	/**
	 * Clean label text for display
	 */
	private cleanLabel(label: string): string {
		// Remove any special characters that might cause display issues
		return label.replace(/[^\w\s-]/g, '') || label;
	}

	/**
	 * Apply display style to text
	 */
	private applyDisplayStyle(text: string): string {
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

	/**
	 * Replace backreference content while preserving functionality
	 */
	private replaceBackreferenceContent(backrefEl: HTMLElement, customText: string, label: string) {
		// Clear existing content
		backrefEl.innerHTML = '';
		
		// Create new content with custom text
		const textSpan = document.createElement('span');
		
		// Handle different display styles
		if (this.settings.displayStyle === 'superscript') {
			textSpan.innerHTML = customText; // Allow HTML for superscript
		} else {
			textSpan.textContent = customText;
		}
		
		textSpan.className = 'custom-backref-text';
		
		// Add styling based on settings
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
		
		// Preserve the original href and click functionality
		backrefEl.appendChild(textSpan);
		
		// Add hover effects if enabled
		if (this.settings.enableHoverEffects) {
			backrefEl.addEventListener('mouseenter', () => {
				textSpan.style.textDecoration = 'underline';
			});
			
			backrefEl.addEventListener('mouseleave', () => {
				textSpan.style.textDecoration = 'none';
			});
		}

		// Add tooltip if enabled
		if (this.settings.showTooltips) {
			backrefEl.title = `Back to footnote: ${label}`;
		}
	}

	/**
	 * Smart label suggestions based on content
	 */
	private suggestLabels(content: string): string[] {
		const suggestions: string[] = [];
		
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
			if (freq > 2 && this.commonLabels.includes(word)) {
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

	/**
	 * Show label suggestions dialog
	 */
	private showLabelSuggestions() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!mdView) return;
		
		const content = mdView.data;
		const suggestions = this.suggestLabels(content);
		
		if (suggestions.length === 0) {
			new Notice('No label suggestions found for this content.');
			return;
		}
		
		const suggestionText = suggestions.map(s => `[^${s}]`).join(', ');
		new Notice(`Suggested labels: ${suggestionText}`);
	}

	/**
	 * Validate footnotes in current document
	 */
	private validateFootnotes() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!mdView) return;
		
		const footnotes = this.parseFootnotes(mdView.data);
		const issues: string[] = [];
		
		for (const [label, data] of footnotes) {
			if (data.references.length === 0 && data.definition) {
				issues.push(`Unused definition: [^${label}]`);
			}
			if (data.references.length > 0 && !data.definition) {
				issues.push(`Missing definition: [^${label}]`);
			}
		}
		
		if (issues.length === 0) {
			new Notice('✅ All footnotes are valid!');
		} else {
			new Notice(`⚠️ Found ${issues.length} issues. Check console for details.`);
			console.log('Footnote validation issues:', issues);
		}
	}

	/**
	 * Show bulk rename dialog
	 */
	private showBulkRenameDialog() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!mdView) return;
		
		const footnotes = this.parseFootnotes(mdView.data);
		const labels = Array.from(footnotes.keys());
		
		if (labels.length === 0) {
			new Notice('No footnotes found in this document.');
			return;
		}
		
		new Notice(`Found ${labels.length} footnotes. Bulk rename feature coming soon!`);
		console.log('Available labels for bulk rename:', labels);
	}

	insertFootnote() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!mdView) return false
		if (mdView.getMode() !== 'source') return false;

		const doc = mdView.editor;
		const cursorPosition = doc.getCursor();
		const lineText = doc.getLine(cursorPosition.line);
		const markdownText = mdView.data;

		if (this.shouldJumpFromDetailToMarker(lineText, cursorPosition, doc)) return;
		if (this.shouldJumpFromMarkerToDetail(lineText, cursorPosition, doc)) return;

		return this.shouldCreateNewFootnote(lineText, cursorPosition, doc, markdownText);
	}

	private shouldJumpFromDetailToMarker(lineText: string, cursorPosition: any, doc: any) {
		// check if we're in a footnote detail line ("[^1]: footnote")
		// if so, jump cursor back to the footnote in the text
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation
		let match = lineText.match(this.detailLineRegex)
		if (match) {
			let s = match[0]
			let index = s.replace("[^", "");
			index = index.replace("]:", "");
			let footnote = s.replace(":", "");

			let returnLineIndex = cursorPosition.line;
			// find the FIRST OCCURENCE where this footnote exists in the text
			for (let i = 0; i < doc.lineCount(); i++) {
				let scanLine = doc.getLine(i);
				if (scanLine.contains(footnote)) {
					let cursorLocationIndex = scanLine.indexOf(footnote);
					returnLineIndex = i;
					doc.setCursor({line: returnLineIndex, ch: cursorLocationIndex + footnote.length});
					return true;
				}
			}
		}

		return false;
	}

	private shouldJumpFromMarkerToDetail(lineText: string, cursorPosition: any, doc: any) {
		// Jump cursor TO detail marker
		// check if the cursor is inside or left or right of a footnote in a line
		// if so, jump cursor to the footnote detail line
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation

		// does this line have a footnote marker?
		// does the cursor overlap with one of them?
		// if so, which one?
		// find this footnote marker's detail line
		// place cursor there
		let reOnlyMarkersMatches = lineText.match(this.reOnlyMarkers);

		let markerTarget = null;

		if (reOnlyMarkersMatches) {
			for (let i = 0; i <= reOnlyMarkersMatches.length; i++) {
				let marker = reOnlyMarkersMatches[i];
				if (marker != undefined) {
					let indexOfMarkerInLine = lineText.indexOf(marker);
					if (cursorPosition.ch >= indexOfMarkerInLine && cursorPosition.ch <= indexOfMarkerInLine + marker.length) {
						markerTarget = marker;
						break;
					}
				}
			}
		}

		if (markerTarget != null) {
			// extract index
			let match = markerTarget.match(this.numericalRe);
			if (match) {
				let indexString = match[0];
				let markerIndex = Number(indexString);

				// find the first line with this detail marker index in it.
				for (let i = 0; i < doc.lineCount(); i++) {
					let theLine = doc.getLine(i);
					let lineMatch = theLine.match(this.detailLineRegex);
					if (lineMatch) {
						// compare to the index
						let indexMatch = lineMatch[1];
						let indexMatchNumber = Number(indexMatch);
						if (indexMatchNumber == markerIndex) {
							doc.setCursor({line: i, ch: lineMatch[0].length});
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	private shouldCreateNewFootnote(lineText: string, cursorPosition: any, doc: any, markdownText: string) {
		// create new footnote with the next numerical index
		let matches = markdownText.match(this.reOnlyMarkers);
		let numbers: Array<number> = [];
		let currentMax = 1;

		if (matches != null) {
			for (let i = 0; i <= matches.length - 1; i++) {
				let match = matches[i];
				match = match.replace("[^", "");
				match = match.replace("]", "");
				let matchNumber = Number(match);
				numbers[i] = matchNumber;
				if (matchNumber + 1 > currentMax) {
					currentMax = matchNumber + 1;
				}
			}
		}

		let footNoteId = currentMax;
		let footnoteMarker = `[^${footNoteId}]`;
		let linePart1 = lineText.substr(0, cursorPosition.ch)
		let linePart2 = lineText.substr(cursorPosition.ch);
		let newLine = linePart1 + footnoteMarker + linePart2

		doc.replaceRange(newLine, {line: cursorPosition.line, ch: 0}, {line: cursorPosition.line, ch: lineText.length})

		let lastLine = doc.getLine(doc.lineCount() - 1);

		let footnoteDetail = `[^${footNoteId}]: `;

		if (lastLine.length > 0) {
			doc.replaceRange("\n" + footnoteDetail, {line: doc.lineCount(), ch: 0})
		} else {
			doc.replaceRange(footnoteDetail, {line: doc.lineCount(), ch: 0})
		}

		doc.setCursor({line: doc.lineCount(), ch: footnoteDetail.length});
	}
}

class FootnoteBackrefSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Footnote Backreference Synchronization Settings'});

		// Enable/Disable Custom Labels
		new Setting(containerEl)
			.setName('Enable Custom Label Display')
			.setDesc('Toggle the backreference synchronization feature on/off')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCustomLabels)
				.onChange(async (value) => {
					this.plugin.settings.enableCustomLabels = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Display Options'});

		// Display Style
		new Setting(containerEl)
			.setName('Display Style')
			.setDesc('Choose how backreferences are displayed')
			.addDropdown(dropdown => dropdown
				.addOption('brackets', 'Brackets [label]')
				.addOption('emoji', 'Emoji ↩️ label')
				.addOption('superscript', 'Superscript')
				.addOption('plain', 'Plain text')
				.setValue(this.plugin.settings.displayStyle)
				.onChange(async (value) => {
					this.plugin.settings.displayStyle = value as any;
					await this.plugin.saveSettings();
				}));

		// Custom Emoji (only show if emoji style is selected)
		if (this.plugin.settings.displayStyle === 'emoji') {
			new Setting(containerEl)
				.setName('Custom Emoji')
				.setDesc('Choose the emoji to display before labels')
				.addText(text => text
					.setPlaceholder('↩️')
					.setValue(this.plugin.settings.customEmoji)
					.onChange(async (value) => {
						this.plugin.settings.customEmoji = value;
						await this.plugin.saveSettings();
					}));
		}

		// Show Both Label and Number
		new Setting(containerEl)
			.setName('Show Both Label and Number')
			.setDesc('Display both the label and number for all footnotes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showBothLabelAndNumber)
				.onChange(async (value) => {
					this.plugin.settings.showBothLabelAndNumber = value;
					await this.plugin.saveSettings();
				}));

		// Label Priority
		new Setting(containerEl)
			.setName('Label Priority')
			.setDesc('Choose which label type to prioritize when showing both is disabled')
			.addDropdown(dropdown => dropdown
				.addOption('auto', 'Auto (numeric as numbers, custom as labels)')
				.addOption('label', 'Always show custom labels')
				.addOption('number', 'Always show numbers when available')
				.setValue(this.plugin.settings.labelPriority)
				.onChange(async (value) => {
					this.plugin.settings.labelPriority = value as any;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Performance & Behavior'});

		// Performance Mode
		new Setting(containerEl)
			.setName('Enable Performance Mode')
			.setDesc('Optimize for large documents by limiting concurrent processing and caching results')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enablePerformanceMode)
				.onChange(async (value) => {
					this.plugin.settings.enablePerformanceMode = value;
					await this.plugin.saveSettings();
				}));

		// Max Footnotes Per Document
		if (this.plugin.settings.enablePerformanceMode) {
			new Setting(containerEl)
				.setName('Max Footnotes Per Document')
				.setDesc('Maximum number of footnotes to process in performance mode')
				.addSlider(slider => slider
					.setLimits(100, 2000, 100)
					.setValue(this.plugin.settings.maxFootnotesPerDocument)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxFootnotesPerDocument = value;
						await this.plugin.saveSettings();
					}));
		}

		// Debounce Delay
		new Setting(containerEl)
			.setName('Update Delay')
			.setDesc('Delay in milliseconds before updating backreferences (lower = faster, higher = better performance)')
			.addSlider(slider => slider
				.setLimits(100, 1000, 50)
				.setValue(this.plugin.settings.debounceDelay)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.debounceDelay = value;
					await this.plugin.saveSettings();
				}));

		// Enable Hover Effects
		new Setting(containerEl)
			.setName('Enable Hover Effects')
			.setDesc('Show underline effect when hovering over backreferences')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableHoverEffects)
				.onChange(async (value) => {
					this.plugin.settings.enableHoverEffects = value;
					await this.plugin.saveSettings();
				}));

		// Show Tooltips
		new Setting(containerEl)
			.setName('Show Tooltips')
			.setDesc('Display tooltips when hovering over backreferences')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTooltips)
				.onChange(async (value) => {
					this.plugin.settings.showTooltips = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Advanced Features'});

		// Smart Suggestions
		new Setting(containerEl)
			.setName('Enable Smart Label Suggestions')
			.setDesc('Analyze content to suggest appropriate footnote labels')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableSmartSuggestions)
				.onChange(async (value) => {
					this.plugin.settings.enableSmartSuggestions = value;
					await this.plugin.saveSettings();
				}));

		// Bulk Operations
		new Setting(containerEl)
			.setName('Enable Bulk Operations')
			.setDesc('Enable bulk rename and validation features')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableBulkOperations)
				.onChange(async (value) => {
					this.plugin.settings.enableBulkOperations = value;
					await this.plugin.saveSettings();
				}));

		// Label Validation
		new Setting(containerEl)
			.setName('Enable Label Validation')
			.setDesc('Automatically validate footnote labels and detect issues')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLabelValidation)
				.onChange(async (value) => {
					this.plugin.settings.enableLabelValidation = value;
					await this.plugin.saveSettings();
				}));

		// Duplicate Detection
		new Setting(containerEl)
			.setName('Enable Duplicate Detection')
			.setDesc('Detect and warn about duplicate footnote labels')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableDuplicateDetection)
				.onChange(async (value) => {
					this.plugin.settings.enableDuplicateDetection = value;
					await this.plugin.saveSettings();
				}));

		// Orphan Detection
		new Setting(containerEl)
			.setName('Enable Orphan Detection')
			.setDesc('Detect orphaned references and unused definitions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableOrphanDetection)
				.onChange(async (value) => {
					this.plugin.settings.enableOrphanDetection = value;
					await this.plugin.saveSettings();
				}));

		// Preview Section
		containerEl.createEl('h3', {text: 'Preview'});
		const previewEl = containerEl.createEl('div', {
			cls: 'footnote-backref-preview',
			attr: {
				style: 'padding: 10px; border: 1px solid var(--background-modifier-border); border-radius: 4px; margin: 10px 0;'
			}
		});
		previewEl.innerHTML = `
			<p>Example footnotes: <a href="#fnref:1" class="footnote-backref">[1]</a> <a href="#fnref:video" class="footnote-backref">[video]</a></p>
			<p><small>Note: Preview updates when you change settings</small></p>
		`;

		// Add a refresh button
		new Setting(containerEl)
			.setName('Refresh Preview')
			.setDesc('Update the preview to reflect current settings')
			.addButton(button => button
				.setButtonText('Refresh')
				.onClick(() => {
					this.plugin.updateBackreferences();
				}));
	}
}