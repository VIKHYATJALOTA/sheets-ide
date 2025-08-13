# Sheets IDE

**AI-powered automation for Google Sheets**

Transform your spreadsheets with conversational AI through a modern React frontend and powerful TypeScript backend.

---

## 🚀 Architecture

**Sheets IDE** is a full-stack application that brings AI-powered automation to Google Sheets:

- **Frontend**: React app deployed as Google Workspace Add-on
- **Backend**: Express.js server with Google Sheets API integration
- **AI Integration**: Multi-provider support (Anthropic, OpenAI, Gemini)
- **Deployment**: Vercel monorepo with automatic frontend/backend detection

## ✨ Features

- 🤖 **Conversational AI** - Chat with your spreadsheets in natural language
- 📊 **Smart Automation** - Automatically create formulas, format cells, and analyze data
- 🔧 **Google Sheets Integration** - Native API integration for seamless operation
- 🎯 **Multi-AI Support** - Works with Anthropic Claude, OpenAI GPT, and Google Gemini
- ⚡ **Real-time Streaming** - Live AI responses with streaming support
- 🔒 **Secure OAuth** - Google Workspace authentication and authorization

## 🏗️ Project Structure

```
sheets_ide/
├── server-final.ts          # Express.js backend server
├── package.json             # Backend dependencies
├── frontend/                # React frontend (coming soon)
│   ├── src/
│   ├── package.json
│   └── build/
├── vercel.json              # Deployment configuration
└── README.md
```

## 🛠️ Current Status

### ✅ Completed
- **Backend Architecture**: Express.js server with TypeScript
- **Google Sheets API**: Integration ready
- **AI Integration**: Anthropic Claude with streaming responses
- **Clean Codebase**: Minimal structure with only essential files
- **Build System**: TypeScript compilation working perfectly
- **Deployment Ready**: Vercel configuration included

### 🚧 In Progress
- **Frontend Development**: React app for Google Workspace Add-on
- **Database Integration**: PostgreSQL/MongoDB for chat history
- **OAuth Implementation**: Google Workspace authentication

## 🔧 Technical Details

### Backend Architecture

- **Express.js** server with TypeScript
- **Google Sheets API v4** integration
- **Anthropic SDK** for AI responses
- **Streaming responses** for real-time chat
- **CORS enabled** for frontend integration

### API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - AI chat with streaming responses
- `GET /api/spreadsheet/:id` - Get spreadsheet metadata
- `GET /api/features` - Get available features

## 🚀 Deployment

### Vercel Monorepo

The included `vercel.json` handles:
- Backend deployment (`server-final.ts`)
- Frontend deployment (`frontend/`)
- API routing (`/api/*` → backend, `/*` → frontend)

### Environment Variables

```bash
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📝 Development

### Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```

### API Usage

```javascript
// Chat with AI
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Analyze the data in Sheet1",
    spreadsheetId: "your-sheet-id"
  })
});

// Get spreadsheet info
const sheet = await fetch('/api/spreadsheet/your-sheet-id');
```

## 📄 License

MIT License

---

**MVP in development** - Full installation guide coming after MVP completion.
