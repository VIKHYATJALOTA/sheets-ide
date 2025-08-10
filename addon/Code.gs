/**
 * Sheets IDE - Google Apps Script Backend
 * This file contains the main Apps Script functions for the Sheets IDE add-on
 */

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