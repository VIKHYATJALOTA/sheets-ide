/**
 * Sheets Tools Index
 * Exports all Google Sheets tools for Sheets IDE
 */

export { ReadRangeTool } from './readRangeTool'
export type { ReadRangeParams, ReadRangeResult } from './readRangeTool'

export { WriteRangeTool } from './writeRangeTool'
export type { WriteRangeParams, WriteRangeResult } from './writeRangeTool'

export { CreateSheetTool } from './createSheetTool'
export type { CreateSheetParams, CreateSheetResult } from './createSheetTool'

export { SetFormulaTool } from './setFormulaTool'
export type { SetFormulaParams, SetFormulaResult } from './setFormulaTool'

export { FormatCellsTool } from './formatCellsTool'
export type { FormatCellsParams, FormatCellsResult } from './formatCellsTool'

/**
 * Sheets Tools Manager
 * Provides a unified interface to all Sheets tools
 */
import { SheetsApiClient } from '../api/SheetsApiClient'
import { ReadRangeTool } from './readRangeTool'
import { WriteRangeTool } from './writeRangeTool'
import { CreateSheetTool } from './createSheetTool'
import { SetFormulaTool } from './setFormulaTool'
import { FormatCellsTool } from './formatCellsTool'

export class SheetsToolsManager {
	public readonly readRange: ReadRangeTool
	public readonly writeRange: WriteRangeTool
	public readonly createSheet: CreateSheetTool
	public readonly setFormula: SetFormulaTool
	public readonly formatCells: FormatCellsTool

	constructor(client: SheetsApiClient) {
		this.readRange = new ReadRangeTool(client)
		this.writeRange = new WriteRangeTool(client)
		this.createSheet = new CreateSheetTool(client)
		this.setFormula = new SetFormulaTool(client)
		this.formatCells = new FormatCellsTool(client)
	}

	/**
	 * Get all available tools
	 */
	getAllTools() {
		return {
			readRange: this.readRange,
			writeRange: this.writeRange,
			createSheet: this.createSheet,
			setFormula: this.setFormula,
			formatCells: this.formatCells
		}
	}

	/**
	 * Get tool by name
	 */
	getTool(name: string) {
		const tools = this.getAllTools()
		return tools[name as keyof typeof tools]
	}

	/**
	 * List all available tool names
	 */
	getToolNames(): string[] {
		return Object.keys(this.getAllTools())
	}
}