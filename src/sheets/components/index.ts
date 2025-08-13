/**
 * Sheets IDE Components
 * Frontend components for Google Sheets integration
 */

import { SheetsSelector, type SpreadsheetInfo, type SheetsSelectionState } from './SheetsSelector'
import { RangeSelector, type RangeInfo, type RangeSuggestion } from './RangeSelector'
import {
	OperationPreview,
	type OperationPreviewData,
	type OperationResult
} from './OperationPreview'

// Re-export all types and classes
export { SheetsSelector, type SpreadsheetInfo, type SheetsSelectionState }
export { RangeSelector, type RangeInfo, type RangeSuggestion }
export { OperationPreview, type OperationPreviewData, type OperationResult }

/**
 * Combined Sheets UI Manager
 * Coordinates all Sheets-related UI components
 */
export class SheetsUIManager {
	public sheetsSelector: SheetsSelector
	public rangeSelector: RangeSelector
	public operationPreview: OperationPreview

	constructor() {
		this.sheetsSelector = new SheetsSelector()
		this.rangeSelector = new RangeSelector()
		this.operationPreview = new OperationPreview()
	}

	/**
	 * Initialize with spreadsheet data
	 */
	initialize(spreadsheets: SpreadsheetInfo[]): void {
		this.sheetsSelector.updateSpreadsheets(spreadsheets)
	}

	/**
	 * Select spreadsheet and update UI state
	 */
	selectSpreadsheet(id: string, name: string): void {
		this.sheetsSelector.selectSpreadsheet(id, name)
		// Clear any existing operation preview when changing spreadsheet
		this.operationPreview.clearPreview()
	}

	/**
	 * Select range and update UI state
	 */
	selectRange(range: string): boolean {
		const rangeInfo = this.rangeSelector.parseRange(range)
		if (rangeInfo.isValid) {
			this.sheetsSelector.selectRange(range)
			this.rangeSelector.addToRecent(range)
		}
		return rangeInfo.isValid
	}

	/**
	 * Get current selection state
	 */
	getCurrentSelection(): {
		spreadsheet?: SpreadsheetInfo
		range?: string
		hasValidSelection: boolean
	} {
		const spreadsheet = this.sheetsSelector.getSelectedSpreadsheet()
		const state = this.sheetsSelector.getState()
		
		return {
			spreadsheet,
			range: state.selectedRange,
			hasValidSelection: !!spreadsheet && !!state.selectedRange
		}
	}

	/**
	 * Preview an operation before execution
	 */
	previewOperation(
		operation: string, 
		parameters: Record<string, any>
	): OperationPreviewData | null {
		const selection = this.getCurrentSelection()
		if (!selection.spreadsheet) {
			return null
		}

		const { spreadsheet, range } = selection

		switch (operation) {
			case 'readRange':
				if (!range) return null
				return this.operationPreview.previewReadRange(
					spreadsheet.id,
					spreadsheet.name,
					range
				)

			case 'writeRange':
				if (!range || !parameters.values) return null
				return this.operationPreview.previewWriteRange(
					spreadsheet.id,
					spreadsheet.name,
					range,
					parameters.values
				)

			case 'createSheet':
				if (!parameters.sheetName) return null
				return this.operationPreview.previewCreateSheet(
					spreadsheet.id,
					spreadsheet.name,
					parameters.sheetName
				)

			case 'setFormula':
				if (!range || !parameters.formula) return null
				return this.operationPreview.previewSetFormula(
					spreadsheet.id,
					spreadsheet.name,
					range,
					parameters.formula
				)

			case 'formatCells':
				if (!range || !parameters.format) return null
				return this.operationPreview.previewFormatCells(
					spreadsheet.id,
					spreadsheet.name,
					range,
					parameters.format
				)

			default:
				return null
		}
	}

	/**
	 * Clear all selections and previews
	 */
	reset(): void {
		this.sheetsSelector.clearSelection()
		this.operationPreview.clearPreview()
	}

	/**
	 * Get state for serialization/persistence
	 */
	getState(): {
		selectedSpreadsheetId?: string
		selectedSpreadsheetName?: string
		selectedRange?: string
		recentRanges: string[]
	} {
		const sheetsState = this.sheetsSelector.getState()
		return {
			selectedSpreadsheetId: sheetsState.selectedSpreadsheetId,
			selectedSpreadsheetName: sheetsState.selectedSpreadsheetName,
			selectedRange: sheetsState.selectedRange,
			recentRanges: [] // Would need to expose this from RangeSelector
		}
	}

	/**
	 * Restore state from serialized data
	 */
	setState(state: {
		selectedSpreadsheetId?: string
		selectedSpreadsheetName?: string
		selectedRange?: string
		recentRanges?: string[]
	}): void {
		if (state.selectedSpreadsheetId && state.selectedSpreadsheetName) {
			this.sheetsSelector.selectSpreadsheet(
				state.selectedSpreadsheetId,
				state.selectedSpreadsheetName
			)
		}
		
		if (state.selectedRange) {
			this.sheetsSelector.selectRange(state.selectedRange)
		}

		// Restore recent ranges if available
		if (state.recentRanges) {
			state.recentRanges.forEach(range => {
				this.rangeSelector.addToRecent(range)
			})
		}
	}
}