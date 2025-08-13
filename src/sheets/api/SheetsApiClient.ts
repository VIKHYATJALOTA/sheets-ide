/**
 * Google Sheets API Client for Sheets IDE
 * Provides a TypeScript interface for Google Sheets operations using REST API
 */

import { GoogleAuthManager } from '../auth/GoogleAuthManager'

export interface SheetRange {
	sheet: string
	startRow: number
	startCol: number
	endRow?: number
	endCol?: number
}

export interface CellValue {
	value: string | number | boolean
	formula?: string
	format?: CellFormat
}

export interface CellFormat {
	backgroundColor?: string
	textColor?: string
	bold?: boolean
	italic?: boolean
	underline?: boolean
	fontSize?: number
	fontFamily?: string
	horizontalAlignment?: 'LEFT' | 'CENTER' | 'RIGHT'
	verticalAlignment?: 'TOP' | 'MIDDLE' | 'BOTTOM'
	numberFormat?: string
}

export interface SheetInfo {
	id: number
	title: string
	index: number
	rowCount: number
	columnCount: number
}

export interface SpreadsheetInfo {
	id: string
	title: string
	url: string
	sheets: SheetInfo[]
	locale: string
	timeZone: string
}

/**
 * Google Sheets API Client
 * Uses Google Sheets REST API v4 for operations
 */
export class SheetsApiClient {
	private spreadsheetId: string
	private authManager: GoogleAuthManager
	private baseUrl = 'https://sheets.googleapis.com/v4'

	constructor(spreadsheetId: string, authManager?: GoogleAuthManager) {
		this.spreadsheetId = spreadsheetId
		this.authManager = authManager || new GoogleAuthManager()
	}

	/**
	 * Make authenticated request to Google Sheets API
	 */
	private async makeRequest(
		endpoint: string,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
		body?: any,
		params?: Record<string, string>
	): Promise<any> {
		const accessToken = await this.authManager.getAccessToken()
		
		let url = `${this.baseUrl}${endpoint}`
		if (params) {
			const searchParams = new URLSearchParams(params)
			url += `?${searchParams.toString()}`
		}

		const response = await fetch(url, {
			method,
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: body ? JSON.stringify(body) : undefined
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
			throw new Error(`Sheets API error: ${error.error?.message || response.statusText}`)
		}

		return response.json()
	}

	/**
	 * Parse A1 notation to range coordinates
	 */
	private parseA1Notation(range: string): {
		sheetName?: string
		startRow: number
		startColumn: number
		endRow?: number
		endColumn?: number
		sheetId?: number
	} {
		// Handle sheet name prefix (e.g., "Sheet1!A1:B2")
		let sheetName: string | undefined
		let rangeStr = range
		
		if (range.includes('!')) {
			[sheetName, rangeStr] = range.split('!')
		}

		// Parse range (e.g., "A1:B2" or "A1")
		const rangeParts = rangeStr.split(':')
		const startCell = rangeParts[0]
		const endCell = rangeParts[1]

		const parseCell = (cell: string) => {
			const match = cell.match(/^([A-Z]+)(\d+)$/)
			if (!match) throw new Error(`Invalid cell reference: ${cell}`)
			
			const [, colStr, rowStr] = match
			const column = colStr.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1
			const row = parseInt(rowStr) - 1
			
			return { row, column }
		}

		const start = parseCell(startCell)
		const end = endCell ? parseCell(endCell) : start

		return {
			sheetName,
			startRow: start.row,
			startColumn: start.column,
			endRow: end.row,
			endColumn: end.column
		}
	}

	/**
	 * Convert column index to letter (0 -> A, 1 -> B, etc.)
	 */
	private columnToLetter(column: number): string {
		let result = ''
		while (column >= 0) {
			result = String.fromCharCode(65 + (column % 26)) + result
			column = Math.floor(column / 26) - 1
		}
		return result
	}

	/**
	 * Convert range to A1 notation
	 */
	private rangeToA1(range: SheetRange): string {
		const startCol = this.columnToLetter(range.startCol - 1)
		const endCol = range.endCol ? this.columnToLetter(range.endCol - 1) : startCol
		const endRow = range.endRow || range.startRow
		
		let a1Range = `${startCol}${range.startRow}`
		if (range.endRow || range.endCol) {
			a1Range += `:${endCol}${endRow}`
		}
		
		return range.sheet ? `${range.sheet}!${a1Range}` : a1Range
	}

	/**
	 * Get spreadsheet information
	 */
	async getSpreadsheetInfo(): Promise<SpreadsheetInfo> {
		try {
			const response = await this.makeRequest(`/spreadsheets/${this.spreadsheetId}`)
			
			return {
				id: response.spreadsheetId,
				title: response.properties?.title || 'Untitled',
				url: response.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`,
				locale: response.properties?.locale || 'en_US',
				timeZone: response.properties?.timeZone || 'UTC',
				sheets: response.sheets?.map((sheet: any, index: number) => ({
					id: sheet.properties.sheetId,
					title: sheet.properties.title,
					index: index,
					rowCount: sheet.properties.gridProperties?.rowCount || 1000,
					columnCount: sheet.properties.gridProperties?.columnCount || 26
				})) || []
			}
		} catch (error) {
			throw new Error(`Failed to get spreadsheet info: ${error}`)
		}
	}

	/**
	 * Read values from a range
	 */
	async readRange(range: SheetRange): Promise<CellValue[][]> {
		try {
			const a1Range = this.rangeToA1(range)
			const response = await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(a1Range)}`,
				'GET',
				undefined,
				{ valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'FORMATTED_STRING' }
			)

			const values = response.values || []
			
			// Convert to CellValue format
			return values.map((row: any[]) =>
				row.map((value: any) => ({
					value: value,
					formula: undefined, // Would need separate API call for formulas
					format: undefined   // Would need separate API call for formatting
				}))
			)
		} catch (error) {
			throw new Error(`Failed to read range: ${error}`)
		}
	}

	/**
	 * Write values to a range
	 */
	async writeRange(range: SheetRange, values: CellValue[][]): Promise<void> {
		try {
			const a1Range = this.rangeToA1(range)
			
			// Extract just the values for the API call
			const cellValues = values.map(row => 
				row.map(cell => cell.value)
			)

			await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(a1Range)}`,
				'PUT',
				{
					values: cellValues,
					majorDimension: 'ROWS'
				},
				{ valueInputOption: 'USER_ENTERED' }
			)

			// Handle formulas and formatting separately if needed
			// This would require additional API calls for complex formatting
		} catch (error) {
			throw new Error(`Failed to write range: ${error}`)
		}
	}

	/**
	 * Create a new sheet
	 */
	async createSheet(name: string, rowCount: number = 1000, columnCount: number = 26): Promise<SheetInfo> {
		try {
			const response = await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}:batchUpdate`,
				'POST',
				{
					requests: [{
						addSheet: {
							properties: {
								title: name,
								gridProperties: {
									rowCount,
									columnCount
								}
							}
						}
					}]
				}
			)
			
			const addedSheet = response.replies?.[0]?.addSheet?.properties
			if (!addedSheet) {
				throw new Error('Failed to get created sheet properties')
			}
			
			return {
				id: addedSheet.sheetId,
				title: addedSheet.title,
				index: addedSheet.index || 0,
				rowCount: addedSheet.gridProperties?.rowCount || rowCount,
				columnCount: addedSheet.gridProperties?.columnCount || columnCount
			}
		} catch (error) {
			throw new Error(`Failed to create sheet: ${error}`)
		}
	}

	/**
	 * Delete a sheet
	 */
	async deleteSheet(sheetName: string): Promise<void> {
		try {
			// First get the sheet ID
			const spreadsheetInfo = await this.getSpreadsheetInfo()
			const sheet = spreadsheetInfo.sheets.find(s => s.title === sheetName)
			
			if (!sheet) {
				throw new Error(`Sheet "${sheetName}" not found`)
			}

			await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}:batchUpdate`,
				'POST',
				{
					requests: [{
						deleteSheet: {
							sheetId: sheet.id
						}
					}]
				}
			)
		} catch (error) {
			throw new Error(`Failed to delete sheet: ${error}`)
		}
	}

	/**
	 * Set formula in a cell
	 */
	async setFormula(range: SheetRange, formula: string): Promise<void> {
		try {
			const a1Range = this.rangeToA1(range)
			
			await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(a1Range)}`,
				'PUT',
				{
					values: [[formula]],
					majorDimension: 'ROWS'
				},
				{ valueInputOption: 'USER_ENTERED' }
			)
		} catch (error) {
			throw new Error(`Failed to set formula: ${error}`)
		}
	}

	/**
	 * Format cells in a range
	 */
	async formatCells(range: SheetRange, format: CellFormat): Promise<void> {
		try {
			// Get sheet ID for the range
			const spreadsheetInfo = await this.getSpreadsheetInfo()
			const sheet = spreadsheetInfo.sheets.find(s => s.title === range.sheet)
			
			if (!sheet) {
				throw new Error(`Sheet "${range.sheet}" not found`)
			}

			const requests: any[] = []
			
			// Build formatting request
			const cellFormat: any = {}
			const textFormat: any = {}
			
			if (format.backgroundColor) {
				cellFormat.backgroundColor = this.parseColor(format.backgroundColor)
			}
			
			if (format.textColor) {
				textFormat.foregroundColor = this.parseColor(format.textColor)
			}
			
			if (format.bold !== undefined) {
				textFormat.bold = format.bold
			}
			
			if (format.italic !== undefined) {
				textFormat.italic = format.italic
			}
			
			if (format.fontSize) {
				textFormat.fontSize = format.fontSize
			}
			
			if (format.fontFamily) {
				textFormat.fontFamily = format.fontFamily
			}
			
			if (Object.keys(textFormat).length > 0) {
				cellFormat.textFormat = textFormat
			}
			
			if (format.horizontalAlignment) {
				cellFormat.horizontalAlignment = format.horizontalAlignment
			}
			
			if (format.verticalAlignment) {
				cellFormat.verticalAlignment = format.verticalAlignment
			}
			
			if (format.numberFormat) {
				cellFormat.numberFormat = { type: 'TEXT', pattern: format.numberFormat }
			}

			if (Object.keys(cellFormat).length > 0) {
				requests.push({
					repeatCell: {
						range: {
							sheetId: sheet.id,
							startRowIndex: range.startRow - 1,
							endRowIndex: (range.endRow || range.startRow),
							startColumnIndex: range.startCol - 1,
							endColumnIndex: (range.endCol || range.startCol)
						},
						cell: {
							userEnteredFormat: cellFormat
						},
						fields: 'userEnteredFormat'
					}
				})
			}
			
			if (requests.length > 0) {
				await this.makeRequest(
					`/spreadsheets/${this.spreadsheetId}:batchUpdate`,
					'POST',
					{ requests }
				)
			}
		} catch (error) {
			throw new Error(`Failed to format cells: ${error}`)
		}
	}

	/**
	 * Parse color string to Google Sheets color object
	 */
	private parseColor(color: string): any {
		// Handle hex colors
		if (color.startsWith('#')) {
			const hex = color.slice(1)
			const r = parseInt(hex.slice(0, 2), 16) / 255
			const g = parseInt(hex.slice(2, 4), 16) / 255
			const b = parseInt(hex.slice(4, 6), 16) / 255
			return { red: r, green: g, blue: b }
		}
		
		// Handle named colors (basic set)
		const namedColors: { [key: string]: any } = {
			'white': { red: 1, green: 1, blue: 1 },
			'black': { red: 0, green: 0, blue: 0 },
			'red': { red: 1, green: 0, blue: 0 },
			'green': { red: 0, green: 1, blue: 0 },
			'blue': { red: 0, green: 0, blue: 1 },
			'yellow': { red: 1, green: 1, blue: 0 },
			'orange': { red: 1, green: 0.5, blue: 0 },
			'purple': { red: 0.5, green: 0, blue: 0.5 },
			'gray': { red: 0.5, green: 0.5, blue: 0.5 },
			'grey': { red: 0.5, green: 0.5, blue: 0.5 }
		}
		
		return namedColors[color.toLowerCase()] || { red: 0, green: 0, blue: 0 }
	}

	/**
	 * Create client for active spreadsheet (for add-on context)
	 * This would be used when running in Google Apps Script context
	 */
	static async createForActiveSpreadsheet(authManager?: GoogleAuthManager): Promise<SheetsApiClient> {
		// In a real implementation, this would get the active spreadsheet ID
		// from the Apps Script context or from user selection
		throw new Error('createForActiveSpreadsheet must be implemented based on context')
	}

	/**
	 * Batch update multiple operations
	 */
	async batchUpdate(requests: any[]): Promise<any> {
		try {
			return await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}:batchUpdate`,
				'POST',
				{ requests }
			)
		} catch (error) {
			throw new Error(`Failed to batch update: ${error}`)
		}
	}

	/**
	 * Get values from multiple ranges
	 */
	async batchGetValues(ranges: string[]): Promise<any> {
		try {
			const encodedRanges = ranges.map(range => `ranges=${encodeURIComponent(range)}`).join('&')
			return await this.makeRequest(
				`/spreadsheets/${this.spreadsheetId}/values:batchGet?${encodedRanges}`
			)
		} catch (error) {
			throw new Error(`Failed to batch get values: ${error}`)
		}
	}
}