<div align="center">
<sub>

<b>English</b> • [Català](locales/ca/README.md) • [Deutsch](locales/de/README.md) • [Español](locales/es/README.md) • [Français](locales/fr/README.md) • [हिंदी](locales/hi/README.md) • [Bahasa Indonesia](locales/id/README.md) • [Italiano](locales/it/README.md) • [日本語](locales/ja/README.md)

</sub>
<sub>

[한국어](locales/ko/README.md) • [Nederlands](locales/nl/README.md) • [Polski](locales/pl/README.md) • [Português (BR)](locales/pt-BR/README.md) • [Русский](locales/ru/README.md) • [Türkçe](locales/tr/README.md) • [Tiếng Việt](locales/vi/README.md) • [简体中文](locales/zh-CN/README.md) • [繁體中文](locales/zh-TW/README.md)

</sub>
</div>
<br>
<div align="center">
  <h1>Sheets IDE</h1>
  <p align="center">
  <img src="https://media.githubusercontent.com/media/VIKHYATJALOTA/sheets-ide/main/assets/demo.gif" width="100%" />
  </p>
  <p>AI-powered automation for Google Sheets. Transform your spreadsheets with conversational AI.</p>
  
  <a href="https://discord.gg/sheetsideapp" target="_blank"><img src="https://img.shields.io/badge/Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join Discord"></a>
  <a href="https://www.reddit.com/r/SheetsIDE/" target="_blank"><img src="https://img.shields.io/badge/Join%20Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white" alt="Join Reddit"></a>
  
</div>
<br>
<br>

<div align="center">

<a href="https://workspace.google.com/marketplace/app/sheets_ide" target="_blank"><img src="https://img.shields.io/badge/Install%20from%20Workspace%20Marketplace-blue?style=for-the-badge&logo=google&logoColor=white" alt="Install from Google Workspace Marketplace"></a>
<a href="https://github.com/VIKHYATJALOTA/sheets-ide/discussions/categories/feature-requests" target="_blank"><img src="https://img.shields.io/badge/Feature%20Requests-yellow?style=for-the-badge" alt="Feature Requests"></a>
<a href="https://docs.sheetsideapp.com" target="_blank"><img src="https://img.shields.io/badge/Documentation-6B46C1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation"></a>

</div>

**Sheets IDE** is an AI-powered **autonomous automation agent** for Google Sheets. It can:

- Communicate in natural language about your spreadsheet data
- Read and write ranges directly in your Google Sheets
- Create formulas and format cells automatically
- Generate charts and pivot tables
- Integrate with any OpenAI-compatible or custom API/model
- Adapt its capabilities through **Custom Modes** for different spreadsheet tasks

Whether you're seeking a flexible data analysis partner, a spreadsheet architect, or specialized roles like a financial analyst or data scientist, Sheets IDE can help you work with spreadsheets more efficiently.

Check out the [CHANGELOG](CHANGELOG.md) for detailed updates and fixes.

---

## 🎉 Sheets IDE MVP Released

Sheets IDE brings powerful AI automation to Google Sheets with conversational interface!

- **Natural Language Processing** - Describe what you want to do with your data in plain English
- **Smart Automation** - Automatically create formulas, format cells, and generate insights
- **Google Sheets Integration** - Native integration with Google Sheets API for seamless operation

---

## What Can Sheets IDE Do?

- 📊 **Analyze Data** from natural language descriptions
- 🔧 **Create Formulas** and automate calculations  
- 📝 **Format Sheets** and organize data
- 🤔 **Answer Questions** about your spreadsheet data
- 🔄 **Automate** repetitive spreadsheet tasks
- 📈 **Generate Charts** and pivot tables

## Quick Start

1. [Install Sheets IDE](https://workspace.google.com/marketplace/app/sheets_ide)
2. [Connect Your AI Provider](https://docs.sheetsideapp.com/getting-started/connecting-api-provider)
3. [Try Your First Automation](https://docs.sheetsideapp.com/getting-started/your-first-task)

## Key Features

### Multiple Modes

Sheets IDE adapts to your needs with specialized [modes](https://docs.sheetsideapp.com/basic-usage/using-modes):

- **Data Mode:** For general data analysis and manipulation
- **Finance Mode:** For financial modeling and analysis
- **Analytics Mode:** For statistical analysis and insights
- **Automation Mode:** For creating automated workflows
- **[Custom Modes](https://docs.sheetsideapp.com/advanced-usage/custom-modes):** Create unlimited specialized personas for accounting, reporting, data visualization, or any other spreadsheet task

### Smart Tools

Sheets IDE comes with powerful [tools](https://docs.sheetsideapp.com/basic-usage/how-tools-work) that can:

- Read and write ranges in your Google Sheets
- Create and modify formulas
- Format cells and apply conditional formatting
- Generate charts and pivot tables
- Use external data sources via [MCP (Model Context Protocol)](https://docs.sheetsideapp.com/advanced-usage/mcp)

MCP extends Sheets IDE's capabilities by allowing you to add unlimited custom tools. Integrate with external APIs, connect to databases, or create specialized data processing tools - MCP provides the framework to expand Sheets IDE's functionality to meet your specific needs.

### Customization

Make Sheets IDE work your way with:

- [Custom Instructions](https://docs.sheetsideapp.com/advanced-usage/custom-instructions) for personalized behavior
- [Custom Modes](https://docs.sheetsideapp.com/advanced-usage/custom-modes) for specialized tasks
- [Local Models](https://docs.sheetsideapp.com/advanced-usage/local-models) for offline use
- [Auto-Approval Settings](https://docs.sheetsideapp.com/advanced-usage/auto-approving-actions) for faster workflows

## Resources

### Documentation

- [Basic Usage Guide](https://docs.sheetsideapp.com/basic-usage/the-chat-interface)
- [Advanced Features](https://docs.sheetsideapp.com/advanced-usage/auto-approving-actions)
- [Frequently Asked Questions](https://docs.sheetsideapp.com/faq)

### Community

- **Discord:** [Join our Discord server](https://discord.gg/sheetsideapp) for real-time help and discussions
- **Reddit:** [Visit our subreddit](https://www.reddit.com/r/SheetsIDE) to share experiences and tips
- **GitHub:** Report [issues](https://github.com/VIKHYATJALOTA/sheets-ide/issues) or request [features](https://github.com/VIKHYATJALOTA/sheets-ide/discussions/categories/feature-requests)

---

## Local Setup & Development

1. **Clone** the repo:

```sh
git clone https://github.com/VIKHYATJALOTA/sheets-ide.git
```

2. **Install dependencies**:

```sh
pnpm install
```

3. **Set up Google Apps Script**:

```sh
# Install Google Apps Script CLI
npm install -g @google/clasp

# Authenticate with Google
clasp login

# Create Apps Script project
cd addon
clasp create --type standalone --title "Sheets IDE"
clasp push
```

4. **Run the development environment**:

There are several ways to develop Sheets IDE:

### Google Apps Script Development

For Google Apps Script backend development:

```sh
# Push changes to Apps Script
npm run clasp:push

# Open Apps Script editor
npm run clasp:open

# View Apps Script logs
npm run clasp:logs
```

### Frontend Development

For React frontend development:

```sh
# Start React development server
npm run dev
```

This will start the webview development server with hot reload for adapting components to Sheets context.

### Testing the Add-on

1. In Apps Script editor, click **Deploy** → **Test deployments**
2. Click **Install** to install in your Google account
3. Open any Google Sheets document
4. Look for **Sheets IDE** in the Add-ons menu or sidebar

---

We use [changesets](https://github.com/changesets/changesets) for versioning and publishing. Check our `CHANGELOG.md` for release notes.

---

## Disclaimer

**Please note** that Sheets IDE does **not** make any representations or warranties regarding any code, models, or other tools provided or made available in connection with Sheets IDE, any associated third-party tools, or any resulting outputs. You assume **all risks** associated with the use of any such tools or outputs; such tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis. Such risks may include, without limitation, intellectual property infringement, cyber vulnerabilities or attacks, bias, inaccuracies, errors, defects, viruses, downtime, property loss or damage, and/or personal injury. You are solely responsible for your use of any such tools or outputs (including, without limitation, the legality, appropriateness, and results thereof).

---

## License

[Apache 2.0 © 2025 Sheets IDE](./LICENSE)

---

**Enjoy Sheets IDE!** Whether you use it for simple data entry or complex financial modeling, we can't wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/SheetsIDE/) or [Discord](https://discord.gg/sheetsideapp). Happy spreadsheeting!
