# Sheets IDE Development Setup Guide

## 🎉 Congratulations! 

Your Roo Code repository has been successfully transformed into Sheets IDE. This guide will help you set up the development environment and start building.

## 📋 Prerequisites

- ✅ Node.js 20.19.2+ installed
- ✅ Google Account with Sheets access
- ✅ Git repository transformed (you've done this!)

## 🚀 Quick Start

### 1. Install Google Apps Script CLI

```bash
npm install -g @google/clasp
```

### 2. Authenticate with Google

```bash
clasp login
```

This will open a browser window for Google authentication. Make sure to use the same Google account you'll use for development.

### 3. Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: **"sheets-ide-mvp"**
3. Enable the following APIs:
   - **Google Sheets API**
   - **Google Drive API** 
   - **Apps Script API**

### 4. Create Apps Script Project

```bash
cd addon
clasp create --type standalone --title "Sheets IDE MVP"
```

### 5. Push Initial Code to Apps Script

```bash
clasp push
```

### 6. Open Apps Script Editor

```bash
clasp open
```

This opens the Apps Script editor in your browser where you can see your code.

## 🛠️ Development Workflow

### Frontend Development (React)

```bash
# Start React development server
npm run dev

# This runs the existing webview-ui with hot reload
# You'll adapt these components for Sheets context
```

### Backend Development (Apps Script)

```bash
# Push changes to Apps Script
npm run clasp:push

# Open Apps Script editor
npm run clasp:open

# View Apps Script logs
npm run clasp:logs

# Deploy as add-on
npm run clasp:deploy
```

### Testing the Add-on

1. In Apps Script editor, click **Deploy** → **Test deployments**
2. Click **Install** to install in your Google account
3. Open any Google Sheets document
4. Look for **Sheets IDE** in the Add-ons menu or sidebar

## 📁 Project Structure

```
sheets-ide/
├── src/
│   ├── core/                    # Core orchestration (adapted from Roo Code)
│   │   ├── task/               # Task management
│   │   ├── webview/            # SheetsProvider (renamed from ClineProvider)
│   │   ├── prompts/            # AI prompts (adapt for Sheets)
│   │   └── tools/              # Essential tools (keep these)
│   ├── sheets/                 # NEW: Google Sheets specific
│   │   ├── api/                # Sheets API wrapper
│   │   ├── tools/              # Sheets tools (readRange, writeRange, etc.)
│   │   ├── auth/               # OAuth handling
│   │   └── context/            # Sheets context builder
│   ├── api/                    # LLM providers (keep)
│   ├── services/mcp/           # MCP support (keep)
│   └── utils/                  # Utilities (keep)
├── addon/                      # Google Apps Script
│   ├── appsscript.json        # Apps Script manifest
│   ├── Code.gs                # Main Apps Script code
│   └── sidebar.html           # Sidebar HTML
├── webview-ui/                 # React frontend (adapt for Sheets)
└── docs/                       # Documentation
```

## 🔧 What's Already Done

### ✅ Repository Transformation
- Removed VSCode-specific files
- Created Sheets directory structure
- Renamed ClineProvider → SheetsProvider
- Updated package.json

### ✅ Basic Apps Script Setup
- **appsscript.json**: Add-on manifest with proper scopes
- **Code.gs**: Basic Sheets API functions (readRange, writeRange, etc.)
- **sidebar.html**: Basic chat interface

### ✅ Core Architecture Preserved
- Task orchestration system
- AI prompt engineering
- Tool execution pattern
- React frontend structure

## 🎯 Next Development Steps

### Phase 3: Google Sheets API Integration

1. **Create Sheets API Client** (`src/sheets/api/SheetsApiClient.ts`)
2. **Implement Authentication** (`src/sheets/auth/GoogleAuthManager.ts`)
3. **Test basic API calls** from Apps Script

### Phase 4: Core Tools Implementation

1. **readRangeTool.ts** - Replace readFileTool
2. **writeRangeTool.ts** - Replace writeToFileTool  
3. **createSheetTool.ts** - New tool for creating sheets
4. **listSheetsTool.ts** - Replace listFilesTool
5. **setFormulaTool.ts** - New tool for formulas
6. **formatCellsTool.ts** - New tool for formatting

### Phase 5: Context Builder

1. **SheetsContextBuilder.ts** - Build spreadsheet context
2. Adapt prompts for Sheets operations
3. Update context tracking for Sheets

## 🧪 Testing Your Setup

### Test 1: Apps Script Deployment

```bash
cd addon
clasp push
clasp open
```

In Apps Script editor:
1. Click **Run** on the `onHomepage` function
2. Should see no errors in execution log

### Test 2: Add-on Installation

1. Deploy as test add-on
2. Install in your Google account
3. Open Google Sheets
4. Look for Sheets IDE in add-ons

### Test 3: Basic Sidebar

1. Open Sheets IDE sidebar
2. Should see chat interface
3. Try typing a message (will show placeholder response)

## 🐛 Troubleshooting

### Common Issues

**"clasp: command not found"**
```bash
npm install -g @google/clasp
```

**"Apps Script API not enabled"**
- Go to Google Cloud Console
- Enable Apps Script API for your project

**"Permission denied"**
- Make sure you're authenticated: `clasp login`
- Check OAuth scopes in appsscript.json

**"Cannot read property of undefined"**
- Check Apps Script logs: `clasp logs`
- Verify function names match between Code.gs and sidebar.html

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Clasp CLI Documentation](https://github.com/google/clasp)
- [Google Workspace Add-ons](https://developers.google.com/workspace/add-ons)

## 🎯 Success Metrics

You'll know the setup is working when:

- ✅ Apps Script project deploys without errors
- ✅ Add-on appears in Google Sheets sidebar
- ✅ Chat interface loads and responds to messages
- ✅ Basic Sheets API functions work (test in Apps Script editor)

## 🚀 Ready to Code!

Your development environment is now set up. The foundation is solid:

- **Core Roo Code architecture** preserved and adapted
- **Google Apps Script** integration ready
- **Basic Sheets API functions** implemented
- **Chat interface** working

Start with implementing the first Sheets tool and work your way up to the full AI integration!

---

**Need help?** Check the troubleshooting section or review the Apps Script logs for any errors.