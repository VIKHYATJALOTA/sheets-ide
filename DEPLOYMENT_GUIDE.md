# Sheets IDE - Google Apps Script Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Create New Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Rename the project to "Sheets IDE"

### 2. Upload Files

#### Replace Code.gs
1. Delete the default `Code.gs` content
2. Copy the entire content from `addon/Code.gs` and paste it

#### Add HTML Sidebar
1. Click the "+" next to "Files"
2. Select "HTML"
3. Name it `sidebar`
4. Copy the entire content from `addon/sidebar.html` and paste it

#### Update Manifest
1. Click on `appsscript.json`
2. Replace the content with the content from `addon/appsscript.json`

### 3. API Key Configuration (Super User-Friendly!)

**🎉 No Developer Setup Required!** Users can now configure their API keys through a beautiful Settings interface.

**For Users:**
1. Open Sheets IDE in any Google Sheets document
2. Click the **⚙️ Settings** tab in the interface
3. Choose your AI provider (Anthropic Claude or OpenAI GPT)
4. Paste your API key in the input field
5. Click **Save API Key** - Done!

**For Developers (Optional Fallback):**
If you want to provide fallback keys, add them to Script Properties:
1. Go to "Project Settings" (gear icon) in Apps Script
2. Add to "Script Properties":
```
ANTHROPIC_API_KEY = your_fallback_key_here
OPENAI_API_KEY = your_fallback_key_here
```

**To get API keys:**
- **Anthropic**: Visit [Anthropic Console](https://console.anthropic.com/) → Create account → Generate API key
- **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/) → Create account → Generate API key

### 4. Enable Required APIs

1. In Apps Script editor, click "Services" (+ icon)
2. Add "Google Sheets API" if not already enabled
3. Save the project

### 5. Test the Deployment

1. Click "Deploy" → "Test deployments"
2. Select "Install add-on"
3. Open a Google Sheets document
4. Go to "Extensions" → "Sheets IDE"
5. The sidebar should appear with the beautiful interface

### 6. Deploy as Add-on (Optional)

For production deployment:

1. Click "Deploy" → "New deployment"
2. Choose type: "Add-on"
3. Fill in the deployment details
4. Click "Deploy"

## 🔧 Configuration Options

### AI Model Selection

The addon supports both Anthropic Claude and OpenAI GPT models. You can configure which to use by default in the `Code.gs` file:

```javascript
// Line ~15 in Code.gs
const DEFAULT_AI_PROVIDER = 'anthropic'; // or 'openai'
```

### Customizing the Interface

The sidebar interface can be customized by editing `sidebar.html`:

- **Colors**: Modify CSS variables in the `<style>` section
- **Welcome message**: Update the welcome content in the HTML
- **Example prompts**: Add/modify the example buttons

## 🛠️ Features Overview

### Core Spreadsheet Operations
- ✅ **Read Range**: Extract data from any range
- ✅ **Write Range**: Insert data into cells
- ✅ **Create Sheet**: Add new worksheets
- ✅ **Set Formula**: Insert formulas with validation
- ✅ **Format Cells**: Apply formatting (bold, colors, borders)

### Advanced Features
- ✅ **AI-Powered Automation**: Natural language commands
- ✅ **Context Awareness**: Understands current sheet structure
- ✅ **Error Handling**: Comprehensive error reporting
- ✅ **Action Results**: Visual feedback for all operations
- ✅ **Chat History**: Persistent conversation tracking
- ✅ **Task Management**: Recent tasks panel

### UI/UX Features
- ✅ **VSCode-Style Interface**: Professional dark theme
- ✅ **Real-time Communication**: Instant AI responses
- ✅ **Loading States**: Visual feedback during processing
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## 🎯 First-Time User Experience

When users first open Sheets IDE, they'll see:

1. **Welcome Interface** - Professional VSCode-style chat interface
2. **API Key Setup** - If no key is configured, users will see:
   - Clear instructions for getting API keys
   - Examples of how to set up their key
   - Direct links to Anthropic Console and OpenAI Platform

3. **API Key Setup Commands**:
```
Set my Anthropic API key: sk-ant-api03-your-key-here
Set my OpenAI API key: sk-your-key-here
```

## 🧪 Testing Commands

After API key setup, try these example commands:

### Basic Operations
```
Create a new sheet called "Sales Data"
Add headers: Date, Product, Quantity, Revenue to row 1
Make the first row bold and add borders
Insert sample sales data for 5 products
```

### Advanced Operations
```
Calculate total revenue in cell E10 using SUM formula
Create a pivot table from the sales data
Format revenue column as currency
Add conditional formatting to highlight top performers
```

### Data Analysis
```
Analyze the sales trends and create a summary
Find the best performing product
Create a chart showing monthly revenue
Generate a report of key insights
```

## 🔍 Troubleshooting

### Common Issues

1. **"google is not defined" error**
   - This only occurs when testing outside Google Apps Script
   - Deploy to Apps Script to resolve

2. **API key not working**
   - Verify keys are added to Script Properties
   - Check key format and permissions
   - Ensure billing is enabled for API providers

3. **Sidebar not appearing**
   - Check if add-on is properly installed
   - Refresh the Google Sheets page
   - Check browser console for errors

4. **Permissions error**
   - Grant necessary permissions when prompted
   - Check OAuth scopes in appsscript.json

### Debug Mode

Enable debug logging by setting:
```javascript
const DEBUG_MODE = true; // in Code.gs
```

## 📊 Performance Notes

- **Response Time**: Typically 2-5 seconds for AI processing
- **Rate Limits**: Respects API provider rate limits
- **Memory Usage**: Optimized for Google Apps Script constraints
- **Concurrent Users**: Supports multiple users per spreadsheet

## 🔐 Security Considerations

- API keys are stored securely in Script Properties
- All communications use HTTPS
- No sensitive data is logged or stored
- Follows Google Apps Script security best practices

## 📈 Next Steps

After successful deployment:

1. **Test thoroughly** with real spreadsheet data
2. **Gather user feedback** on interface and functionality
3. **Monitor API usage** and costs
4. **Consider publishing** to Google Workspace Marketplace
5. **Plan React migration** for enhanced features

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ Sidebar loads without errors
- ✅ AI responds to natural language commands
- ✅ Spreadsheet operations execute correctly
- ✅ Chat history and tasks are tracked
- ✅ Interface is responsive and professional

---

**🎉 Congratulations!** You now have a fully functional AI-powered Google Sheets automation tool that rivals the sophistication of VSCode extensions while providing powerful spreadsheet automation capabilities.