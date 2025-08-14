import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { SpreadsheetInfo, SheetInfo, CellData, SheetsOperation, CellFormatting } from '../types/shared';

export class SheetsService {
  private auth: OAuth2Client;
  private sheets: any;

  constructor(accessToken: string) {
    this.auth = new OAuth2Client();
    this.auth.setCredentials({ access_token: accessToken });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Get spreadsheet metadata and sheet information
   */
  async getSpreadsheetInfo(spreadsheetId: string): Promise<SpreadsheetInfo> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });

      const spreadsheet = response.data;
      const sheets: SheetInfo[] = spreadsheet.sheets?.map((sheet: any) => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        rowCount: sheet.properties.gridProperties?.rowCount || 1000,
        columnCount: sheet.properties.gridProperties?.columnCount || 26,
      })) || [];

      return {
        id: spreadsheetId,
        title: spreadsheet.properties?.title || 'Untitled Spreadsheet',
        sheets,
        permissions: ['read', 'write'], // TODO: Get actual permissions
      };
    } catch (error: any) {
      console.error('Error getting spreadsheet info:', error);
      throw new Error(`Failed to get spreadsheet info: ${error.message}`);
    }
  }

  /**
   * Read data from a specific range
   */
  async readRange(spreadsheetId: string, range: string): Promise<CellData> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      return {
        values: response.data.values || [],
        range: response.data.range || range,
      };
    } catch (error: any) {
      console.error('Error reading range:', error);
      throw new Error(`Failed to read range ${range}: ${error.message}`);
    }
  }

  /**
   * Write data to a specific range
   */
  async writeRange(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error: any) {
      console.error('Error writing range:', error);
      throw new Error(`Failed to write to range ${range}: ${error.message}`);
    }
  }

  /**
   * Create a new sheet in the spreadsheet
   */
  async createSheet(spreadsheetId: string, sheetName: string): Promise<SheetInfo> {
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      const newSheet = response.data.replies[0].addSheet.properties;
      return {
        id: newSheet.sheetId,
        title: newSheet.title,
        rowCount: newSheet.gridProperties?.rowCount || 1000,
        columnCount: newSheet.gridProperties?.columnCount || 26,
      };
    } catch (error: any) {
      console.error('Error creating sheet:', error);
      throw new Error(`Failed to create sheet ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Set a formula in a specific cell
   */
  async setFormula(spreadsheetId: string, range: string, formula: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[formula]],
        },
      });
    } catch (error: any) {
      console.error('Error setting formula:', error);
      throw new Error(`Failed to set formula in ${range}: ${error.message}`);
    }
  }

  /**
   * Format cells with styling
   */
  async formatCells(spreadsheetId: string, range: string, formatting: CellFormatting): Promise<void> {
    try {
      // Parse the range to get sheet ID and cell coordinates
      const [sheetName, cellRange] = range.split('!');
      const spreadsheetInfo = await this.getSpreadsheetInfo(spreadsheetId);
      const sheet = spreadsheetInfo.sheets.find(s => s.title === sheetName);
      
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      // Convert A1 notation to grid coordinates
      const gridRange = this.a1ToGridRange(cellRange, sheet.id);

      const formatRequest: any = {
        repeatCell: {
          range: gridRange,
          cell: {
            userEnteredFormat: {},
          },
          fields: 'userEnteredFormat',
        },
      };

      // Apply formatting options
      if (formatting.backgroundColor) {
        formatRequest.repeatCell.cell.userEnteredFormat.backgroundColor = this.hexToRgb(formatting.backgroundColor);
      }
      if (formatting.textColor) {
        formatRequest.repeatCell.cell.userEnteredFormat.textFormat = {
          foregroundColor: this.hexToRgb(formatting.textColor),
        };
      }
      if (formatting.bold !== undefined) {
        formatRequest.repeatCell.cell.userEnteredFormat.textFormat = {
          ...formatRequest.repeatCell.cell.userEnteredFormat.textFormat,
          bold: formatting.bold,
        };
      }
      if (formatting.italic !== undefined) {
        formatRequest.repeatCell.cell.userEnteredFormat.textFormat = {
          ...formatRequest.repeatCell.cell.userEnteredFormat.textFormat,
          italic: formatting.italic,
        };
      }
      if (formatting.fontSize) {
        formatRequest.repeatCell.cell.userEnteredFormat.textFormat = {
          ...formatRequest.repeatCell.cell.userEnteredFormat.textFormat,
          fontSize: formatting.fontSize,
        };
      }

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [formatRequest],
        },
      });
    } catch (error: any) {
      console.error('Error formatting cells:', error);
      throw new Error(`Failed to format cells in ${range}: ${error.message}`);
    }
  }

  /**
   * Execute a sheets operation
   */
  async executeOperation(spreadsheetId: string, operation: SheetsOperation): Promise<any> {
    switch (operation.type) {
      case 'read':
        if (!operation.range) throw new Error('Range required for read operation');
        return await this.readRange(spreadsheetId, operation.range);

      case 'write':
        if (!operation.range || !operation.values) {
          throw new Error('Range and values required for write operation');
        }
        return await this.writeRange(spreadsheetId, operation.range, operation.values);

      case 'create':
        if (!operation.sheetName) throw new Error('Sheet name required for create operation');
        return await this.createSheet(spreadsheetId, operation.sheetName);

      case 'formula':
        if (!operation.range || !operation.formula) {
          throw new Error('Range and formula required for formula operation');
        }
        return await this.setFormula(spreadsheetId, operation.range, operation.formula);

      case 'format':
        if (!operation.range || !operation.formatting) {
          throw new Error('Range and formatting required for format operation');
        }
        return await this.formatCells(spreadsheetId, operation.range, operation.formatting);

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Convert A1 notation to grid range for API calls
   */
  private a1ToGridRange(a1Range: string, sheetId: number): any {
    // Simple implementation - can be enhanced for complex ranges
    const match = a1Range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) {
      throw new Error(`Invalid range format: ${a1Range}`);
    }

    const [, startCol, startRow, endCol, endRow] = match;
    
    return {
      sheetId,
      startRowIndex: parseInt(startRow) - 1,
      endRowIndex: parseInt(endRow),
      startColumnIndex: this.columnToIndex(startCol),
      endColumnIndex: this.columnToIndex(endCol) + 1,
    };
  }

  /**
   * Convert column letter to index (A=0, B=1, etc.)
   */
  private columnToIndex(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result - 1;
  }

  /**
   * Convert hex color to RGB object for Google Sheets API
   */
  private hexToRgb(hex: string): { red: number; green: number; blue: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    
    return {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255,
    };
  }
}