/**
 * Create Sheet Tool for Sheets IDE
 * Creates new sheets within a Google Spreadsheet
 */

import { SheetsApiClient, SheetInfo } from '../api/SheetsApiClient'

export interface CreateSheetParams {
	name: string
	rowCount?: number
	columnCount?: number
	index?: number // Position in sheet tabs
	copyFrom?: string // Name of sheet to copy from
	template?: 'blank' | 'data_table' | 'dashboard' | 'report'
}

export interface CreateSheetResult {
	success: boolean
	sheet?: SheetInfo
	summary: string
	warnings?: string[]
	error?: string
}

/**
 * Tool for creating new sheets in Google Spreadsheets
 */
export class CreateSheetTool {
	private client: SheetsApiClient

	constructor(client: SheetsApiClient) {
		this.client = client
	}

	/**
	 * Create a new sheet
	 */
	async execute(params: CreateSheetParams): Promise<CreateSheetResult> {
		try {
			// Validate sheet name
			const validationResult = this.validateSheetName(params.name)
			if (!validationResult.valid) {
				throw new Error(validationResult.error)
			}

			// Check if sheet already exists
			const existsResult = await this.checkSheetExists(params.name)
			if (existsResult.exists) {
				throw new Error(`Sheet "${params.name}" already exists`)
			}

			// Create the sheet
			const sheet = await this.client.createSheet(
				params.name,
				params.rowCount || 1000,
				params.columnCount || 26
			)

			// Apply template if specified
			if (params.template && params.template !== 'blank') {
				await this.applyTemplate(sheet, params.template)
			}

			// Copy from another sheet if specified
			if (params.copyFrom) {
				await this.copyFromSheet(sheet, params.copyFrom)
			}

			return {
				success: true,
				sheet: sheet,
				summary: this.generateSummary(sheet, params),
				warnings: this.generateWarnings(params)
			}
		} catch (error) {
			return {
				success: false,
				summary: `Failed to create sheet "${params.name}": ${error.message}`,
				error: error.message
			}
		}
	}

	/**
	 * Validate sheet name
	 */
	private validateSheetName(name: string): { valid: boolean; error?: string } {
		if (!name || name.trim().length === 0) {
			return { valid: false, error: 'Sheet name cannot be empty' }
		}

		if (name.length > 100) {
			return { valid: false, error: 'Sheet name cannot exceed 100 characters' }
		}

		// Check for invalid characters
		const invalidChars = /[[\]?*\\:\/]/
		if (invalidChars.test(name)) {
			return { valid: false, error: 'Sheet name contains invalid characters: [ ] ? * \\ : /' }
		}

		// Check for reserved names
		const reservedNames = ['History']
		if (reservedNames.includes(name)) {
			return { valid: false, error: `"${name}" is a reserved sheet name` }
		}

		return { valid: true }
	}

	/**
	 * Check if sheet already exists
	 */
	private async checkSheetExists(name: string): Promise<{ exists: boolean; sheet?: SheetInfo }> {
		try {
			const spreadsheetInfo = await this.client.getSpreadsheetInfo()
			const existingSheet = spreadsheetInfo.sheets.find(sheet => sheet.title === name)
			
			return {
				exists: !!existingSheet,
				sheet: existingSheet
			}
		} catch (error) {
			// If we can't check, assume it doesn't exist
			return { exists: false }
		}
	}

	/**
	 * Apply a template to the new sheet
	 */
	private async applyTemplate(sheet: SheetInfo, template: string): Promise<void> {
		try {
			switch (template) {
				case 'data_table':
					await this.applyDataTableTemplate(sheet)
					break
				case 'dashboard':
					await this.applyDashboardTemplate(sheet)
					break
				case 'report':
					await this.applyReportTemplate(sheet)
					break
				default:
					console.warn(`Unknown template: ${template}`)
			}
		} catch (error) {
			console.warn(`Failed to apply template ${template}:`, error)
		}
	}

	/**
	 * Apply data table template
	 */
	private async applyDataTableTemplate(sheet: SheetInfo): Promise<void> {
		// Create header row with common data table headers
		const headers = ['ID', 'Name', 'Category', 'Value', 'Date', 'Status']
		
		const headerData = headers.map(header => ({
			value: header,
			format: {
				bold: true,
				backgroundColor: '#4285f4',
				textColor: '#ffffff'
			}
		}))

		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 1,
				startCol: 1,
				endRow: 1,
				endCol: headers.length
			},
			[headerData]
		)

		// Add sample data
		const sampleData = [
			['1', 'Sample Item 1', 'Category A', '100', new Date().toISOString().split('T')[0], 'Active'],
			['2', 'Sample Item 2', 'Category B', '200', new Date().toISOString().split('T')[0], 'Pending'],
			['3', 'Sample Item 3', 'Category A', '150', new Date().toISOString().split('T')[0], 'Active']
		].map(row => row.map(value => ({ value })))

		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 2,
				startCol: 1,
				endRow: 4,
				endCol: headers.length
			},
			sampleData
		)
	}

	/**
	 * Apply dashboard template
	 */
	private async applyDashboardTemplate(sheet: SheetInfo): Promise<void> {
		// Create dashboard title
		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 1,
				startCol: 1
			},
			[[{
				value: 'Dashboard',
				format: {
					bold: true,
					fontSize: 18,
					horizontalAlignment: 'CENTER'
				}
			}]]
		)

		// Create KPI section headers
		const kpiHeaders = ['Metric', 'Current', 'Target', 'Status']
		const kpiHeaderData = kpiHeaders.map(header => ({
			value: header,
			format: {
				bold: true,
				backgroundColor: '#34a853',
				textColor: '#ffffff'
			}
		}))

		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 3,
				startCol: 1,
				endRow: 3,
				endCol: kpiHeaders.length
			},
			[kpiHeaderData]
		)

		// Add sample KPIs
		const kpiData = [
			['Revenue', '$10,000', '$12,000', 'Below Target'],
			['Users', '1,500', '1,200', 'Above Target'],
			['Conversion Rate', '3.2%', '3.0%', 'On Target']
		].map(row => row.map(value => ({ value })))

		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 4,
				startCol: 1,
				endRow: 6,
				endCol: kpiHeaders.length
			},
			kpiData
		)
	}

	/**
	 * Apply report template
	 */
	private async applyReportTemplate(sheet: SheetInfo): Promise<void> {
		// Create report header
		const today = new Date().toLocaleDateString()
		
		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 1,
				startCol: 1
			},
			[[{
				value: `Report - ${today}`,
				format: {
					bold: true,
					fontSize: 16
				}
			}]]
		)

		// Create summary section
		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 3,
				startCol: 1
			},
			[[{
				value: 'Executive Summary',
				format: {
					bold: true,
					fontSize: 14
				}
			}]]
		)

		// Create data section headers
		const dataHeaders = ['Period', 'Metric 1', 'Metric 2', 'Metric 3', 'Notes']
		const dataHeaderData = dataHeaders.map(header => ({
			value: header,
			format: {
				bold: true,
				backgroundColor: '#ff9900',
				textColor: '#ffffff'
			}
		}))

		await this.client.writeRange(
			{
				sheet: sheet.title,
				startRow: 6,
				startCol: 1,
				endRow: 6,
				endCol: dataHeaders.length
			},
			[dataHeaderData]
		)
	}

	/**
	 * Copy data from another sheet
	 */
	private async copyFromSheet(targetSheet: SheetInfo, sourceSheetName: string): Promise<void> {
		try {
			// Check if source sheet exists
			const existsResult = await this.checkSheetExists(sourceSheetName)
			if (!existsResult.exists) {
				throw new Error(`Source sheet "${sourceSheetName}" not found`)
			}

			// Read data from source sheet (limited to prevent huge copies)
			const sourceData = await this.client.readRange({
				sheet: sourceSheetName,
				startRow: 1,
				startCol: 1,
				endRow: 1000, // Limit to first 1000 rows
				endCol: 26    // Limit to first 26 columns
			})

			if (sourceData.length > 0) {
				// Write data to target sheet
				await this.client.writeRange(
					{
						sheet: targetSheet.title,
						startRow: 1,
						startCol: 1,
						endRow: sourceData.length,
						endCol: sourceData[0]?.length || 1
					},
					sourceData
				)
			}
		} catch (error) {
			console.warn(`Failed to copy from sheet "${sourceSheetName}":`, error)
			throw error
		}
	}

	/**
	 * Generate summary of the create operation
	 */
	private generateSummary(sheet: SheetInfo, params: CreateSheetParams): string {
		let summary = `Created sheet "${sheet.title}" with ${sheet.rowCount} rows and ${sheet.columnCount} columns`
		
		if (params.template && params.template !== 'blank') {
			summary += ` using ${params.template} template`
		}

		if (params.copyFrom) {
			summary += ` copied from "${params.copyFrom}"`
		}

		return summary
	}

	/**
	 * Generate warnings about the create operation
	 */
	private generateWarnings(params: CreateSheetParams): string[] {
		const warnings: string[] = []

		// Warn about large sheets
		const totalCells = (params.rowCount || 1000) * (params.columnCount || 26)
		if (totalCells > 100000) {
			warnings.push(`Large sheet created (${totalCells} cells) - may impact performance`)
		}

		// Warn about copying large sheets
		if (params.copyFrom) {
			warnings.push('Copying data may take some time for large sheets')
		}

		return warnings
	}

	/**
	 * Create multiple sheets at once
	 */
	async createMultiple(sheets: CreateSheetParams[]): Promise<CreateSheetResult[]> {
		const results: CreateSheetResult[] = []

		for (const sheetParams of sheets) {
			const result = await this.execute(sheetParams)
			results.push(result)
			
			// If one fails, continue with others but note the failure
			if (!result.success) {
				console.warn(`Failed to create sheet "${sheetParams.name}":`, result.error)
			}
		}

		return results
	}

	/**
	 * Create sheet with data
	 */
	async createWithData(params: {
		name: string
		data: (string | number | boolean)[][]
		headers?: string[]
		template?: 'blank' | 'data_table' | 'dashboard' | 'report'
	}): Promise<CreateSheetResult> {
		try {
			// First create the sheet
			const createResult = await this.execute({
				name: params.name,
				template: params.template || 'blank'
			})

			if (!createResult.success || !createResult.sheet) {
				return createResult
			}

			// Then add the data
			let dataToWrite = params.data
			if (params.headers) {
				dataToWrite = [params.headers, ...params.data]
			}

			const cellData = dataToWrite.map(row => 
				row.map(value => ({ value }))
			)

			await this.client.writeRange(
				{
					sheet: createResult.sheet.title,
					startRow: 1,
					startCol: 1,
					endRow: cellData.length,
					endCol: cellData[0]?.length || 1
				},
				cellData
			)

			return {
				...createResult,
				summary: `${createResult.summary} and populated with ${params.data.length} rows of data`
			}
		} catch (error) {
			return {
				success: false,
				summary: `Failed to create sheet with data: ${error.message}`,
				error: error.message
			}
		}
	}
}