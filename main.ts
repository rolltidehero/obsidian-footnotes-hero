import { MarkdownView, Plugin, WorkspaceLeaf } from 'obsidian';

interface FootnoteData {
	label: string;
	references: string[];
	definition: string;
}

export default class MyPlugin extends Plugin {

	// Extended regex patterns to support both numeric and custom labels
	private detailLineRegex = /\[\^([^\]]+)\]\:/;
	private reOnlyMarkers = /\[\^([^\]]+)\]/gi;
	private numericalRe = /(\d+)/;
	
	// Debouncing for performance
	private updateTimeout: number | null = null;
	private readonly DEBOUNCE_DELAY = 300; // milliseconds

	async onload() {
		// Register the existing footnote command
		this.addCommand({
			id: 'insert-footnote',
			name: 'Insert and Navigate Footnote',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.insertFootnote();
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

		// Initial update for any open files
		this.updateBackreferences();
	}

	async onunload() {
		// Clear any pending updates
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}
	}

	/**
	 * Debounced function to update backreferences
	 * Prevents excessive updates during rapid changes
	 */
	private debouncedUpdateBackreferences() {
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}
		
		this.updateTimeout = window.setTimeout(() => {
			this.updateBackreferences();
		}, this.DEBOUNCE_DELAY);
	}

	/**
	 * Main function to update backreferences in all open markdown views
	 */
	private updateBackreferences() {
		const leaves = this.app.workspace.getLeavesOfType('markdown');
		
		leaves.forEach(leaf => {
			if (leaf.view instanceof MarkdownView) {
				this.updateBackreferencesForView(leaf.view);
			}
		});
	}

	/**
	 * Update backreferences for a specific markdown view
	 */
	private updateBackreferencesForView(mdView: MarkdownView) {
		try {
			// Get the rendered content container
			const contentEl = mdView.contentEl;
			if (!contentEl) return;

			// Parse footnotes from the markdown content
			const footnotes = this.parseFootnotes(mdView.data);
			
			// Find and update backreference elements
			this.updateBackreferenceElements(contentEl, footnotes);
			
		} catch (error) {
			console.error('Error updating backreferences:', error);
		}
	}

	/**
	 * Parse footnotes from markdown content
	 * Returns a map of footnote labels to their data
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

		return footnotes;
	}

	/**
	 * Update backreference elements in the DOM
	 */
	private updateBackreferenceElements(contentEl: HTMLElement, footnotes: Map<string, FootnoteData>) {
		// Find all backreference elements
		const backrefElements = contentEl.querySelectorAll('.footnote-backref');
		
		backrefElements.forEach((backrefEl) => {
			try {
				this.updateSingleBackreference(backrefEl as HTMLElement, footnotes);
			} catch (error) {
				console.error('Error updating single backreference:', error);
			}
		});
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
	 * Create custom backreference text based on footnote data
	 */
	private createCustomBackreferenceText(footnoteData: FootnoteData): string {
		const label = footnoteData.label;
		
		// For numeric labels, show the number
		if (this.numericalRe.test(label)) {
			return `[${label}]`;
		}
		
		// For custom labels, show the label text
		// Remove any special characters that might cause display issues
		const cleanLabel = label.replace(/[^\w\s-]/g, '');
		return cleanLabel || label;
	}

	/**
	 * Replace backreference content while preserving functionality
	 */
	private replaceBackreferenceContent(backrefEl: HTMLElement, customText: string, label: string) {
		// Clear existing content
		backrefEl.innerHTML = '';
		
		// Create new content with custom text
		const textSpan = document.createElement('span');
		textSpan.textContent = customText;
		textSpan.className = 'custom-backref-text';
		
		// Add some basic styling
		textSpan.style.cssText = `
			color: var(--text-accent);
			font-weight: 500;
			text-decoration: none;
			cursor: pointer;
		`;
		
		// Preserve the original href and click functionality
		backrefEl.appendChild(textSpan);
		
		// Add hover effect
		backrefEl.addEventListener('mouseenter', () => {
			textSpan.style.textDecoration = 'underline';
		});
		
		backrefEl.addEventListener('mouseleave', () => {
			textSpan.style.textDecoration = 'none';
		});
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