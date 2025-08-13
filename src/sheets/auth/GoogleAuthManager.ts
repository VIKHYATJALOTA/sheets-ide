/**
 * Google OAuth Authentication Manager for Sheets IDE
 * Handles OAuth 2.0 flow for Google Sheets API access
 */

export interface GoogleAuthConfig {
	clientId: string
	clientSecret: string
	redirectUri: string
	scopes: string[]
}

export interface TokenResponse {
	access_token: string
	refresh_token?: string
	expires_in: number
	token_type: string
	scope: string
}

export interface AuthState {
	isAuthenticated: boolean
	accessToken?: string
	refreshToken?: string
	expiresAt?: number
	userEmail?: string
}

/**
 * Google OAuth Authentication Manager
 * Manages OAuth 2.0 flow and token refresh for Google APIs
 */
export class GoogleAuthManager {
	private config: GoogleAuthConfig
	private authState: AuthState = { isAuthenticated: false }
	private readonly GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
	private readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
	private readonly GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

	constructor(config?: GoogleAuthConfig) {
		this.config = config || this.getDefaultConfig()
	}

	/**
	 * Get default configuration from environment variables
	 */
	private getDefaultConfig(): GoogleAuthConfig {
		return {
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
			redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
			scopes: [
				'https://www.googleapis.com/auth/spreadsheets',
				'https://www.googleapis.com/auth/drive.file',
				'https://www.googleapis.com/auth/userinfo.email'
			]
		}
	}

	/**
	 * Generate OAuth authorization URL
	 */
	getAuthorizationUrl(state?: string): string {
		const params = new URLSearchParams({
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri,
			scope: this.config.scopes.join(' '),
			response_type: 'code',
			access_type: 'offline',
			prompt: 'consent'
		})

		if (state) {
			params.append('state', state)
		}

		return `${this.GOOGLE_AUTH_URL}?${params.toString()}`
	}

	/**
	 * Exchange authorization code for access token
	 */
	async exchangeCodeForToken(code: string): Promise<TokenResponse> {
		try {
			const response = await fetch(this.GOOGLE_TOKEN_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					code: code,
					grant_type: 'authorization_code',
					redirect_uri: this.config.redirectUri
				})
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
			}

			const tokenData: TokenResponse = await response.json()
			
			// Update auth state
			this.authState = {
				isAuthenticated: true,
				accessToken: tokenData.access_token,
				refreshToken: tokenData.refresh_token,
				expiresAt: Date.now() + (tokenData.expires_in * 1000)
			}

			// Get user info
			await this.fetchUserInfo()

			return tokenData
		} catch (error) {
			throw new Error(`Failed to exchange code for token: ${error}`)
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshAccessToken(): Promise<string> {
		if (!this.authState.refreshToken) {
			throw new Error('No refresh token available')
		}

		try {
			const response = await fetch(this.GOOGLE_TOKEN_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					refresh_token: this.authState.refreshToken,
					grant_type: 'refresh_token'
				})
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(`Token refresh failed: ${error.error_description || error.error}`)
			}

			const tokenData: TokenResponse = await response.json()
			
			// Update auth state
			this.authState.accessToken = tokenData.access_token
			this.authState.expiresAt = Date.now() + (tokenData.expires_in * 1000)
			
			// Update refresh token if provided
			if (tokenData.refresh_token) {
				this.authState.refreshToken = tokenData.refresh_token
			}

			return tokenData.access_token
		} catch (error) {
			// If refresh fails, clear auth state
			this.authState = { isAuthenticated: false }
			throw new Error(`Failed to refresh access token: ${error}`)
		}
	}

	/**
	 * Get valid access token (refresh if needed)
	 */
	async getAccessToken(): Promise<string> {
		// Check if we have a valid token
		if (!this.authState.isAuthenticated || !this.authState.accessToken) {
			throw new Error('Not authenticated. Please authenticate first.')
		}

		// Check if token is expired (with 5 minute buffer)
		const now = Date.now()
		const expiresAt = this.authState.expiresAt || 0
		const bufferTime = 5 * 60 * 1000 // 5 minutes

		if (now >= (expiresAt - bufferTime)) {
			// Token is expired or about to expire, refresh it
			return await this.refreshAccessToken()
		}

		return this.authState.accessToken
	}

	/**
	 * Fetch user information
	 */
	private async fetchUserInfo(): Promise<void> {
		if (!this.authState.accessToken) {
			return
		}

		try {
			const response = await fetch(this.GOOGLE_USERINFO_URL, {
				headers: {
					'Authorization': `Bearer ${this.authState.accessToken}`
				}
			})

			if (response.ok) {
				const userInfo = await response.json()
				this.authState.userEmail = userInfo.email
			}
		} catch (error) {
			// Non-critical error, just log it
			console.warn('Failed to fetch user info:', error)
		}
	}

	/**
	 * Get current authentication state
	 */
	getAuthState(): AuthState {
		return { ...this.authState }
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return this.authState.isAuthenticated && !!this.authState.accessToken
	}

	/**
	 * Sign out user
	 */
	signOut(): void {
		this.authState = { isAuthenticated: false }
	}

	/**
	 * Set authentication state (for loading from storage)
	 */
	setAuthState(state: AuthState): void {
		this.authState = { ...state }
	}

	/**
	 * Revoke access token
	 */
	async revokeToken(): Promise<void> {
		if (!this.authState.accessToken) {
			return
		}

		try {
			await fetch(`https://oauth2.googleapis.com/revoke?token=${this.authState.accessToken}`, {
				method: 'POST'
			})
		} catch (error) {
			console.warn('Failed to revoke token:', error)
		} finally {
			this.signOut()
		}
	}

	/**
	 * Validate current token by making a test API call
	 */
	async validateToken(): Promise<boolean> {
		if (!this.authState.accessToken) {
			return false
		}

		try {
			const response = await fetch(this.GOOGLE_USERINFO_URL, {
				headers: {
					'Authorization': `Bearer ${this.authState.accessToken}`
				}
			})

			return response.ok
		} catch (error) {
			return false
		}
	}

	/**
	 * Get user email from auth state
	 */
	getUserEmail(): string | undefined {
		return this.authState.userEmail
	}

	/**
	 * Create auth manager with stored tokens (for server-side usage)
	 */
	static createWithTokens(
		accessToken: string,
		refreshToken?: string,
		expiresAt?: number,
		config?: GoogleAuthConfig
	): GoogleAuthManager {
		const manager = new GoogleAuthManager(config)
		manager.setAuthState({
			isAuthenticated: true,
			accessToken,
			refreshToken,
			expiresAt
		})
		return manager
	}

	/**
	 * Create auth manager for Apps Script context
	 * Uses ScriptApp.getOAuthToken() for server-to-server auth
	 */
	static createForAppsScript(): GoogleAuthManager {
		const manager = new GoogleAuthManager()
		
		// Override getAccessToken for Apps Script context
		manager.getAccessToken = async () => {
			// In Apps Script, this would use ScriptApp.getOAuthToken()
			// For now, throw an error to indicate this needs Apps Script context
			throw new Error('Apps Script authentication not available in this context')
		}
		
		return manager
	}
}

/**
 * Utility functions for OAuth flow
 */
export class OAuthUtils {
	/**
	 * Generate a random state parameter for OAuth flow
	 */
	static generateState(): string {
		return Math.random().toString(36).substring(2, 15) + 
			   Math.random().toString(36).substring(2, 15)
	}

	/**
	 * Parse OAuth callback URL parameters
	 */
	static parseCallbackUrl(url: string): { code?: string; state?: string; error?: string } {
		const urlObj = new URL(url)
		return {
			code: urlObj.searchParams.get('code') || undefined,
			state: urlObj.searchParams.get('state') || undefined,
			error: urlObj.searchParams.get('error') || undefined
		}
	}

	/**
	 * Check if scopes are sufficient for Sheets operations
	 */
	static validateScopes(scopes: string[]): boolean {
		const requiredScopes = [
			'https://www.googleapis.com/auth/spreadsheets'
		]
		
		return requiredScopes.every(required => 
			scopes.some(scope => scope.includes(required))
		)
	}
}