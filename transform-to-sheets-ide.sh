#!/bin/bash

echo "🚀 Starting Roo Code → Sheets IDE Transformation..."
echo "⚠️  Make sure you're on a branch (not main)!"
echo "Current branch: $(git branch --show-current)"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Transformation cancelled."
    exit 1
fi

echo "🧹 Phase 1: Removing VSCode-specific files..."

# Remove VSCode Extension Core
echo "  Removing VSCode extension core..."
rm -f src/extension.ts
rm -rf src/activate/

# Remove VSCode Integrations
echo "  Removing VSCode integrations..."
rm -rf src/integrations/editor/
rm -rf src/integrations/terminal/
rm -rf src/integrations/workspace/
rm -rf src/integrations/diagnostics/
rm -rf src/integrations/theme/

# Remove File System Services
echo "  Removing file system services..."
rm -rf src/services/code-index/
rm -rf src/services/tree-sitter/
rm -rf src/services/ripgrep/
rm -rf src/services/glob/

# Remove File System Tools
echo "  Removing file system tools..."
rm -f src/core/tools/readFileTool.ts
rm -f src/core/tools/writeToFileTool.ts
rm -f src/core/tools/listFilesTool.ts
rm -f src/core/tools/executeCommandTool.ts
rm -f src/core/tools/searchFilesTool.ts
rm -f src/core/tools/codebaseSearchTool.ts
rm -f src/core/tools/insertContentTool.ts
rm -f src/core/tools/searchAndReplaceTool.ts
rm -f src/core/tools/applyDiffTool.ts
rm -f src/core/tools/multiApplyDiffTool.ts

# Remove VSCode Apps
echo "  Removing VSCode-specific apps..."
rm -rf apps/vscode-e2e/
rm -rf apps/vscode-nightly/

# Remove VSCode Development Files
echo "  Removing VSCode development files..."
rm -rf .vscode/
rm -f scripts/install-vsix.js

echo "🏗️  Phase 2: Creating new directory structure..."

# Create Sheets-specific directories
mkdir -p src/sheets/api
mkdir -p src/sheets/tools
mkdir -p src/sheets/auth
mkdir -p src/sheets/context
mkdir -p addon

echo "📝 Phase 3: Renaming core files..."

# Rename main provider
if [ -f "src/core/webview/ClineProvider.ts" ]; then
    mv src/core/webview/ClineProvider.ts src/core/webview/SheetsProvider.ts
    echo "  Renamed ClineProvider.ts → SheetsProvider.ts"
fi

echo "🔄 Phase 4: Updating references..."

# Update imports and references (macOS/Linux compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    find src/ -name "*.ts" -exec sed -i '' 's/ClineProvider/SheetsProvider/g' {} \;
    find webview-ui/ -name "*.tsx" -exec sed -i '' 's/Roo Code/Sheets IDE/g' {} \;
    find webview-ui/ -name "*.ts" -exec sed -i '' 's/Roo Code/Sheets IDE/g' {} \;
else
    # Linux
    find src/ -name "*.ts" -exec sed -i 's/ClineProvider/SheetsProvider/g' {} \;
    find webview-ui/ -name "*.tsx" -exec sed -i 's/Roo Code/Sheets IDE/g' {} \;
    find webview-ui/ -name "*.ts" -exec sed -i 's/Roo Code/Sheets IDE/g' {} \;
fi

echo "✅ Transformation Complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Removed VSCode-specific files"
echo "  ✅ Created Sheets IDE directory structure"
echo "  ✅ Renamed ClineProvider → SheetsProvider"
echo "  ✅ Updated references in codebase"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review changes: git status"
echo "  2. Run configuration setup script"
echo "  3. Follow development setup guide"
echo ""
echo "⚠️  Remember: You're on branch '$(git branch --show-current)'"
echo "   Your main branch is safe and unchanged!"