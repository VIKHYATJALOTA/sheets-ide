/**
 * Write Range Tool for Sheets IDE
 * Replaces writeToFileTool from Roo Code for Google Sheets operations
 */

import { SheetsApiClient, SheetRange, CellValue, CellFormat } from '../api/SheetsApiClient'

export interface WriteRangeParams {
	sheet: string
	range?: string // A1 notation like "A1:C10"
	startRow?: number
	startCol?: number
	data: (string | number | boolean)[][] | CellValue[][]
	headers?: string[]
	format?: CellFormat
	overwrite?: boolean // Whether to overwrite existing data
	insertMode?: 'overwrite' | 'insert_rows' | 'append'
}

export interface WriteRangeResult {
	success: boolean
	range: SheetRange
	rowsWritten: number
	columnsWritten: number
	summary: string
	warnings?: string[]
	error?: string
}

/**
 * Tool for writing data to Google Sheets ranges
 * This replaces the file writing functionality for spreadsheet context
 */
export class WriteRangeTool {
	private client: SheetsApiClient

	constructor(client: SheetsApiClient) {
		this.client = client
	}

	/**
	 * Write data to a specified range
	 */
	async execute(params: WriteRangeParams): Promise<WriteRangeResult> {
		try {
			// Prepare the data
			const cellData = this.prepareCellData(params)
			
			// Determine the target range
			const range = this.determineRange(params, cellData)
			
			// Handle different insert modes
			if (params.insertMode === 'insert_rows') {
				await this.insertRows(range, cellData.length)
			} else if (params.insertMode === 'append') {
				const appendRange = await this.findAppendRange(params.sheet)
				range.startRow = appendRange.startRow
				range.startCol = appendRange.startCol
			}

			// Write the data
			await this.client.writeRange(range, cellData)

			// Apply formatting if specified
			if (params.format) {
				await this.client.formatCells(range, params.format)
			}

			return {
				success: true,
				range: range,
				rowsWritten: cellData.length,
				columnsWritten: cellData[0]?.length || 0,
				summary: this.generateSummary(range, cellData, params),
				warnings: this.generateWarnings(params, cellData)
			}
		} catch (error) {
			return {
				success: false,
				range: this.determineRange(params, []),
				rowsWritten: 0,
				columnsWritten: 0,
				summary: `Failed to write data: ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Prepare cell data from input parameters
	 */
	private prepareCellData(params: WriteRangeParams): CellValue[][] {
		let data: (string | number | boolean | CellValue)[][] = params.data.map(row =>
			row.map(cell => {
				if (typeof cell === 'object' && 'value' in cell) {
					return cell as CellValue
				} else {
					return cell
				}
			})
		)
		
		// Add headers if specified
		if (params.headers && params.headers.length > 0) {
			const headerRow = params.headers.map(header => header as string | number | boolean)
			data = [headerRow, ...data]
		}

		// Convert all values to CellValue format
		return data.map(row =>
			row.map(cell => {
				if (typeof cell === 'object' && 'value' in cell) {
					return cell as CellValue
				} else {
					return { value: cell }
				}
			})
		)
	}

	/**
	 * Determine the target range for writing
	 */
	private determineRange(params: WriteRangeParams, cellData: CellValue[][]): SheetRange {
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
		}

		// Calculate end range based on data size if not specified
		if (!range.endRow && cellData.length > 0) {
			range.endRow = range.startRow + cellData.length - 1
		}
		if (!range.endCol && cellData[0]?.length > 0) {
			range.endCol = range.startCol + cellData[0].length - 1
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
					startCol: cellParsed.col
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
	 * Insert rows at the specified position
	 */
	private async insertRows(range: SheetRange, numRows: number): Promise<void> {
		// This would require additional Sheets API calls to insert rows
		// For now, we'll just log the intention
		console.log(`Would insert ${numRows} rows at row ${range.startRow} in sheet ${range.sheet}`)
	}

	/**
	 * Find the next available row for appending data
	 */
	private async findAppendRange(sheetName: string): Promise<{ startRow: number; startCol: number }> {
		try {
			// Get sheet info to find the last row with data
			const spreadsheetInfo = await this.client.getSpreadsheetInfo()
			const sheet = spreadsheetInfo.sheets.find(s => s.title === sheetName)
			
			if (!sheet) {
				throw new Error(`Sheet "${sheetName}" not found`)
			}

			// For now, we'll append at the end of the sheet
			// In a real implementation, we'd scan for the last row with data
			return {
				startRow: sheet.rowCount + 1,
				startCol: 1
			}
		} catch (error) {
			// Default to row 1 if we can't determine the append position
			return {
				startRow: 1,
				startCol: 1
			}
		}
	}

	/**
	 * Generate a summary of the write operation
	 */
	private generateSummary(range: SheetRange, cellData: CellValue[][], params: WriteRangeParams): string {
		const rowCount = cellData.length
		const colCount = cellData[0]?.length || 0
		
		let summary = `Wrote ${rowCount} rows and ${colCount} columns to sheet "${range.sheet}"`
		
		if (range.startRow && range.endRow) {
			summary += ` (rows ${range.startRow}-${range.endRow})`
		}
		
		if (range.startCol && range.endCol) {
			const startColLetter = this.numberToColumn(range.startCol)
			const endColLetter = this.numberToColumn(range.endCol)
			summary += ` (columns ${startColLetter}-${endColLetter})`
		}

		if (params.headers) {
			summary += `. Included headers: ${params.headers.join(', ')}`
		}

		if (params.format) {
			summary += '. Applied formatting'
		}

		return summary
	}

	/**
	 * Generate warnings about the write operation
	 */
	private generateWarnings(params: WriteRangeParams, cellData: CellValue[][]): string[] {
		const warnings: string[] = []

		// Check for large data writes
		const totalCells = cellData.length * (cellData[0]?.length || 0)
		if (totalCells > 10000) {
			warnings.push(`Writing ${totalCells} cells - this may take some time`)
		}

		// Check for mixed data types in columns
		if (cellData.length > 1) {
			const columnCount = cellData[0]?.length || 0
			for (let col = 0; col < columnCount; col++) {
				const columnTypes = new Set()
				cellData.forEach(row => {
					if (row[col]) {
						columnTypes.add(typeof row[col].value)
					}
				})
				if (columnTypes.size > 1) {
					const colLetter = this.numberToColumn(col + 1)
					warnings.push(`Column ${colLetter} contains mixed data types`)
				}
			}
		}

		// Check for overwrite without explicit permission
		if (!params.overwrite && params.insertMode !== 'append') {
			warnings.push('Data may overwrite existing content - use overwrite:true to confirm')
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
	 * Write data from CSV-like string
	 */
	async writeFromCSV(params: {
		sheet: string
		csvData: string
		delimiter?: string
		hasHeaders?: boolean
		startRow?: number
		startCol?: number
	}): Promise<WriteRangeResult> {
		try {
			const delimiter = params.delimiter || ','
			const lines = params.csvData.trim().split('\n')
			
			const data: string[][] = lines.map(line => 
				line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''))
			)

			let headers: string[] | undefined
			let dataRows = data

			if (params.hasHeaders && data.length > 0) {
				headers = data[0]
				dataRows = data.slice(1)
			}

			return await this.execute({
				sheet: params.sheet,
				startRow: params.startRow,
				startCol: params.startCol,
				data: dataRows,
				headers: headers,
				overwrite: true
			})
		} catch (error) {
			return {
				success: false,
				range: { sheet: params.sheet, startRow: 1, startCol: 1 },
				rowsWritten: 0,
				columnsWritten: 0,
				summary: `Failed to write CSV data: ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Write data from JSON array
	 */
	async writeFromJSON(params: {
		sheet: string
		jsonData: any[]
		includeHeaders?: boolean
		startRow?: number
		startCol?: number
	}): Promise<WriteRangeResult> {
		try {
			if (!Array.isArray(params.jsonData) || params.jsonData.length === 0) {
				throw new Error('JSON data must be a non-empty array')
			}

			// Extract headers from first object
			const firstItem = params.jsonData[0]
			const headers = Object.keys(firstItem)
			
			// Convert objects to rows
			const data = params.jsonData.map(item => 
				headers.map(header => item[header] ?? '')
			)

			return await this.execute({
				sheet: params.sheet,
				startRow: params.startRow,
				startCol: params.startCol,
				data: data,
				headers: params.includeHeaders ? headers : undefined,
				overwrite: true
			})
		} catch (error) {
			return {
				success: false,
				range: { sheet: params.sheet, startRow: 1, startCol: 1 },
				rowsWritten: 0,
				columnsWritten: 0,
				summary: `Failed to write JSON data: ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Append a single row to the sheet
	 */
	async appendRow(params: {
		sheet: string
		data: (string | number | boolean)[]
		format?: CellFormat
	}): Promise<WriteRangeResult> {
		return await this.execute({
			sheet: params.sheet,
			data: [params.data],
			format: params.format,
			insertMode: 'append',
			overwrite: true
		})
	}

	/**
	 * Clear a range (write empty values)
	 */
	async clearRange(params: {
		sheet: string
		range?: string
		startRow?: number
		startCol?: number
		endRow?: number
		endCol?: number
	}): Promise<WriteRangeResult> {
		try {
			const clearParams: WriteRangeParams = {
				...params,
				data: [[]]
			}
			const range = this.determineRange(clearParams, [])
			
			// Calculate dimensions
			const rows = (range.endRow || range.startRow) - range.startRow + 1
			const cols = (range.endCol || range.startCol) - range.startCol + 1
			
			// Create empty data
			const emptyData = Array(rows).fill(null).map(() => 
				Array(cols).fill(null).map(() => ({ value: '' }))
			)

			await this.client.writeRange(range, emptyData)

			return {
				success: true,
				range: range,
				rowsWritten: rows,
				columnsWritten: cols,
				summary: `Cleared ${rows} rows and ${cols} columns in sheet "${range.sheet}"`
			}
		} catch (error) {
			return {
				success: false,
				range: { sheet: params.sheet, startRow: 1, startCol: 1 },
				rowsWritten: 0,
				columnsWritten: 0,
				summary: `Failed to clear range: ${error.message}`,
				error: error.message
			}
		}
	}
}