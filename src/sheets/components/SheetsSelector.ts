/**
 * SheetsSelector - Component for selecting Google Spreadsheets
 * This will be integrated with the webview UI later
 */

export interface SpreadsheetInfo {
	id: string
	name: string
	url: string
	lastModified?: string
}

export interface SheetsSelectionState {
	selectedSpreadsheetId?: string
	selectedSpreadsheetName?: string
	selectedRange?: string
	availableSpreadsheets: SpreadsheetInfo[]
}

export class SheetsSelector {
	private state: SheetsSelectionState = {
		availableSpreadsheets: []
	}

	constructor() {
		// Initialize with empty state
	}

	/**
	 * Update the list of available spreadsheets
	 */
	updateSpreadsheets(spreadsheets: SpreadsheetInfo[]): void {
		this.state.availableSpreadsheets = spreadsheets
	}

	/**
	 * Select a spreadsheet
	 */
	selectSpreadsheet(id: string, name: string): void {
		this.state.selectedSpreadsheetId = id
		this.state.selectedSpreadsheetName = name
		// Clear range selection when changing spreadsheet
		this.state.selectedRange = undefined
	}

	/**
	 * Select a range within the current spreadsheet
	 */
	selectRange(range: string): void {
		this.state.selectedRange = range
	}

	/**
	 * Get current selection state
	 */
	getState(): SheetsSelectionState {
		return { ...this.state }
	}

	/**
	 * Check if a spreadsheet is selected
	 */
	hasSpreadsheetSelected(): boolean {
		return !!this.state.selectedSpreadsheetId
	}

	/**
	 * Check if a range is selected
	 */
	hasRangeSelected(): boolean {
		return !!this.state.selectedRange
	}

	/**
	 * Get selected spreadsheet info
	 */
	getSelectedSpreadsheet(): SpreadsheetInfo | undefined {
		if (!this.state.selectedSpreadsheetId) return undefined
		
		return this.state.availableSpreadsheets.find(
			sheet => sheet.id === this.state.selectedSpreadsheetId
		)
	}

	/**
	 * Clear all selections
	 */
	clearSelection(): void {
		this.state.selectedSpreadsheetId = undefined
		this.state.selectedSpreadsheetName = undefined
		this.state.selectedRange = undefined
	}

	/**
	 * Validate A1 notation range
	 */
	static isValidRange(range: string): boolean {
		// Basic A1 notation validation
		const a1Pattern = /^[A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?$/
		const namedRangePattern = /^[A-Za-z_][A-Za-z0-9_]*$/
		const sheetRangePattern = /^'?[^']*'?![A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?$/
		
		return a1Pattern.test(range) || 
			   namedRangePattern.test(range) || 
			   sheetRangePattern.test(range)
	}

	/**
	 * Parse range to extract sheet name and cell range
	 */
	static parseRange(range: string): { sheetName?: string; cellRange: string } {
		const sheetMatch = range.match(/^'?([^']*)'?!(.+)$/)
		if (sheetMatch) {
			return {
				sheetName: sheetMatch[1],
				cellRange: sheetMatch[2]
			}
		}
		return { cellRange: range }
	}
}