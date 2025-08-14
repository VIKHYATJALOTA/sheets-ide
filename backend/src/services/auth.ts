import { OAuth2Client } from 'google-auth-library';

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scope?: string;
}

export class AuthService {
  private oauth2Client: OAuth2Client;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate OAuth URL for user authorization
   */
  generateAuthUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state || 'default',
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<TokenInfo> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date || undefined,
        scope: tokens.scope || undefined,
      };
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenInfo> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiryDate: credentials.expiry_date || undefined,
        scope: credentials.scope || undefined,
      };
    } catch (error: any) {
      console.error('Error refreshing access token:', error);
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Verify and get user info from access token
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error getting user info:', error);
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiryDate?: number): boolean {
    if (!expiryDate) return false;
    return Date.now() >= expiryDate;
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error: any) {
      console.error('Error revoking token:', error);
      throw new Error(`Failed to revoke token: ${error.message}`);
    }
  }
}

/**
 * Middleware to validate OAuth token in requests
 */
export function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header',
    });
  }

  const accessToken = authHeader.substring(7);
  req.accessToken = accessToken;
  next();
}

/**
 * Extract access token from request
 */
export function extractAccessToken(req: any): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}