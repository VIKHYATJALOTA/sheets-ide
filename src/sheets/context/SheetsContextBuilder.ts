/**
 * Sheets Context Builder for Sheets IDE
 * Builds context about spreadsheet data for AI processing
 */

import { SheetsApiClient, SpreadsheetInfo, SheetInfo, CellValue, SheetRange } from '../api/SheetsApiClient'

export interface SheetDataSample {
	range: SheetRange
	data: CellValue[][]
	headers?: string[]
	dataTypes: string[]
	summary: string
}

export interface SheetAnalysis {
	sheet: SheetInfo
	rowCount: number
	columnCount: number
	hasHeaders: boolean
	dataTypes: Record<string, string>
	samples: SheetDataSample[]
	patterns: string[]
	suggestions: string[]
}

export interface SheetsContext {
	spreadsheet: SpreadsheetInfo
	sheets: SheetAnalysis[]
	totalCells: number
	lastModified?: Date
	permissions: {
		canRead: boolean
		canWrite: boolean
		canShare: boolean
	}
	summary: string
	recommendations: string[]
}

/**
 * Builds comprehensive context about spreadsheet data for AI processing
 */
export class SheetsContextBuilder {
	private client: SheetsApiClient
	private maxSampleRows: number = 10
	private maxSampleCols: number = 10

	constructor(client: SheetsApiClient) {
		this.client = client
	}

	/**
	 * Build complete context for a spreadsheet
	 */
	async buildContext(): Promise<SheetsContext> {
		try {
			const spreadsheetInfo = await this.client.getSpreadsheetInfo()
			const sheetAnalyses: SheetAnalysis[] = []
			let totalCells = 0

			// Analyze each sheet
			for (const sheet of spreadsheetInfo.sheets) {
				const analysis = await this.analyzeSheet(sheet)
				sheetAnalyses.push(analysis)
				totalCells += analysis.rowCount * analysis.columnCount
			}

			// Build overall context
			const context: SheetsContext = {
				spreadsheet: spreadsheetInfo,
				sheets: sheetAnalyses,
				totalCells,
				permissions: await this.getPermissions(),
				summary: this.generateSpreadsheetSummary(spreadsheetInfo, sheetAnalyses),
				recommendations: this.generateRecommendations(sheetAnalyses)
			}

			return context
		} catch (error) {
			throw new Error(`Failed to build sheets context: ${error.message}`)
		}
	}

	/**
	 * Analyze a single sheet
	 */
	private async analyzeSheet(sheet: SheetInfo): Promise<SheetAnalysis> {
		try {
			// Sample data from the sheet
			const samples = await this.sampleSheetData(sheet)
			
			// Analyze data types and patterns
			const dataTypes = this.analyzeDataTypes(samples)
			const patterns = this.identifyPatterns(samples)
			const hasHeaders = this.detectHeaders(samples)

			return {
				sheet,
				rowCount: sheet.rowCount,
				columnCount: sheet.columnCount,
				hasHeaders,
				dataTypes,
				samples,
				patterns,
				suggestions: this.generateSheetSuggestions(sheet, samples, patterns)
			}
		} catch (error) {
			// Return basic analysis if detailed analysis fails
			return {
				sheet,
				rowCount: sheet.rowCount,
				columnCount: sheet.columnCount,
				hasHeaders: false,
				dataTypes: {},
				samples: [],
				patterns: [],
				suggestions: [`Unable to analyze sheet "${sheet.title}": ${error.message}`]
			}
		}
	}

	/**
	 * Sample data from a sheet for analysis
	 */
	private async sampleSheetData(sheet: SheetInfo): Promise<SheetDataSample[]> {
		const samples: SheetDataSample[] = []

		try {
			// Sample from top-left corner
			const topLeftRange: SheetRange = {
				sheet: sheet.title,
				startRow: 1,
				startCol: 1,
				endRow: Math.min(this.maxSampleRows, sheet.rowCount),
				endCol: Math.min(this.maxSampleCols, sheet.columnCount)
			}

			const topLeftData = await this.client.readRange(topLeftRange)
			
			if (topLeftData.length > 0) {
				samples.push({
					range: topLeftRange,
					data: topLeftData,
					headers: this.extractHeaders(topLeftData),
					dataTypes: this.inferDataTypes(topLeftData),
					summary: `Top-left ${topLeftData.length}x${topLeftData[0]?.length || 0} sample`
				})
			}

			// Sample from middle if sheet is large enough
			if (sheet.rowCount > 20 && sheet.columnCount > 10) {
				const midRow = Math.floor(sheet.rowCount / 2)
				const midCol = Math.floor(sheet.columnCount / 2)
				
				const middleRange: SheetRange = {
					sheet: sheet.title,
					startRow: midRow,
					startCol: midCol,
					endRow: Math.min(midRow + 5, sheet.rowCount),
					endCol: Math.min(midCol + 5, sheet.columnCount)
				}

				const middleData = await this.client.readRange(middleRange)
				
				if (middleData.length > 0) {
					samples.push({
						range: middleRange,
						data: middleData,
						dataTypes: this.inferDataTypes(middleData),
						summary: `Middle section ${middleData.length}x${middleData[0]?.length || 0} sample`
					})
				}
			}

		} catch (error) {
			console.warn(`Failed to sample data from sheet "${sheet.title}":`, error)
		}

		return samples
	}

	/**
	 * Extract potential headers from data
	 */
	private extractHeaders(data: CellValue[][]): string[] | undefined {
		if (data.length === 0) return undefined
		
		const firstRow = data[0]
		const headers = firstRow.map(cell => String(cell.value).trim()).filter(h => h.length > 0)
		
		// Only return headers if they look like headers (mostly text, not numbers)
		const textCount = headers.filter(h => isNaN(Number(h))).length
		if (textCount > headers.length * 0.7) {
			return headers
		}
		
		return undefined
	}

	/**
	 * Infer data types from sample data
	 */
	private inferDataTypes(data: CellValue[][]): string[] {
		if (data.length === 0) return []
		
		const columnCount = data[0]?.length || 0
		const types: string[] = []

		for (let col = 0; col < columnCount; col++) {
			const columnValues = data.map(row => row[col]?.value).filter(v => v !== null && v !== undefined && v !== '')
			
			if (columnValues.length === 0) {
				types.push('empty')
				continue
			}

			// Analyze column data types
			let numberCount = 0
			let dateCount = 0
			let booleanCount = 0
			let textCount = 0

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
					} else {
						textCount++
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
	 * Analyze data types across all samples
	 */
	private analyzeDataTypes(samples: SheetDataSample[]): Record<string, string> {
		const dataTypes: Record<string, string> = {}
		
		samples.forEach((sample, index) => {
			sample.dataTypes.forEach((type, colIndex) => {
				const key = sample.headers?.[colIndex] || `Column_${colIndex + 1}`
				dataTypes[key] = type
			})
		})

		return dataTypes
	}

	/**
	 * Identify patterns in the data
	 */
	private identifyPatterns(samples: SheetDataSample[]): string[] {
		const patterns: string[] = []

		for (const sample of samples) {
			// Check for common patterns
			if (sample.headers) {
				patterns.push(`Has headers: ${sample.headers.join(', ')}`)
			}

			// Check for numerical sequences
			if (this.hasNumericalSequence(sample.data)) {
				patterns.push('Contains numerical sequences')
			}

			// Check for date ranges
			if (this.hasDateRange(sample.data)) {
				patterns.push('Contains date ranges')
			}

			// Check for formulas
			if (this.hasFormulas(sample.data)) {
				patterns.push('Contains formulas')
			}
		}

		return Array.from(new Set(patterns)) // Remove duplicates
	}

	/**
	 * Check if data contains numerical sequences
	 */
	private hasNumericalSequence(data: CellValue[][]): boolean {
		for (let col = 0; col < (data[0]?.length || 0); col++) {
			const numbers = data.map(row => {
				const value = row[col]?.value
				return typeof value === 'number' ? value : (typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : null)
			}).filter(n => n !== null) as number[]

			if (numbers.length >= 3) {
				// Check for arithmetic sequence
				const diff = numbers[1] - numbers[0]
				let isSequence = true
				for (let i = 2; i < numbers.length; i++) {
					if (Math.abs((numbers[i] - numbers[i-1]) - diff) > 0.001) {
						isSequence = false
						break
					}
				}
				if (isSequence) return true
			}
		}
		return false
	}

	/**
	 * Check if data contains date ranges
	 */
	private hasDateRange(data: CellValue[][]): boolean {
		for (let col = 0; col < (data[0]?.length || 0); col++) {
			const dates = data.map(row => {
				const value = row[col]?.value
				if (typeof value === 'string' && this.isDateString(value)) {
					return new Date(value)
				}
				return null
			}).filter(d => d !== null) as Date[]

			if (dates.length >= 2) {
				// Check if dates are in sequence
				dates.sort((a, b) => a.getTime() - b.getTime())
				return true
			}
		}
		return false
	}

	/**
	 * Check if data contains formulas
	 */
	private hasFormulas(data: CellValue[][]): boolean {
		return data.some(row => 
			row.some(cell => cell.formula && cell.formula.startsWith('='))
		)
	}

	/**
	 * Detect if first row contains headers
	 */
	private detectHeaders(samples: SheetDataSample[]): boolean {
		if (samples.length === 0) return false
		
		const firstSample = samples[0]
		return firstSample.headers !== undefined && firstSample.headers.length > 0
	}

	/**
	 * Generate suggestions for a sheet
	 */
	private generateSheetSuggestions(sheet: SheetInfo, samples: SheetDataSample[], patterns: string[]): string[] {
		const suggestions: string[] = []

		// Size-based suggestions
		if (sheet.rowCount > 1000) {
			suggestions.push('Large dataset - consider using filters or pivot tables for analysis')
		}

		if (sheet.columnCount > 20) {
			suggestions.push('Wide dataset - consider grouping related columns')
		}

		// Pattern-based suggestions
		if (patterns.includes('Contains formulas')) {
			suggestions.push('Contains calculated fields - good for automated analysis')
		}

		if (patterns.includes('Contains date ranges')) {
			suggestions.push('Time-series data detected - suitable for trend analysis')
		}

		if (patterns.includes('Contains numerical sequences')) {
			suggestions.push('Sequential data detected - good for forecasting')
		}

		// Data type suggestions
		const hasNumbers = samples.some(s => s.dataTypes.includes('number'))
		const hasDates = samples.some(s => s.dataTypes.includes('date'))
		
		if (hasNumbers && hasDates) {
			suggestions.push('Numerical and date data available - suitable for time-series analysis')
		}

		return suggestions
	}

	/**
	 * Generate overall spreadsheet summary
	 */
	private generateSpreadsheetSummary(spreadsheet: SpreadsheetInfo, analyses: SheetAnalysis[]): string {
		const totalSheets = analyses.length
		const totalRows = analyses.reduce((sum, a) => sum + a.rowCount, 0)
		const totalCols = analyses.reduce((sum, a) => sum + a.columnCount, 0)
		const sheetsWithHeaders = analyses.filter(a => a.hasHeaders).length
		const sheetsWithFormulas = analyses.filter(a => a.patterns.includes('Contains formulas')).length

		return `Spreadsheet "${spreadsheet.title}" contains ${totalSheets} sheet(s) with ${totalRows} total rows and ${totalCols} total columns. ${sheetsWithHeaders} sheet(s) have headers, ${sheetsWithFormulas} sheet(s) contain formulas.`
	}

	/**
	 * Generate recommendations for the spreadsheet
	 */
	private generateRecommendations(analyses: SheetAnalysis[]): string[] {
		const recommendations: string[] = []

		// Check for common issues
		const emptySheets = analyses.filter(a => a.rowCount <= 1 && a.columnCount <= 1)
		if (emptySheets.length > 0) {
			recommendations.push(`Consider removing ${emptySheets.length} empty sheet(s)`)
		}

		const largeSheets = analyses.filter(a => a.rowCount > 10000)
		if (largeSheets.length > 0) {
			recommendations.push('Large sheets detected - consider data validation and performance optimization')
		}

		// Data organization recommendations
		const sheetsWithoutHeaders = analyses.filter(a => !a.hasHeaders && a.rowCount > 1)
		if (sheetsWithoutHeaders.length > 0) {
			recommendations.push('Add headers to improve data clarity and analysis capabilities')
		}

		return recommendations
	}

	/**
	 * Get permissions for the spreadsheet
	 */
	private async getPermissions(): Promise<{ canRead: boolean; canWrite: boolean; canShare: boolean }> {
		// In Apps Script context, we can check permissions
		try {
			// Basic permission check - if we can read spreadsheet info, we have read access
			// Write access would need to be tested by attempting a write operation
			return {
				canRead: true, // We got this far, so we can read
				canWrite: true, // Assume write access for now - would need proper testing
				canShare: false // Sharing permissions are harder to detect
			}
		} catch (error) {
			return {
				canRead: false,
				canWrite: false,
				canShare: false
			}
		}
	}

	/**
	 * Set maximum sample size
	 */
	setSampleSize(rows: number, cols: number): void {
		this.maxSampleRows = Math.max(1, rows)
		this.maxSampleCols = Math.max(1, cols)
	}
}