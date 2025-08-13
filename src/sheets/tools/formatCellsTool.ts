/**
 * Format Cells Tool for Sheets IDE
 * Applies formatting to Google Sheets cells
 */

import { SheetsApiClient, SheetRange, CellFormat } from '../api/SheetsApiClient'

export interface FormatCellsParams {
	sheet: string
	range?: string // A1 notation like "A1:C10"
	startRow?: number
	startCol?: number
	endRow?: number
	endCol?: number
	format: CellFormat
	preset?: 'header' | 'currency' | 'percentage' | 'date' | 'highlight' | 'warning' | 'success' | 'error'
}

export interface FormatCellsResult {
	success: boolean
	range: SheetRange
	format: CellFormat
	cellsFormatted: number
	summary: string
	warnings?: string[]
	error?: string
}

/**
 * Tool for formatting cells in Google Sheets
 */
export class FormatCellsTool {
	private client: SheetsApiClient

	constructor(client: SheetsApiClient) {
		this.client = client
	}

	/**
	 * Format cells in specified range
	 */
	async execute(params: FormatCellsParams): Promise<FormatCellsResult> {
		try {
			// Apply preset if specified
			const format = params.preset ? this.applyPreset(params.preset, params.format) : params.format
			
			// Parse range parameters
			const range = this.parseRange(params)
			
			// Calculate cells affected
			const cellsFormatted = this.calculateCellsAffected(range)
			
			// Apply the formatting
			await this.client.formatCells(range, format)

			return {
				success: true,
				range: range,
				format: format,
				cellsFormatted: cellsFormatted,
				summary: this.generateSummary(range, format, cellsFormatted),
				warnings: this.generateWarnings(params, cellsFormatted)
			}
		} catch (error) {
			return {
				success: false,
				range: this.parseRange(params),
				format: params.format,
				cellsFormatted: 0,
				summary: `Failed to format cells: ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Apply formatting preset
	 */
	private applyPreset(preset: string, baseFormat: CellFormat): CellFormat {
		const presetFormats: Record<string, Partial<CellFormat>> = {
			header: {
				bold: true,
				backgroundColor: '#4285f4',
				textColor: '#ffffff',
				fontSize: 12,
				horizontalAlignment: 'CENTER'
			},
			currency: {
				numberFormat: '$#,##0.00',
				horizontalAlignment: 'RIGHT'
			},
			percentage: {
				numberFormat: '0.00%',
				horizontalAlignment: 'RIGHT'
			},
			date: {
				numberFormat: 'mm/dd/yyyy',
				horizontalAlignment: 'CENTER'
			},
			highlight: {
				backgroundColor: '#fff2cc',
				bold: true
			},
			warning: {
				backgroundColor: '#fce5cd',
				textColor: '#cc4125'
			},
			success: {
				backgroundColor: '#d9ead3',
				textColor: '#274e13'
			},
			error: {
				backgroundColor: '#f4cccc',
				textColor: '#cc0000',
				bold: true
			}
		}

		const presetFormat = presetFormats[preset] || {}
		return { ...baseFormat, ...presetFormat }
	}

	/**
	 * Parse range parameters into SheetRange format
	 */
	private parseRange(params: FormatCellsParams): SheetRange {
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
	 * Generate summary of the formatting operation
	 */
	private generateSummary(range: SheetRange, format: CellFormat, cellsFormatted: number): string {
		let summary = `Formatted ${cellsFormatted} cell(s) in sheet "${range.sheet}"`
		
		if (cellsFormatted === 1) {
			const cellRef = this.numberToColumn(range.startCol) + range.startRow
			summary += ` (${cellRef})`
		} else {
			const startRef = this.numberToColumn(range.startCol) + range.startRow
			const endRef = this.numberToColumn(range.endCol || range.startCol) + (range.endRow || range.startRow)
			summary += ` (${startRef}:${endRef})`
		}

		// Add format details
		const formatDetails = []
		if (format.bold) formatDetails.push('bold')
		if (format.italic) formatDetails.push('italic')
		if (format.backgroundColor) formatDetails.push(`background: ${format.backgroundColor}`)
		if (format.textColor) formatDetails.push(`text: ${format.textColor}`)
		if (format.fontSize) formatDetails.push(`size: ${format.fontSize}`)
		if (format.numberFormat) formatDetails.push(`format: ${format.numberFormat}`)

		if (formatDetails.length > 0) {
			summary += ` with ${formatDetails.join(', ')}`
		}

		return summary
	}

	/**
	 * Generate warnings about the formatting operation
	 */
	private generateWarnings(params: FormatCellsParams, cellsFormatted: number): string[] {
		const warnings: string[] = []

		// Warn about large ranges
		if (cellsFormatted > 10000) {
			warnings.push(`Formatting ${cellsFormatted} cells may take some time`)
		}

		// Warn about potential readability issues
		if (params.format.textColor && params.format.backgroundColor) {
			warnings.push('Ensure text and background colors have sufficient contrast')
		}

		// Warn about very small or large font sizes
		if (params.format.fontSize) {
			if (params.format.fontSize < 8) {
				warnings.push('Font size may be too small for readability')
			} else if (params.format.fontSize > 24) {
				warnings.push('Large font size may affect sheet layout')
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
	 * Format header row
	 */
	async formatHeader(params: {
		sheet: string
		row: number
		startCol?: number
		endCol?: number
		style?: 'default' | 'dark' | 'light' | 'colorful'
	}): Promise<FormatCellsResult> {
		const styles = {
			default: {
				bold: true,
				backgroundColor: '#4285f4',
				textColor: '#ffffff',
				horizontalAlignment: 'CENTER' as const
			},
			dark: {
				bold: true,
				backgroundColor: '#333333',
				textColor: '#ffffff',
				horizontalAlignment: 'CENTER' as const
			},
			light: {
				bold: true,
				backgroundColor: '#f8f9fa',
				textColor: '#333333',
				horizontalAlignment: 'CENTER' as const
			},
			colorful: {
				bold: true,
				backgroundColor: '#ff9900',
				textColor: '#ffffff',
				horizontalAlignment: 'CENTER' as const
			}
		}

		const format = styles[params.style || 'default']

		return await this.execute({
			sheet: params.sheet,
			startRow: params.row,
			startCol: params.startCol || 1,
			endRow: params.row,
			endCol: params.endCol,
			format: format
		})
	}

	/**
	 * Apply conditional formatting based on cell values
	 */
	async formatConditional(params: {
		sheet: string
		range: string
		condition: 'greater_than' | 'less_than' | 'equal_to' | 'contains' | 'between'
		value: string | number
		value2?: string | number // For 'between' condition
		format: CellFormat
	}): Promise<FormatCellsResult> {
		// Note: This is a simplified implementation
		// Real conditional formatting would require Google Sheets API conditional formatting rules
		
		// For now, we'll just apply the format to the entire range
		// In a full implementation, this would set up conditional formatting rules
		
		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			format: params.format
		})
	}

	/**
	 * Format currency values
	 */
	async formatCurrency(params: {
		sheet: string
		range: string
		currency?: 'USD' | 'EUR' | 'GBP' | 'JPY'
		decimals?: number
	}): Promise<FormatCellsResult> {
		const currencyFormats = {
			USD: '$#,##0.00',
			EUR: '€#,##0.00',
			GBP: '£#,##0.00',
			JPY: '¥#,##0'
		}

		let numberFormat = currencyFormats[params.currency || 'USD']
		
		if (params.decimals !== undefined) {
			const decimalPart = params.decimals > 0 ? '.' + '0'.repeat(params.decimals) : ''
			numberFormat = numberFormat.replace('.00', decimalPart)
		}

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			format: {
				numberFormat: numberFormat,
				horizontalAlignment: 'RIGHT'
			}
		})
	}

	/**
	 * Format percentage values
	 */
	async formatPercentage(params: {
		sheet: string
		range: string
		decimals?: number
	}): Promise<FormatCellsResult> {
		const decimals = params.decimals || 2
		const numberFormat = `0.${'0'.repeat(decimals)}%`

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			format: {
				numberFormat: numberFormat,
				horizontalAlignment: 'RIGHT'
			}
		})
	}

	/**
	 * Format date values
	 */
	async formatDate(params: {
		sheet: string
		range: string
		format?: 'short' | 'long' | 'iso' | 'custom'
		customFormat?: string
	}): Promise<FormatCellsResult> {
		const dateFormats = {
			short: 'mm/dd/yyyy',
			long: 'mmmm dd, yyyy',
			iso: 'yyyy-mm-dd',
			custom: params.customFormat || 'mm/dd/yyyy'
		}

		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			format: {
				numberFormat: dateFormats[params.format || 'short'],
				horizontalAlignment: 'CENTER'
			}
		})
	}

	/**
	 * Apply alternating row colors (zebra striping)
	 */
	async formatAlternatingRows(params: {
		sheet: string
		startRow: number
		endRow: number
		startCol?: number
		endCol?: number
		color1?: string
		color2?: string
	}): Promise<FormatCellsResult[]> {
		const color1 = params.color1 || '#ffffff'
		const color2 = params.color2 || '#f8f9fa'
		const results: FormatCellsResult[] = []

		for (let row = params.startRow; row <= params.endRow; row++) {
			const backgroundColor = (row - params.startRow) % 2 === 0 ? color1 : color2
			
			const result = await this.execute({
				sheet: params.sheet,
				startRow: row,
				endRow: row,
				startCol: params.startCol || 1,
				endCol: params.endCol,
				format: { backgroundColor }
			})
			
			results.push(result)
		}

		return results
	}

	/**
	 * Clear formatting from range
	 */
	async clearFormatting(params: {
		sheet: string
		range: string
	}): Promise<FormatCellsResult> {
		return await this.execute({
			sheet: params.sheet,
			range: params.range,
			format: {
				backgroundColor: '#ffffff',
				textColor: '#000000',
				bold: false,
				italic: false,
				underline: false,
				fontSize: 10,
				fontFamily: 'Arial',
				horizontalAlignment: 'LEFT',
				verticalAlignment: 'BOTTOM',
				numberFormat: 'General'
			}
		})
	}
}