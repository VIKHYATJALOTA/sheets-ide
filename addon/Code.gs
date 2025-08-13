/**
 * Sheets IDE - Google Apps Script Backend
 * AI-powered Google Sheets automation add-on
 */

// Configuration - Add your API keys here
const CONFIG = {
  ANTHROPIC_API_KEY: PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || 'your-anthropic-api-key-here',
  OPENAI_API_KEY: PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') || 'your-openai-api-key-here',
  AI_PROVIDER: 'anthropic' // 'anthropic' or 'openai'
};

function onHomepage() {
  // This function runs when the add-on is opened
  return createSidebar();
}

function createSidebar() {
  // Create and return the sidebar HTML
  const htmlOutput = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('Sheets IDE')
    .setWidth(400);
  
  return htmlOutput;
}

function onSelectionChange(e) {
  // This function runs when user selects different cells
  console.log('Selection changed:', e);
}

/**
 * Google Sheets API Functions
 * These functions will be called by the frontend to interact with sheets
 */

function readRange(spreadsheetId, range) {
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const rangeObj = sheet.getRange(range);
    const values = rangeObj.getValues();
    
    return {
      success: true,
      data: values,
      range: range
    };
  } catch (error) {
    console.error('Error reading range:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function writeRange(spreadsheetId, range, values) {
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const rangeObj = sheet.getRange(range);
    rangeObj.setValues(values);
    
    return {
      success: true,
      message: `Successfully wrote to ${range}`
    };
  } catch (error) {
    console.error('Error writing range:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function createSheet(spreadsheetId, sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const newSheet = spreadsheet.insertSheet(sheetName);
    
    return {
      success: true,
      sheetId: newSheet.getSheetId(),
      sheetName: sheetName
    };
  } catch (error) {
    console.error('Error creating sheet:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function listSheets(spreadsheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheets = spreadsheet.getSheets();
    
    const sheetInfo = sheets.map(sheet => ({
      name: sheet.getName(),
      id: sheet.getSheetId(),
      rowCount: sheet.getMaxRows(),
      columnCount: sheet.getMaxColumns()
    }));
    
    return {
      success: true,
      sheets: sheetInfo
    };
  } catch (error) {
    console.error('Error listing sheets:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function setFormula(spreadsheetId, range, formula) {
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const rangeObj = sheet.getRange(range);
    rangeObj.setFormula(formula);
    
    return {
      success: true,
      message: `Successfully set formula in ${range}`
    };
  } catch (error) {
    console.error('Error setting formula:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function formatCells(spreadsheetId, range, formatting) {
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    const rangeObj = sheet.getRange(range);
    
    // Apply formatting based on the formatting object
    if (formatting.bold) {
      rangeObj.setFontWeight('bold');
    }
    if (formatting.italic) {
      rangeObj.setFontStyle('italic');
    }
    if (formatting.backgroundColor) {
      rangeObj.setBackground(formatting.backgroundColor);
    }
    if (formatting.fontColor) {
      rangeObj.setFontColor(formatting.fontColor);
    }
    
    return {
      success: true,
      message: `Successfully formatted ${range}`
    };
  } catch (error) {
    console.error('Error formatting cells:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Utility Functions
 */

function getCurrentSpreadsheetId() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    return {
      success: true,
      spreadsheetId: spreadsheet.getId(),
      name: spreadsheet.getName()
    };
  } catch (error) {
    console.error('Error getting current spreadsheet:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getSelectedRange() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getActiveRange();
    
    return {
      success: true,
      range: range.getA1Notation(),
      sheetName: sheet.getName()
    };
  } catch (error) {
    console.error('Error getting selected range:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * AI Integration Functions
 */

function processAIRequest(userMessage) {
  try {
    // Get current spreadsheet context
    const context = getCurrentSpreadsheetContext();
    
    // Create AI prompt with context
    const prompt = createAIPrompt(userMessage, context);
    
    // Call AI API
    const aiResponse = callAI(prompt);
    
    // Parse AI response and execute actions
    const actions = parseAIResponse(aiResponse);
    
    // Execute the actions
    const results = executeActions(actions);
    
    return {
      success: true,
      message: aiResponse,
      actions: actions,
      results: results
    };
  } catch (error) {
    console.error('Error processing AI request:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getCurrentSpreadsheetContext() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getActiveRange();
    
    // Get sample data from current sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const sampleData = values.slice(0, Math.min(5, values.length)); // First 5 rows
    
    return {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      currentSheet: sheet.getName(),
      selectedRange: range.getA1Notation(),
      sheetCount: spreadsheet.getSheets().length,
      rowCount: sheet.getLastRow(),
      columnCount: sheet.getLastColumn(),
      sampleData: sampleData,
      headers: values.length > 0 ? values[0] : []
    };
  } catch (error) {
    console.error('Error getting context:', error);
    return {};
  }
}

function createAIPrompt(userMessage, context) {
  const systemPrompt = `You are Sheets IDE, an AI assistant that helps automate Google Sheets tasks. You can:

1. Read and write data to spreadsheet ranges
2. Create new sheets
3. Insert formulas (SUM, AVERAGE, VLOOKUP, etc.)
4. Format cells (bold, colors, alignment)
5. Create pivot tables and charts

Current Context:
- Spreadsheet: ${context.spreadsheetName || 'Unknown'}
- Current Sheet: ${context.currentSheet || 'Unknown'}
- Selected Range: ${context.selectedRange || 'None'}
- Data Rows: ${context.rowCount || 0}
- Data Columns: ${context.columnCount || 0}
- Headers: ${context.headers ? context.headers.join(', ') : 'None'}

Available Actions:
- readRange(spreadsheetId, range)
- writeRange(spreadsheetId, range, values)
- createSheet(spreadsheetId, sheetName)
- setFormula(spreadsheetId, range, formula)
- formatCells(spreadsheetId, range, formatting)
- createPivotTable(spreadsheetId, sourceRange, config)

Respond with a JSON object containing:
{
  "message": "Human-readable response",
  "actions": [
    {
      "type": "readRange|writeRange|createSheet|setFormula|formatCells|createPivotTable",
      "params": { /* action parameters */ }
    }
  ]
}`;

  return `${systemPrompt}\n\nUser Request: ${userMessage}`;
}

function callAI(prompt) {
  try {
    if (CONFIG.AI_PROVIDER === 'anthropic') {
      return callAnthropicAPI(prompt);
    } else if (CONFIG.AI_PROVIDER === 'openai') {
      return callOpenAIAPI(prompt);
    } else {
      throw new Error('Invalid AI provider configured');
    }
  } catch (error) {
    console.error('Error calling AI:', error);
    throw error;
  }
}

function callAnthropicAPI(prompt) {
  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = JSON.parse(response.getContentText());
  
  if (data.error) {
    throw new Error(`Anthropic API error: ${data.error.message}`);
  }
  
  return data.content[0].text;
}

function callOpenAIAPI(prompt) {
  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
    },
    payload: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are Sheets IDE, an AI assistant for Google Sheets automation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000
    })
  });

  const data = JSON.parse(response.getContentText());
  
  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`);
  }
  
  return data.choices[0].message.content;
}

function parseAIResponse(aiResponse) {
  try {
    // Try to parse JSON response
    const parsed = JSON.parse(aiResponse);
    return parsed.actions || [];
  } catch (error) {
    // If not JSON, create a simple text response action
    return [{
      type: 'message',
      params: { text: aiResponse }
    }];
  }
}

function executeActions(actions) {
  const results = [];
  
  for (const action of actions) {
    try {
      let result;
      
      switch (action.type) {
        case 'readRange':
          result = readRange(action.params.spreadsheetId, action.params.range);
          break;
        case 'writeRange':
          result = writeRange(action.params.spreadsheetId, action.params.range, action.params.values);
          break;
        case 'createSheet':
          result = createSheet(action.params.spreadsheetId, action.params.sheetName);
          break;
        case 'setFormula':
          result = setFormula(action.params.spreadsheetId, action.params.range, action.params.formula);
          break;
        case 'formatCells':
          result = formatCells(action.params.spreadsheetId, action.params.range, action.params.formatting);
          break;
        case 'createPivotTable':
          result = createPivotTable(action.params.spreadsheetId, action.params.sourceRange, action.params.config);
          break;
        default:
          result = { success: false, error: `Unknown action type: ${action.type}` };
      }
      
      results.push({
        action: action.type,
        result: result
      });
    } catch (error) {
      results.push({
        action: action.type,
        result: { success: false, error: error.toString() }
      });
    }
  }
  
  return results;
}

/**
 * Advanced Features - Pivot Tables
 */

function createPivotTable(spreadsheetId, sourceRange, config) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sourceSheet = spreadsheet.getActiveSheet();
    
    // Create new sheet for pivot table
    const pivotSheetName = config.name || 'Pivot Table';
    const pivotSheet = spreadsheet.insertSheet(pivotSheetName);
    
    // Get source data
    const sourceData = sourceSheet.getRange(sourceRange);
    
    // Create pivot table
    const pivotTable = pivotSheet.getRange('A1').createPivotTable(sourceData);
    
    // Configure rows
    if (config.rows) {
      config.rows.forEach((row, index) => {
        pivotTable.addRowGroup(row.field);
      });
    }
    
    // Configure columns
    if (config.columns) {
      config.columns.forEach((col, index) => {
        pivotTable.addColumnGroup(col.field);
      });
    }
    
    // Configure values
    if (config.values) {
      config.values.forEach((val, index) => {
        pivotTable.addPivotValue(val.field, SpreadsheetApp.PivotTableSummarizeFunction[val.function]);
      });
    }
    
    return {
      success: true,
      pivotSheetName: pivotSheetName,
      message: `Created pivot table in sheet "${pivotSheetName}"`
    };
  } catch (error) {
    console.error('Error creating pivot table:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Advanced Features - Charts
 */

function createChart(spreadsheetId, sourceRange, chartConfig) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getActiveSheet();
    
    // Get source data
    const dataRange = sheet.getRange(sourceRange);
    
    // Create chart
    const chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType[chartConfig.type])
      .addRange(dataRange)
      .setPosition(chartConfig.row || 1, chartConfig.column || 1, 0, 0);
    
    if (chartConfig.title) {
      chartBuilder.setOption('title', chartConfig.title);
    }
    
    const chart = chartBuilder.build();
    sheet.insertChart(chart);
    
    return {
      success: true,
      message: `Created ${chartConfig.type} chart`
    };
  } catch (error) {
    console.error('Error creating chart:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Setup Functions
 */

function setupAPIKeys() {
  // This function helps users set up their API keys
  const ui = SpreadsheetApp.getUi();
  
  const anthropicKey = ui.prompt('Setup Sheets IDE', 'Enter your Anthropic API key:', ui.ButtonSet.OK_CANCEL);
  if (anthropicKey.getSelectedButton() === ui.Button.OK) {
    PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', anthropicKey.getResponseText());
    ui.alert('API key saved successfully!');
  }
}