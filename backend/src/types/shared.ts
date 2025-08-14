// Shared types between frontend and backend
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  spreadsheetId?: string;
}

export interface ChatRequest {
  message: string;
  apiKey: string;
  spreadsheetId: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  spreadsheetId?: string;
}

export interface StreamingChatChunk {
  type: 'text' | 'complete' | 'error';
  content?: string;
  response?: string;
  spreadsheetId?: string;
  error?: string;
}

export interface SpreadsheetInfo {
  id: string;
  title: string;
  sheets: SheetInfo[];
  permissions: string[];
}

export interface SheetInfo {
  id: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export interface CellRange {
  sheet: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface CellData {
  values: any[][];
  range: string;
}

export interface SheetsOperation {
  type: 'read' | 'write' | 'create' | 'format' | 'formula';
  range?: string;
  values?: any[][];
  sheetName?: string;
  formula?: string;
  formatting?: CellFormatting;
}

export interface CellFormatting {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}