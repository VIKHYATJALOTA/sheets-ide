import express from 'express';
import cors from 'cors';
import { SheetsService } from './services/sheets';
import { AIService, AnthropicProvider, OpenAIProvider, GeminiProvider } from './services/ai';
import { AuthService, extractAccessToken } from './services/auth';
import { SessionService } from './services/session';
import { ChatRequest, ChatMessage, StreamingChatChunk, APIResponse } from './types/shared';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const authService = new AuthService({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
});

const aiService = new AIService();
const sessionService = new SessionService();

// Start session cleanup timer
sessionService.startCleanupTimer();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Sheets IDE Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// OAuth endpoints
app.get('/auth/url', (req, res) => {
  try {
    const { state } = req.query;
    const authUrl = authService.generateAuthUrl(state as string);
    
    res.json({
      success: true,
      authUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Auth URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate auth URL',
    });
  }
});

app.post('/auth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    const tokens = await authService.exchangeCodeForTokens(code);
    const userInfo = await authService.getUserInfo(tokens.accessToken);
    
    res.json({
      success: true,
      tokens,
      user: userInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Auth callback error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const tokens = await authService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
});

// Session management endpoints
app.post('/api/session/create', (req, res) => {
  try {
    const { spreadsheetId } = req.body;
    const sessionId = sessionService.createSession(spreadsheetId);
    
    res.json({
      success: true,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session',
    });
  }
});

app.get('/api/session/:id', (req, res) => {
  try {
    const { id } = req.params;
    const session = sessionService.getSession(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        messageCount: session.messages.length,
        spreadsheetId: session.spreadsheetId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get session',
    });
  }
});

app.get('/api/session/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const history = sessionService.getHistory(id);
    
    res.json({
      success: true,
      messages: history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get session history',
    });
  }
});

app.delete('/api/session/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = sessionService.deleteSession(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete session',
    });
  }
});

app.post('/api/session/:id/clear', (req, res) => {
  try {
    const { id } = req.params;
    sessionService.clearSession(id);
    
    res.json({
      success: true,
      message: 'Session cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear session',
    });
  }
});

// Main chat endpoint with Google Sheets integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, aiProvider = 'anthropic', aiApiKey, spreadsheetId }: ChatRequest & { sessionId: string; aiProvider?: string; aiApiKey?: string } = req.body;

    // Validate required fields
    if (!message || !sessionId || !aiApiKey || !spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, sessionId, aiApiKey, spreadsheetId',
      });
    }

    // Get access token from Authorization header
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    // Initialize services
    const sheetsService = new SheetsService(accessToken);
    const aiProvider_instance = aiService.createProvider(aiProvider as 'anthropic' | 'openai' | 'gemini', aiApiKey);

    // Get conversation history from session
    const conversationHistory = sessionService.getHistory(sessionId);

    // Update session with current spreadsheet if different
    const session = sessionService.getSession(sessionId);
    if (session && session.spreadsheetId !== spreadsheetId) {
      sessionService.setSpreadsheetId(sessionId, spreadsheetId);
    }

    // Get spreadsheet info for context
    let spreadsheetInfo;
    try {
      spreadsheetInfo = await sheetsService.getSpreadsheetInfo(spreadsheetId);
    } catch (error: any) {
      console.warn('Could not get spreadsheet info:', error.message);
    }

    // Build system prompt with sheets context
    const systemPrompt = aiService.buildSheetsSystemPrompt(spreadsheetId, spreadsheetInfo);

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      spreadsheetId,
    };

    // Add user message to session
    sessionService.addMessage(sessionId, userMessage);

    // Prepare conversation history for AI
    const messages: ChatMessage[] = [
      ...conversationHistory,
      userMessage,
    ];

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    let fullResponse = '';
    
    try {
      // Stream AI response
      for await (const chunk of aiProvider_instance.chat(messages, systemPrompt)) {
        if (chunk.type === 'text' && chunk.content) {
          fullResponse += chunk.content;
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else if (chunk.type === 'complete') {
          // Create AI message and save to session
          const aiMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
            spreadsheetId,
          };
          
          sessionService.addMessage(sessionId, aiMessage);
          
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            response: fullResponse,
            sessionId,
            spreadsheetId,
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } else if (chunk.type === 'error') {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }
    } catch (streamError: any) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: streamError.message || 'Streaming failed'
      })}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
});

// Spreadsheet info endpoint
app.get('/api/spreadsheet/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = extractAccessToken(req);
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const sheetsService = new SheetsService(accessToken);
    const spreadsheetInfo = await sheetsService.getSpreadsheetInfo(id);
    
    res.json({ 
      success: true, 
      data: spreadsheetInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Spreadsheet info error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get spreadsheet info',
      timestamp: new Date().toISOString(),
    });
  }
});

// Sheets operations endpoint
app.post('/api/spreadsheet/:id/operation', async (req, res) => {
  try {
    const { id } = req.params;
    const { operation } = req.body;
    const accessToken = extractAccessToken(req);
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required',
      });
    }

    const sheetsService = new SheetsService(accessToken);
    const result = await sheetsService.executeOperation(id, operation);
    
    res.json({ 
      success: true, 
      data: result,
      operation: operation.type,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Sheets operation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Operation failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// List available features
app.get('/api/features', (req, res) => {
  res.json({
    success: true,
    data: {
      features: [
        'AI-powered spreadsheet automation',
        'Natural language processing for sheets',
        'Multi-AI provider support (Anthropic, OpenAI)',
        'Real-time streaming responses',
        'Google Sheets API integration',
        'OAuth 2.0 authentication',
        'Read/Write spreadsheet operations',
        'Formula generation and cell formatting',
      ],
      aiProviders: ['anthropic', 'openai', 'gemini'],
      operations: ['read', 'write', 'create', 'formula', 'format'],
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sheets IDE Backend running on port ${PORT}`);
  console.log(`📊 Google Sheets API integration enabled`);
  console.log(`🤖 AI Providers: Anthropic Claude, OpenAI GPT, Google Gemini`);
  console.log(`🔐 OAuth 2.0 authentication configured`);
  console.log(`💬 Session management enabled`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/features`);
  console.log(`📈 Session stats: http://localhost:${PORT}/api/stats`);
});

export default app;