import { Anthropic } from '@anthropic-ai/sdk';
import { ChatMessage, StreamingChatChunk } from '../types/shared';

export interface AIProvider {
  name: string;
  chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<StreamingChatChunk>;
}

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<StreamingChatChunk> {
    try {
      const anthropicMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const stream = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          yield {
            type: 'text',
            content: text,
          };
        }
      }

      yield {
        type: 'complete',
        response: fullResponse,
      };
    } catch (error: any) {
      console.error('Anthropic AI error:', error);
      yield {
        type: 'error',
        error: error.message || 'AI service error',
      };
    }
  }
}

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<StreamingChatChunk> {
    try {
      // Add system message to the beginning
      const openaiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: openaiMessages,
          stream: true,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield {
                type: 'complete',
                response: fullResponse,
              };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                yield {
                  type: 'text',
                  content,
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('OpenAI error:', error);
      yield {
        type: 'error',
        error: error.message || 'OpenAI service error',
      };
    }
  }
}

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<StreamingChatChunk> {
    try {
      // Prepare messages for Gemini API
      const geminiMessages = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                fullResponse += content;
                yield {
                  type: 'text',
                  content,
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      yield {
        type: 'complete',
        response: fullResponse,
      };
    } catch (error: any) {
      console.error('Gemini error:', error);
      yield {
        type: 'error',
        error: error.message || 'Gemini service error',
      };
    }
  }
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();

  addProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  createProvider(type: 'anthropic' | 'openai' | 'gemini', apiKey: string): AIProvider {
    switch (type) {
      case 'anthropic':
        return new AnthropicProvider(apiKey);
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'gemini':
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }

  buildSheetsSystemPrompt(spreadsheetId: string, spreadsheetInfo?: any): string {
    return `You are Sheets IDE, an AI assistant for Google Sheets automation.

You help users automate spreadsheet tasks through natural conversation. You can:
- Read and analyze data from spreadsheet ranges
- Write data to specific cells or ranges
- Create new sheets within the spreadsheet
- Generate and set formulas
- Format cells with colors, fonts, and styles
- Provide insights and analysis of spreadsheet data

Current Spreadsheet ID: ${spreadsheetId}
${spreadsheetInfo ? `Spreadsheet Title: ${spreadsheetInfo.title}` : ''}
${spreadsheetInfo?.sheets ? `Available Sheets: ${spreadsheetInfo.sheets.map((s: any) => s.title).join(', ')}` : ''}

When users ask you to perform actions on the spreadsheet, explain what you would do and ask for confirmation before making changes. Be conversational and helpful, providing clear guidance on spreadsheet automation tasks.

If you need to perform actual operations on the spreadsheet, describe the specific actions you would take (like reading range A1:C10, writing data to B2:B5, creating a new sheet, etc.).`;
  }
}