import { ChatMessage } from '../types/shared';

export interface SessionData {
  id: string;
  messages: ChatMessage[];
  spreadsheetId?: string;
  createdAt: Date;
  lastActivity: Date;
}

export class SessionService {
  private sessions = new Map<string, SessionData>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create a new chat session
   */
  createSession(spreadsheetId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData: SessionData = {
      id: sessionId,
      messages: [],
      spreadsheetId,
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(sessionId, sessionData);
    this.cleanupExpiredSessions();
    
    console.log(`Created new session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add message with proper ID and timestamp
    const messageWithId: ChatMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: message.timestamp || new Date(),
    };

    session.messages.push(messageWithId);
    session.lastActivity = new Date();
    
    console.log(`Added message to session ${sessionId}: ${message.role}`);
  }

  /**
   * Get conversation history for a session
   */
  getHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.warn(`Session not found: ${sessionId}`);
      return [];
    }

    session.lastActivity = new Date();
    return [...session.messages]; // Return copy to prevent mutation
  }

  /**
   * Get session metadata
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    session.lastActivity = new Date();
    return { ...session }; // Return copy
  }

  /**
   * Update session spreadsheet ID
   */
  setSpreadsheetId(sessionId: string, spreadsheetId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.spreadsheetId = spreadsheetId;
    session.lastActivity = new Date();
    
    console.log(`Updated session ${sessionId} spreadsheet: ${spreadsheetId}`);
  }

  /**
   * Clear all messages in a session
   */
  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.messages = [];
    session.lastActivity = new Date();
    
    console.log(`Cleared session: ${sessionId}`);
  }

  /**
   * Delete a session completely
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    
    if (deleted) {
      console.log(`Deleted session: ${sessionId}`);
    }
    
    return deleted;
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Get session statistics
   */
  getStats(): { totalSessions: number; totalMessages: number } {
    let totalMessages = 0;
    
    for (const session of this.sessions.values()) {
      totalMessages += session.messages.length;
    }

    return {
      totalSessions: this.sessions.size,
      totalMessages,
    };
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
      console.log(`Cleaned up expired session: ${sessionId}`);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Start periodic cleanup (call this when server starts)
   */
  startCleanupTimer(): void {
    // Clean up every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
    
    console.log('Started session cleanup timer');
  }
}