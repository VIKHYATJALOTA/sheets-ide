// Command registration for Sheets IDE
// Replaces missing command registration

import * as vscode from 'vscode'

export interface CommandRegistration {
	command: string
	callback: (...args: any[]) => any
	thisArg?: any
}

export class CommandRegistry {
	private static instance: CommandRegistry
	private registeredCommands: Map<string, vscode.Disposable> = new Map()

	static getInstance(): CommandRegistry {
		if (!CommandRegistry.instance) {
			CommandRegistry.instance = new CommandRegistry()
		}
		return CommandRegistry.instance
	}

	registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable {
		const disposable = vscode.commands.registerCommand(command, callback, thisArg)
		this.registeredCommands.set(command, disposable)
		return disposable
	}

	unregisterCommand(command: string): void {
		const disposable = this.registeredCommands.get(command)
		if (disposable) {
			disposable.dispose()
			this.registeredCommands.delete(command)
		}
	}

	dispose(): void {
		for (const disposable of this.registeredCommands.values()) {
			disposable.dispose()
		}
		this.registeredCommands.clear()
	}
}

// Stub implementation for missing commands
export function openClineInNewTab(): void {
	// Stub implementation - would open Cline in new tab
	console.log('Opening Cline in new tab...')
}

export function setPanel(panel: any, type: string): void {
	// Stub implementation - would set the panel reference
	console.log('Setting panel:', panel, 'type:', type)
}

export function registerSheetsCommands(context: vscode.ExtensionContext): void {
	const registry = CommandRegistry.getInstance()

	// Register Sheets IDE specific commands
	const commands: CommandRegistration[] = [
		{
			command: 'sheets-ide.openInNewTab',
			callback: openClineInNewTab
		},
		{
			command: 'sheets-ide.selectSpreadsheet',
			callback: () => {
				console.log('Selecting spreadsheet...')
			}
		},
		{
			command: 'sheets-ide.selectRange',
			callback: () => {
				console.log('Selecting range...')
			}
		},
		{
			command: 'sheets-ide.previewOperation',
			callback: () => {
				console.log('Previewing operation...')
			}
		}
	]

	// Register all commands
	for (const cmd of commands) {
		const disposable = registry.registerCommand(cmd.command, cmd.callback, cmd.thisArg)
		context.subscriptions.push(disposable)
	}
}

export function registerAllCommands(context: vscode.ExtensionContext): void {
	registerSheetsCommands(context)
}

export default {
	CommandRegistry,
	openClineInNewTab,
	registerSheetsCommands,
	registerAllCommands
}