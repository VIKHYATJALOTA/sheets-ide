/**
 * RangeSelector - Component for selecting ranges within Google Sheets
 * Handles A1 notation, named ranges, and sheet-specific ranges
 */

export interface RangeInfo {
	range: string
	sheetName?: string
	cellRange: string
	isValid: boolean
	type: 'cell' | 'range' | 'namedRange' | 'sheetRange'
}

export interface RangeSuggestion {
	range: string
	description: string
	type: 'common' | 'recent' | 'named'
}

export class RangeSelector {
	private recentRanges: string[] = []
	private namedRanges: string[] = []
	private maxRecentRanges = 10

	constructor() {
		// Initialize with empty state
	}

	/**
	 * Parse and validate a range string
	 */
	parseRange(range: string): RangeInfo {
		const trimmedRange = range.trim()
		
		// Check for sheet-specific range (e.g., "Sheet1!A1:B10")
		const sheetMatch = trimmedRange.match(/^'?([^']*)'?!(.+)$/)
		if (sheetMatch) {
			const sheetName = sheetMatch[1]
			const cellRange = sheetMatch[2]
			return {
				range: trimmedRange,
				sheetName,
				cellRange,
				isValid: this.isValidCellRange(cellRange),
				type: 'sheetRange'
			}
		}

		// Check for named range
		if (this.isNamedRange(trimmedRange)) {
			return {
				range: trimmedRange,
				cellRange: trimmedRange,
				isValid: true,
				type: 'namedRange'
			}
		}

		// Check for cell or range
		const isValid = this.isValidCellRange(trimmedRange)
		const type = trimmedRange.includes(':') ? 'range' : 'cell'

		return {
			range: trimmedRange,
			cellRange: trimmedRange,
			isValid,
			type
		}
	}

	/**
	 * Validate A1 notation cell range
	 */
	private isValidCellRange(range: string): boolean {
		// Single cell: A1, Z99, AA1000
		const singleCellPattern = /^[A-Z]+[0-9]+$/
		
		// Range: A1:B10, A:A, 1:1
		const rangePattern = /^([A-Z]+[0-9]+|[A-Z]+|[0-9]+):([A-Z]+[0-9]+|[A-Z]+|[0-9]+)$/
		
		return singleCellPattern.test(range) || rangePattern.test(range)
	}

	/**
	 * Check if range is a named range
	 */
	private isNamedRange(range: string): boolean {
		// Named ranges start with letter or underscore, contain only letters, numbers, underscores
		const namedRangePattern = /^[A-Za-z_][A-Za-z0-9_]*$/
		return namedRangePattern.test(range) && this.namedRanges.includes(range)
	}

	/**
	 * Add a range to recent ranges
	 */
	addToRecent(range: string): void {
		// Remove if already exists
		this.recentRanges = this.recentRanges.filter(r => r !== range)
		
		// Add to beginning
		this.recentRanges.unshift(range)
		
		// Limit size
		if (this.recentRanges.length > this.maxRecentRanges) {
			this.recentRanges = this.recentRanges.slice(0, this.maxRecentRanges)
		}
	}

	/**
	 * Set available named ranges
	 */
	setNamedRanges(ranges: string[]): void {
		this.namedRanges = ranges
	}

	/**
	 * Get range suggestions
	 */
	getSuggestions(input: string = ''): RangeSuggestion[] {
		const suggestions: RangeSuggestion[] = []
		const lowerInput = input.toLowerCase()

		// Common ranges
		const commonRanges = [
			{ range: 'A:A', description: 'Entire column A' },
			{ range: '1:1', description: 'Entire row 1' },
			{ range: 'A1:Z1000', description: 'Large data range' },
			{ range: 'A1:B10', description: 'Small table range' },
		]

		commonRanges.forEach(({ range, description }) => {
			if (!input || range.toLowerCase().includes(lowerInput)) {
				suggestions.push({ range, description, type: 'common' })
			}
		})

		// Recent ranges
		this.recentRanges.forEach(range => {
			if (!input || range.toLowerCase().includes(lowerInput)) {
				suggestions.push({
					range,
					description: 'Recently used',
					type: 'recent'
				})
			}
		})

		// Named ranges
		this.namedRanges.forEach(range => {
			if (!input || range.toLowerCase().includes(lowerInput)) {
				suggestions.push({
					range,
					description: 'Named range',
					type: 'named'
				})
			}
		})

		return suggestions.slice(0, 10) // Limit to 10 suggestions
	}

	/**
	 * Convert column letter to number (A=1, B=2, etc.)
	 */
	static columnLetterToNumber(letter: string): number {
		let result = 0
		for (let i = 0; i < letter.length; i++) {
			result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1)
		}
		return result
	}

	/**
	 * Convert column number to letter (1=A, 2=B, etc.)
	 */
	static columnNumberToLetter(num: number): string {
		let result = ''
		while (num > 0) {
			num-- // Adjust for 1-based indexing
			result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result
			num = Math.floor(num / 26)
		}
		return result
	}

	/**
	 * Expand a range to include more rows/columns
	 */
	static expandRange(range: string, rows: number = 0, cols: number = 0): string {
		const rangeInfo = new RangeSelector().parseRange(range)
		if (!rangeInfo.isValid || rangeInfo.type === 'namedRange') {
			return range
		}

		// For simple expansion, just return the original range
		// This could be enhanced to actually parse and expand the range
		return range
	}

	/**
	 * Get the dimensions of a range
	 */
	static getRangeDimensions(range: string): { rows: number; cols: number } | null {
		const selector = new RangeSelector()
		const rangeInfo = selector.parseRange(range)
		
		if (!rangeInfo.isValid || rangeInfo.type === 'namedRange') {
			return null
		}

		// This is a simplified implementation
		// A full implementation would parse the range and calculate actual dimensions
		return { rows: 1, cols: 1 }
	}
}