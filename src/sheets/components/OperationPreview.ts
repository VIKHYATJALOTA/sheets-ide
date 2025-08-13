/**
 * OperationPreview - Component for previewing Sheets operations before execution
 * Provides users with clear understanding of what will happen
 */

export interface OperationPreviewData {
	operation: string
	description: string
	target: {
		spreadsheetId: string
		spreadsheetName: string
		range?: string
		sheetName?: string
	}
	parameters: Record<string, any>
	impact: {
		affectedCells?: number
		affectedRows?: number
		affectedColumns?: number
		willOverwrite?: boolean
		willCreate?: boolean
		willDelete?: boolean
	}
	warnings?: string[]
	estimatedTime?: string
}

export interface OperationResult {
	success: boolean
	operation: string
	target: OperationPreviewData['target']
	result?: any
	error?: string
	executionTime?: number
	affectedCells?: number
}

export class OperationPreview {
	private currentPreview?: OperationPreviewData

	constructor() {
		// Initialize with empty state
	}

	/**
	 * Generate preview for read range operation
	 */
	previewReadRange(spreadsheetId: string, spreadsheetName: string, range: string): OperationPreviewData {
		const preview: OperationPreviewData = {
			operation: 'readRange',
			description: `Read data from range ${range}`,
			target: {
				spreadsheetId,
				spreadsheetName,
				range
			},
			parameters: { range },
			impact: {
				willOverwrite: false,
				willCreate: false,
				willDelete: false
			},
			estimatedTime: '< 1 second'
		}

		// Add range-specific details
		if (range.includes(':')) {
			preview.description = `Read data from range ${range} (multiple cells)`
		} else if (range.includes('!')) {
			const [sheetName, cellRange] = range.split('!')
			preview.target.sheetName = sheetName.replace(/'/g, '')
			preview.description = `Read data from ${cellRange} in sheet "${preview.target.sheetName}"`
		}

		this.currentPreview = preview
		return preview
	}

	/**
	 * Generate preview for write range operation
	 */
	previewWriteRange(
		spreadsheetId: string, 
		spreadsheetName: string, 
		range: string, 
		values: any[][]
	): OperationPreviewData {
		const rowCount = values.length
		const colCount = values[0]?.length || 0
		const cellCount = rowCount * colCount

		const preview: OperationPreviewData = {
			operation: 'writeRange',
			description: `Write ${rowCount} rows and ${colCount} columns to range ${range}`,
			target: {
				spreadsheetId,
				spreadsheetName,
				range
			},
			parameters: { range, values },
			impact: {
				affectedCells: cellCount,
				affectedRows: rowCount,
				affectedColumns: colCount,
				willOverwrite: true,
				willCreate: false,
				willDelete: false
			},
			warnings: [
				'This operation will overwrite existing data in the specified range'
			],
			estimatedTime: cellCount > 1000 ? '2-5 seconds' : '< 1 second'
		}

		// Add sheet-specific details
		if (range.includes('!')) {
			const [sheetName, cellRange] = range.split('!')
			preview.target.sheetName = sheetName.replace(/'/g, '')
			preview.description = `Write data to ${cellRange} in sheet "${preview.target.sheetName}"`
		}

		this.currentPreview = preview
		return preview
	}

	/**
	 * Generate preview for create sheet operation
	 */
	previewCreateSheet(
		spreadsheetId: string, 
		spreadsheetName: string, 
		newSheetName: string
	): OperationPreviewData {
		const preview: OperationPreviewData = {
			operation: 'createSheet',
			description: `Create new sheet named "${newSheetName}"`,
			target: {
				spreadsheetId,
				spreadsheetName,
				sheetName: newSheetName
			},
			parameters: { sheetName: newSheetName },
			impact: {
				willOverwrite: false,
				willCreate: true,
				willDelete: false
			},
			warnings: [],
			estimatedTime: '1-2 seconds'
		}

		// Check for potential naming conflicts
		if (newSheetName.length === 0) {
			preview.warnings?.push('Sheet name cannot be empty')
		}
		if (newSheetName.length > 100) {
			preview.warnings?.push('Sheet name is very long and may be truncated')
		}

		this.currentPreview = preview
		return preview
	}

	/**
	 * Generate preview for set formula operation
	 */
	previewSetFormula(
		spreadsheetId: string, 
		spreadsheetName: string, 
		range: string, 
		formula: string
	): OperationPreviewData {
		const preview: OperationPreviewData = {
			operation: 'setFormula',
			description: `Set formula "${formula}" in range ${range}`,
			target: {
				spreadsheetId,
				spreadsheetName,
				range
			},
			parameters: { range, formula },
			impact: {
				willOverwrite: true,
				willCreate: false,
				willDelete: false
			},
			warnings: [],
			estimatedTime: '< 1 second'
		}

		// Validate formula
		if (!formula.startsWith('=')) {
			preview.warnings?.push('Formula should start with "=" sign')
		}

		// Add complexity warnings
		if (formula.includes('IMPORTRANGE') || formula.includes('GOOGLEFINANCE')) {
			preview.warnings?.push('Formula contains external data functions that may take longer to calculate')
			preview.estimatedTime = '2-10 seconds'
		}

		this.currentPreview = preview
		return preview
	}

	/**
	 * Generate preview for format cells operation
	 */
	previewFormatCells(
		spreadsheetId: string, 
		spreadsheetName: string, 
		range: string, 
		format: Record<string, any>
	): OperationPreviewData {
		const formatTypes = Object.keys(format)
		const preview: OperationPreviewData = {
			operation: 'formatCells',
			description: `Apply formatting (${formatTypes.join(', ')}) to range ${range}`,
			target: {
				spreadsheetId,
				spreadsheetName,
				range
			},
			parameters: { range, format },
			impact: {
				willOverwrite: true,
				willCreate: false,
				willDelete: false
			},
			warnings: [
				'This operation will change the visual formatting of cells'
			],
			estimatedTime: '< 1 second'
		}

		this.currentPreview = preview
		return preview
	}

	/**
	 * Get current preview
	 */
	getCurrentPreview(): OperationPreviewData | undefined {
		return this.currentPreview
	}

	/**
	 * Clear current preview
	 */
	clearPreview(): void {
		this.currentPreview = undefined
	}

	/**
	 * Generate operation summary for display
	 */
	generateSummary(preview: OperationPreviewData): string {
		let summary = `Operation: ${preview.operation}\n`
		summary += `Target: ${preview.target.spreadsheetName}`
		
		if (preview.target.sheetName) {
			summary += ` (Sheet: ${preview.target.sheetName})`
		}
		
		if (preview.target.range) {
			summary += ` (Range: ${preview.target.range})`
		}
		
		summary += `\nDescription: ${preview.description}`
		
		if (preview.impact.affectedCells) {
			summary += `\nAffected cells: ${preview.impact.affectedCells}`
		}
		
		if (preview.warnings && preview.warnings.length > 0) {
			summary += `\nWarnings:\n${preview.warnings.map(w => `- ${w}`).join('\n')}`
		}
		
		summary += `\nEstimated time: ${preview.estimatedTime}`
		
		return summary
	}

	/**
	 * Create operation result
	 */
	createResult(
		preview: OperationPreviewData,
		success: boolean,
		result?: any,
		error?: string,
		executionTime?: number
	): OperationResult {
		return {
			success,
			operation: preview.operation,
			target: preview.target,
			result,
			error,
			executionTime,
			affectedCells: preview.impact.affectedCells
		}
	}
}