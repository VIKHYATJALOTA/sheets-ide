/**
 * Set Formula Tool for Sheets IDE
 * Sets formulas in Google Sheets cells
 */

import { SheetsApiClient, SheetRange } from '../api/SheetsApiClient'

export interface SetFormulaParams {
	sheet: string
	range?: string // A1 notation like "A1" or "A1:C10"
	startRow?: number
	startCol?: number
	endRow?: number
	endCol?: number
	formula: string
	arrayFormula?: boolean // Whether to use ARRAYFORMULA
	relative?: boolean // Whether to use relative references (default: true)
}

export interface SetFormulaResult {
	success: boolean
	range: SheetRange
	formula: string
	cellsAffected: number
	summary: string
	warnings?: string[]
	error?: string
}

/**
 * Tool for setting formulas in Google Sheets
 */
export class SetFormulaTool {
	private client: SheetsApiClient

	constructor(client: SheetsApiClient) {
		this.client = client
	}

	/**
	 * Set formula in specified range
	 */
	async execute(params: SetFormulaParams): Promise<SetFormulaResult> {
		try {
			// Validate and prepare formula
			const validatedFormula = this.validateAndPrepareFormula(params.formula, params.arrayFormula)
			
			// Parse range parameters
			const range = this.parseRange(params)
			
			// Calculate cells affected
			const cellsAffected = this.calculateCellsAffected(range)
			
			// Set the formula
			if (cellsAffected === 1) {
				// Single cell formula
				await this.client.setFormula(range, validatedFormula)
			} else {
				// Multiple cells - use array formula or apply to each cell
				await this.setFormulaRange(range, validatedFormula, params.relative !== false)
			}

			return {
				success: true,
				range: range,
				formula: validatedFormula,
				cellsAffected: cellsAffected,
				summary: this.generateSummary(range, validatedFormula, cellsAffected),
				warnings: this.generateWarnings(params, cellsAffected)
			}
		} catch (error) {
			return {
				success: false,
				range: this.parseRange(params),
				formula: params.formula,
				cellsAffected: 0,
				summary: `Failed to set formula: ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Validate and prepare formula
	 */
	private validateAndPrepareFormula(formula: string, arrayFormula?: boolean): string {
		let cleanFormula = formula.trim()
		
		// Ensure formula starts with =
		if (!cleanFormula.startsWith('=')) {
			cleanFormula = '=' + cleanFormula
		}

		// Wrap with ARRAYFORMULA if requested
		if (arrayFormula && !cleanFormula.toUpperCase().includes('ARRAYFORMULA')) {
			cleanFormula = `=ARRAYFORMULA(${cleanFormula.substring(1)})`
		}

		// Basic validation
		if (cleanFormula.length < 2) {
			throw new Error('Formula cannot be empty')
		}

		// Check for balanced parentheses
		const openParens = (cleanFormula.match(/\(/g) || []).length
		const closeParens = (cleanFormula.match(/\)/g) || []).length
		if (openParens !== closeParens) {
			throw new Error('Formula has unbalanced parentheses')
		}

		return cleanFormula
	}

	/**
	 * Parse range parameters into SheetRange format
	 */
	private parseRange(params: SetFormulaParams): SheetRange {
		const range: SheetRange = {
			sheet: params.sheet,
			startRow: 1,
			startCol: 1
		}

		if (params.range) {
			// Parse A1 notation
			const parsed = this.parseA1Notation(params.range)
			if (parsed) {
				range.startRow = parsed.startRow
				range.startCol = parsed.startCol
				range.endRow = parsed.endRow
				range.endCol = parsed.endCol
			}
		} else {
			// Use explicit row/col parameters
			range.startRow = params.startRow || 1
			range.startCol = params.startCol || 1
			range.endRow = params.endRow
			range.endCol = params.endCol
		}

		return range
	}

	/**
	 * Parse A1 notation into row/column numbers
	 */
	private parseA1Notation(a1: string): { startRow: number; startCol: number; endRow?: number; endCol?: number } | null {
		try {
			// Handle cell ranges like "A1:C10"
			if (a1.includes(':')) {
				const [start, end] = a1.split(':')
				const startParsed = this.parseCellReference(start)
				const endParsed = this.parseCellReference(end)
				
				if (startParsed && endParsed) {
					return {
						startRow: startParsed.row,
						startCol: startParsed.col,
						endRow: endParsed.row,
						endCol: endParsed.col
					}
				}
			}

			// Handle single cell like "A1"
			const cellParsed = this.parseCellReference(a1)
			if (cellParsed) {
				return {
					startRow: cellParsed.row,
					startCol: cellParsed.col,
					endRow: cellParsed.row,
					endCol: cellParsed.col
				}
			}

			return null
		} catch (error) {
			console.warn('Failed to parse A1 notation:', a1, error)
			return null
		}
	}

	/**
	 * Parse a single cell reference like "A1" or "BC123"
	 */
	private parseCellReference(cell: string): { row: number; col: number } | null {
		const match = cell.match(/^([A-Z]+)(\d+)$/i)
		if (!match) return null

		const [, colStr, rowStr] = match
		return {
			row: parseInt(rowStr, 10),
			col: this.columnToNumber(colStr)
		}
	}

	/**
	 * Convert column letter(s) to number (A=1, B=2, ..., AA=27, etc.)
	 */
	private columnToNumber(col: string): number {
		let result = 0
		for (let i = 0; i < col.length; i++) {
			result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1)
		}
		return result
	}

	/**
	 * Calculate number of cells affected
	 */
	private calculateCellsAffected(range: SheetRange): number {
		const rows = (range.endRow || range.startRow) - range.startRow + 1
		const cols = (range.endCol || range.startCol) - range.startCol + 1
		return rows * cols
	}

	/**
	 * Set formula across a range
	 */
	private async setFormulaRange(range: SheetRange, formula: string, useRelativeReferences: boolean): Promise<void> {
		const rows = (range.endRow || range.startRow) - range.startRow + 1
		const cols = (range.endCol || range.startCol) - range.startCol + 1

		// Create formula data for each cell
		const formulaData = []
		for (let row = 0; row < rows; row++) {
			const rowData = []
			for (let col = 0; col < cols; col++) {
				let cellFormula = formula
				
				if (useRelativeReferences && (rows > 1 || cols > 1)) {
					// Adjust relative references
					cellFormula = this.adjustRelativeReferences(formula, row, col)
				}
				
				rowData.push({
					value: '',
					formula: cellFormula
				})
			}
			formulaData.push(rowData)
		}

		// Write the formulas
		await this.client.writeRange(range, formulaData)
	}

	/**
	 * Adjust relative references in formula
	 */
	private adjustRelativeReferences(formula: string, rowOffset: number, colOffset: number): string {
		// This is a simplified implementation
		// In a full implementation, you'd parse the formula and adjust cell references
		
		// For now, just return the original formula
		// Real implementation would need to parse and adjust references like A1, B2, etc.
		return formula
	}

	/**
	 * Generate summary of the formula operation
	 */
	private generateSummary(range: SheetRange, formula: string, cellsAffected: number): string {
		let summary = `Set formula "${formula}" in ${cellsAffected} cell(s) in sheet "${range.sheet}"`
		
		if (cellsAffected === 1) {
			const cellRef = this.numberToColumn(range.startCol) + range.startRow
			summary += ` (${cellRef})`
		} else {
			const startRef = this.numberToColumn(range.startCol) + range.startRow
			const endRef = this.numberToColumn(range.endCol || range.startCol) + (range.endRow || range.startRow)
			summary += ` (${startRef}:${endRef})`
		}

		return summary
	}

	/**
	 * Generate warnings about the formula operation
	 */
	private generateWarnings(params: SetFormulaParams, cellsAffected: number): string[] {
		const warnings: string[] = []

		// Warn about large ranges
		if (cellsAffected > 1000) {
			warnings.push(`Setting formula in ${cellsAffected} cells may impact performance`)
		}

		// Warn about array formulas
		if (params.arrayFormula) {
			warnings.push('Array formulas can be resource-intensive for large ranges')
		}

		// Warn about complex formulas
		if (params.formula.length > 200) {
			warnings.push('Complex formulas may be difficult to maintain')
		}

		// Check for potentially problematic functions
		const problematicFunctions = ['IMPORTDATA', 'IMPORTHTML', 'IMPORTXML', 'IMPORTRANGE']
		const upperFormula = params.formula.toUpperCase()
		for (const func of problematicFunctions) {
			if (upperFormula.includes(func)) {
				warnings.push(`${func} function may have rate limits or require permissions`)
			}
		}

		return warnings
	}

	/**
	 * Convert column number to letter(s) (1=A, 2=B, ..., 27=AA, etc.)
	 */
	private numberToColumn(num: number): string {
		let result = ''
		while (num > 0) {
			num-- // Adjust for 1-based indexing
			result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result
			num = Math.floor(num / 26)
		}
		return result
	}

	/**
	 * Set common formulas with predefined templates
	 */
	async setCommonFormula(params: {
		sheet: string
		range: string
		type: 'sum' | 'average' | 'count' | 'max' | 'min' | 'vlookup' | 'if' | 'concatenate'
		dataRange?: string
		condition?: string
		lookupTable?: string
		lookupColumn?: number
	}): Promise<SetFormulaResult> {
		let formula = ''

		switch (params.type) {
			case 'sum':
				formula = `=SUM(${params.dataRange || 'A:A'})`
				break
			case 'average':
				formula = `=AVERAGE(${params.dataRange || 'A:A'})`
				break
			case 'count':
				formula = `=COUNT(${params.dataRange || 'A:A'})`
				break
			case 'max':
				formula = `=MAX(${params.dataRange || 'A:A'})`
				break
			case 'min':
				formula = `=MIN(${params.dataRange || 'A:A'})`
				break
			case 'vlookup':
				formula = `=VLOOKUP(A1,${params.lookupTable || 'Sheet2!A:B'},${params.lookupColumn || 2},FALSE)`
				break
			case 'if':
				formula = `=IF(${params.condition || 'A1>0'},"Yes","No")`
				break
			case 'concatenate':
				formula = `=CONCATENATE(${params.dataRange || 'A1,B1'})`
				break
			default:
				throw new Error(`Unknown formula type: ${params.type}`)
		}

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			formula: formula
		})
	}

	/**
	 * Set conditional formula based on data analysis
	 */
	async setConditionalFormula(params: {
		sheet: string
		range: string
		sourceRange: string
		operation: 'sum_if' | 'count_if' | 'average_if' | 'max_if' | 'min_if'
		criteria: string
	}): Promise<SetFormulaResult> {
		let formula = ''

		switch (params.operation) {
			case 'sum_if':
				formula = `=SUMIF(${params.sourceRange},"${params.criteria}",${params.sourceRange})`
				break
			case 'count_if':
				formula = `=COUNTIF(${params.sourceRange},"${params.criteria}")`
				break
			case 'average_if':
				formula = `=AVERAGEIF(${params.sourceRange},"${params.criteria}",${params.sourceRange})`
				break
			case 'max_if':
				formula = `=MAXIFS(${params.sourceRange},${params.sourceRange},"${params.criteria}")`
				break
			case 'min_if':
				formula = `=MINIFS(${params.sourceRange},${params.sourceRange},"${params.criteria}")`
				break
			default:
				throw new Error(`Unknown conditional operation: ${params.operation}`)
		}

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			formula: formula
		})
	}

	/**
	 * Create array formula for bulk operations
	 */
	async setArrayFormula(params: {
		sheet: string
		range: string
		formula: string
		dataRange: string
	}): Promise<SetFormulaResult> {
		// Wrap formula in ARRAYFORMULA
		const arrayFormula = `=ARRAYFORMULA(${params.formula.replace(/^=/, '')})`

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			formula: arrayFormula,
			arrayFormula: true
		})
	}
}