/**
 * Read Range Tool for Sheets IDE
 * Replaces readFileTool from Roo Code for Google Sheets operations
 */

import { SheetsApiClient, SheetRange, CellValue } from '../api/SheetsApiClient'
import { SheetsContextBuilder } from '../context/SheetsContextBuilder'

export interface ReadRangeParams {
	sheet: string
	range?: string // A1 notation like "A1:C10" or "A:A" or "1:1"
	startRow?: number
	startCol?: number
	endRow?: number
	endCol?: number
	includeFormulas?: boolean
	includeFormatting?: boolean
	maxRows?: number
	maxCols?: number
}

export interface ReadRangeResult {
	success: boolean
	data: CellValue[][]
	range: SheetRange
	summary: string
	headers?: string[]
	dataTypes?: string[]
	rowCount: number
	columnCount: number
	hasFormulas: boolean
	error?: string
}

/**
 * Tool for reading data from Google Sheets ranges
 * This replaces the file reading functionality for spreadsheet context
 */
export class ReadRangeTool {
	private client: SheetsApiClient
	private contextBuilder: SheetsContextBuilder

	constructor(client: SheetsApiClient) {
		this.client = client
		this.contextBuilder = new SheetsContextBuilder(client)
	}

	/**
	 * Read data from a specified range
	 */
	async execute(params: ReadRangeParams): Promise<ReadRangeResult> {
		try {
			// Parse range parameters
			const range = this.parseRange(params)
			
			// Apply limits to prevent reading too much data
			const limitedRange = this.applyLimits(range, params.maxRows, params.maxCols)
			
			// Read the data
			const data = await this.client.readRange(limitedRange)
			
			// Analyze the data
			const analysis = this.analyzeData(data)
			
			return {
				success: true,
				data: data,
				range: limitedRange,
				summary: this.generateSummary(limitedRange, data, analysis),
				headers: analysis.headers,
				dataTypes: analysis.dataTypes,
				rowCount: data.length,
				columnCount: data[0]?.length || 0,
				hasFormulas: analysis.hasFormulas
			}
		} catch (error) {
			return {
				success: false,
				data: [],
				range: this.parseRange(params),
				summary: `Failed to read range: ${error.message}`,
				rowCount: 0,
				columnCount: 0,
				hasFormulas: false,
				error: error.message
			}
		}
	}

	/**
	 * Parse range parameters into SheetRange format
	 */
	private parseRange(params: ReadRangeParams): SheetRange {
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
			// Handle full column references like "A:A" or "A:C"
			if (a1.includes(':') && !a1.match(/\d/)) {
				const [startCol, endCol] = a1.split(':')
				return {
					startRow: 1,
					startCol: this.columnToNumber(startCol),
					endRow: undefined, // Full column
					endCol: endCol ? this.columnToNumber(endCol) : this.columnToNumber(startCol)
				}
			}

			// Handle full row references like "1:1" or "1:10"
			if (a1.includes(':') && !a1.match(/[A-Z]/i)) {
				const [startRow, endRow] = a1.split(':').map(Number)
				return {
					startRow: startRow,
					startCol: 1,
					endRow: endRow,
					endCol: undefined // Full row
				}
			}

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
	 * Apply row/column limits to prevent reading too much data
	 */
	private applyLimits(range: SheetRange, maxRows?: number, maxCols?: number): SheetRange {
		const limited = { ...range }
		
		const defaultMaxRows = 1000
		const defaultMaxCols = 50
		
		const actualMaxRows = maxRows || defaultMaxRows
		const actualMaxCols = maxCols || defaultMaxCols

		// Apply row limits
		if (limited.endRow) {
			const requestedRows = limited.endRow - limited.startRow + 1
			if (requestedRows > actualMaxRows) {
				limited.endRow = limited.startRow + actualMaxRows - 1
			}
		} else {
			// If no end row specified, limit to max rows
			limited.endRow = limited.startRow + actualMaxRows - 1
		}

		// Apply column limits
		if (limited.endCol) {
			const requestedCols = limited.endCol - limited.startCol + 1
			if (requestedCols > actualMaxCols) {
				limited.endCol = limited.startCol + actualMaxCols - 1
			}
		} else {
			// If no end column specified, limit to max columns
			limited.endCol = limited.startCol + actualMaxCols - 1
		}

		return limited
	}

	/**
	 * Analyze the read data
	 */
	private analyzeData(data: CellValue[][]): {
		headers?: string[]
		dataTypes: string[]
		hasFormulas: boolean
	} {
		if (data.length === 0) {
			return { dataTypes: [], hasFormulas: false }
		}

		// Check for headers (first row contains mostly text)
		const firstRow = data[0]
		const headers = this.detectHeaders(firstRow)

		// Analyze data types for each column
		const dataTypes = this.analyzeDataTypes(data, headers ? 1 : 0)

		// Check for formulas
		const hasFormulas = data.some(row => 
			row.some(cell => cell.formula && cell.formula.startsWith('='))
		)

		return {
			headers,
			dataTypes,
			hasFormulas
		}
	}

	/**
	 * Detect if first row contains headers
	 */
	private detectHeaders(firstRow: CellValue[]): string[] | undefined {
		const headers = firstRow.map(cell => String(cell.value).trim()).filter(h => h.length > 0)
		
		if (headers.length === 0) return undefined

		// Check if headers look like headers (mostly text, not numbers)
		const textCount = headers.filter(h => isNaN(Number(h))).length
		if (textCount > headers.length * 0.7) {
			return headers
		}
		
		return undefined
	}

	/**
	 * Analyze data types for each column
	 */
	private analyzeDataTypes(data: CellValue[][], startRow: number = 0): string[] {
		if (data.length <= startRow) return []
		
		const columnCount = data[0]?.length || 0
		const types: string[] = []

		for (let col = 0; col < columnCount; col++) {
			const columnValues = data.slice(startRow).map(row => row[col]?.value)
				.filter(v => v !== null && v !== undefined && v !== '')
			
			if (columnValues.length === 0) {
				types.push('empty')
				continue
			}

			// Analyze column data types
			let numberCount = 0
			let dateCount = 0
			let booleanCount = 0

			for (const value of columnValues) {
				if (typeof value === 'number') {
					numberCount++
				} else if (typeof value === 'boolean') {
					booleanCount++
				} else if (typeof value === 'string') {
					const str = value.trim()
					if (!isNaN(Number(str)) && str !== '') {
						numberCount++
					} else if (this.isDateString(str)) {
						dateCount++
					}
				}
			}

			const total = columnValues.length
			if (numberCount > total * 0.8) {
				types.push('number')
			} else if (dateCount > total * 0.6) {
				types.push('date')
			} else if (booleanCount > total * 0.8) {
				types.push('boolean')
			} else {
				types.push('text')
			}
		}

		return types
	}

	/**
	 * Check if a string looks like a date
	 */
	private isDateString(str: string): boolean {
		const datePatterns = [
			/^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
			/^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
			/^\d{2}-\d{2}-\d{4}$/,  // MM-DD-YYYY
		]
		
		return datePatterns.some(pattern => pattern.test(str)) && !isNaN(Date.parse(str))
	}

	/**
	 * Generate a summary of the read operation
	 */
	private generateSummary(range: SheetRange, data: CellValue[][], analysis: any): string {
		const rowCount = data.length
		const colCount = data[0]?.length || 0
		
		let summary = `Read ${rowCount} rows and ${colCount} columns from sheet "${range.sheet}"`
		
		if (range.startRow && range.endRow) {
			summary += ` (rows ${range.startRow}-${range.endRow})`
		}
		
		if (range.startCol && range.endCol) {
			const startColLetter = this.numberToColumn(range.startCol)
			const endColLetter = this.numberToColumn(range.endCol)
			summary += ` (columns ${startColLetter}-${endColLetter})`
		}

		if (analysis.headers) {
			summary += `. Headers: ${analysis.headers.join(', ')}`
		}

		if (analysis.hasFormulas) {
			summary += '. Contains formulas'
		}

		return summary
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
	 * Create a formatted display of the data for AI context
	 */
	formatDataForContext(result: ReadRangeResult, maxDisplayRows: number = 10): string {
		if (!result.success || result.data.length === 0) {
			return result.error || 'No data found'
		}

		let output = `## ${result.summary}\n\n`
		
		// Add data type information
		if (result.dataTypes && result.dataTypes.length > 0) {
			output += `**Data Types:** ${result.dataTypes.join(', ')}\n\n`
		}

		// Add table header
		if (result.headers) {
			output += `| ${result.headers.join(' | ')} |\n`
			output += `| ${result.headers.map(() => '---').join(' | ')} |\n`
		}

		// Add data rows (limited for display)
		const displayRows = Math.min(result.data.length, maxDisplayRows)
		const startIndex = result.headers ? 1 : 0 // Skip header row if present
		
		for (let i = startIndex; i < Math.min(startIndex + displayRows, result.data.length); i++) {
			const row = result.data[i]
			const formattedRow = row.map(cell => {
				let value = String(cell.value || '')
				if (cell.formula) {
					value += ` (=${cell.formula.substring(1)})`
				}
				return value
			})
			output += `| ${formattedRow.join(' | ')} |\n`
		}

		// Add truncation notice if needed
		if (result.data.length > displayRows) {
			output += `\n*... and ${result.data.length - displayRows} more rows*\n`
		}

		return output
	}
}