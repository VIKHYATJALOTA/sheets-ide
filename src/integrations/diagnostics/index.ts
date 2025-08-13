// Diagnostics integration stub for Sheets IDE
// Replaces missing diagnostics integration

export interface DiagnosticMessage {
	severity: 'error' | 'warning' | 'info' | 'hint'
	message: string
	source: string
	code?: string | number
	range: {
		start: { line: number; character: number }
		end: { line: number; character: number }
	}
	relatedInformation?: DiagnosticRelatedInformation[]
}

export interface DiagnosticRelatedInformation {
	location: {
		uri: string
		range: {
			start: { line: number; character: number }
			end: { line: number; character: number }
		}
	}
	message: string
}

export interface DiagnosticsProvider {
	getDiagnostics(uri: string): Promise<DiagnosticMessage[]>
	getAllDiagnostics(): Promise<Map<string, DiagnosticMessage[]>>
	onDiagnosticsChanged(callback: (uri: string, diagnostics: DiagnosticMessage[]) => void): void
}

export class DiagnosticsService implements DiagnosticsProvider {
	private static instance: DiagnosticsService
	private diagnostics: Map<string, DiagnosticMessage[]> = new Map()
	private listeners: Array<(uri: string, diagnostics: DiagnosticMessage[]) => void> = []

	static getInstance(): DiagnosticsService {
		if (!DiagnosticsService.instance) {
			DiagnosticsService.instance = new DiagnosticsService()
		}
		return DiagnosticsService.instance
	}

	async getDiagnostics(uri: string): Promise<DiagnosticMessage[]> {
		return this.diagnostics.get(uri) || []
	}

	async getAllDiagnostics(): Promise<Map<string, DiagnosticMessage[]>> {
		return new Map(this.diagnostics)
	}

	onDiagnosticsChanged(callback: (uri: string, diagnostics: DiagnosticMessage[]) => void): void {
		this.listeners.push(callback)
	}

	updateDiagnostics(uri: string, diagnostics: DiagnosticMessage[]): void {
		this.diagnostics.set(uri, diagnostics)
		this.listeners.forEach(listener => listener(uri, diagnostics))
	}

	clearDiagnostics(uri: string): void {
		this.diagnostics.delete(uri)
		this.listeners.forEach(listener => listener(uri, []))
	}

	clearAllDiagnostics(): void {
		const uris = Array.from(this.diagnostics.keys())
		this.diagnostics.clear()
		uris.forEach(uri => {
			this.listeners.forEach(listener => listener(uri, []))
		})
	}

	// Helper method to format diagnostics for display
	formatDiagnostics(diagnostics: DiagnosticMessage[]): string {
		if (diagnostics.length === 0) {
			return 'No diagnostics found.'
		}

		return diagnostics.map(diagnostic => {
			const location = `${diagnostic.range.start.line + 1}:${diagnostic.range.start.character + 1}`
			const severity = diagnostic.severity.toUpperCase()
			return `[${severity}] ${location}: ${diagnostic.message} (${diagnostic.source})`
		}).join('\n')
	}

	// Helper method to get diagnostics summary
	getDiagnosticsSummary(): { errors: number; warnings: number; info: number; hints: number } {
		let errors = 0
		let warnings = 0
		let info = 0
		let hints = 0

		for (const diagnostics of this.diagnostics.values()) {
			for (const diagnostic of diagnostics) {
				switch (diagnostic.severity) {
					case 'error':
						errors++
						break
					case 'warning':
						warnings++
						break
					case 'info':
						info++
						break
					case 'hint':
						hints++
						break
				}
			}
		}

		return { errors, warnings, info, hints }
	}
}

export const diagnosticsService = DiagnosticsService.getInstance()
export default diagnosticsService