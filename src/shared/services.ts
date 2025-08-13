// Stub implementations for services that were in @roo-code packages
// These are simplified versions for Sheets IDE

import { TelemetryEventName, CloudUserInfo, OrganizationAllowList } from "./types"

// Telemetry Service stub
export class TelemetryService {
	private static _instance: TelemetryService | null = null
	private isEnabled = false

	static get instance(): TelemetryService {
		if (!TelemetryService._instance) {
			TelemetryService._instance = new TelemetryService()
		}
		return TelemetryService._instance
	}

	static hasInstance(): boolean {
		return TelemetryService._instance !== null
	}

	updateTelemetryState(enabled: boolean): void {
		this.isEnabled = enabled
	}

	setProvider(provider: any): void {
		// Stub implementation
	}

	captureEvent(eventName: TelemetryEventName, properties?: any): void {
		if (!this.isEnabled) return
		console.log(`[Telemetry] ${eventName}`, properties)
	}

	captureCodeActionUsed(actionType: string): void {
		this.captureEvent(TelemetryEventName.AUTHENTICATION_INITIATED, { actionType })
	}

	captureModeSwitch(taskId: string, mode: string): void {
		this.captureEvent(TelemetryEventName.AUTHENTICATION_INITIATED, { taskId, mode })
	}

	captureModeSettingChanged(setting: string): void {
		this.captureEvent(TelemetryEventName.AUTHENTICATION_INITIATED, { setting })
	}

	captureCustomModeCreated(slug: string, name: string): void {
		this.captureEvent(TelemetryEventName.AUTHENTICATION_INITIATED, { slug, name })
	}

	captureTabShown(tab: string): void {
		this.captureEvent(TelemetryEventName.AUTHENTICATION_INITIATED, { tab })
	}
}

// Cloud Service stub
export class CloudService {
	private static _instance: CloudService | null = null
	private authenticated = false
	private userInfo: CloudUserInfo | null = null

	static get instance(): CloudService {
		if (!CloudService._instance) {
			CloudService._instance = new CloudService()
		}
		return CloudService._instance
	}

	static hasInstance(): boolean {
		return CloudService._instance !== null
	}

	isAuthenticated(): boolean {
		return this.authenticated
	}

	getUserInfo(): CloudUserInfo | null {
		return this.userInfo
	}

	async login(): Promise<void> {
		// Stub implementation - would integrate with actual auth
		this.authenticated = true
		this.userInfo = {
			id: "stub-user",
			email: "user@example.com",
			name: "Stub User"
		}
	}

	async logout(): Promise<void> {
		this.authenticated = false
		this.userInfo = null
	}

	getAllowList(): OrganizationAllowList {
		return {
			providers: ["*"],
			models: ["*"]
		}
	}

	getOrganizationSettings(): any {
		return null
	}

	async canShareTask(): Promise<boolean> {
		return false
	}

	async shareTask(taskId: string, visibility: string, messages?: any[]): Promise<any> {
		return {
			success: false,
			error: "Sharing not implemented in Sheets IDE"
		}
	}

	on(event: string, handler: Function): void {
		// Stub event listener
	}

	off(event: string, handler: Function): void {
		// Stub event listener
	}
}

// Utility function stubs
export function getRooCodeApiUrl(): string {
	return "https://api.roo-code.com"
}

export function getClerkBaseUrl(): string {
	return "https://clerk.roo-code.com"
}

export const PRODUCTION_CLERK_BASE_URL = "https://clerk.roo-code.com"