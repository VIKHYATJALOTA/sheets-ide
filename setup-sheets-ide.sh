#!/bin/bash

echo "🚀 Complete Sheets IDE Setup Process"
echo "===================================="
echo ""

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
    echo "⚠️  You're currently on the main branch!"
    echo "We'll create a safe working branch for you."
    echo ""
fi

echo "📋 Step 1: Creating safety branches..."

# Ensure we're on main and it's up to date
git checkout main
git pull origin main

# Create backup branch (keeps original Roo Code safe)
echo "  Creating backup branch: sheets-ide-backup"
git checkout -b sheets-ide-backup

# Create working branch for transformation
echo "  Creating working branch: sheets-ide-mvp"
git checkout -b sheets-ide-mvp

echo "  ✅ You're now safely on branch: $(git branch --show-current)"
echo ""

echo "📋 Step 2: Running repository transformation..."

# Make transformation script executable and run it
chmod +x transform-to-sheets-ide.sh
./transform-to-sheets-ide.sh

echo ""
echo "📋 Step 3: Setting up configuration files..."

# Replace package.json with Sheets IDE version
echo "  Updating package.json..."
cp package-sheets-ide.json package.json

# Create addon directory and copy files
echo "  Setting up Google Apps Script addon..."
mkdir -p addon
cp addon-appsscript.json addon/appsscript.json
cp addon-Code.gs addon/Code.gs
cp addon-sidebar.html addon/sidebar.html

# Clean up temporary files
rm package-sheets-ide.json
rm addon-appsscript.json
rm addon-Code.gs
rm addon-sidebar.html

echo "  ✅ Configuration files created"
echo ""

echo "📋 Step 4: Installing dependencies..."

# Install new dependencies
npm install

echo "  ✅ Dependencies installed"
echo ""

echo "📋 Step 5: Committing changes..."

# Add all changes
git add .

# Commit the transformation
git commit -m "🚀 Transform Roo Code to Sheets IDE MVP

✨ Features:
- Remove VSCode-specific files and integrations
- Create Google Sheets directory structure  
- Rename ClineProvider to SheetsProvider
- Add Apps Script configuration and basic sidebar
- Update package.json for Sheets IDE development

🏗️ Structure:
- src/sheets/ - Google Sheets specific code
- addon/ - Google Apps Script files
- Updated core orchestration for Sheets context

🎯 Next: Implement Google Sheets API integration and tools"

echo "  ✅ Changes committed to git"
echo ""

echo "🎉 TRANSFORMATION COMPLETE!"
echo "=========================="
echo ""
echo "📊 What was done:"
echo "  ✅ Created safe backup branch (sheets-ide-backup)"
echo "  ✅ Removed VSCode-specific files and integrations"
echo "  ✅ Created new Sheets IDE directory structure"
echo "  ✅ Renamed ClineProvider → SheetsProvider"
echo "  ✅ Updated package.json for Google Sheets development"
echo "  ✅ Created Google Apps Script addon with basic sidebar"
echo "  ✅ Installed updated dependencies"
echo "  ✅ Committed all changes to git"
echo ""
echo "📁 New directory structure:"
echo "  src/sheets/api/     - Google Sheets API wrapper"
echo "  src/sheets/tools/   - Sheets-specific tools"
echo "  src/sheets/auth/    - Authentication handling"
echo "  src/sheets/context/ - Sheets context builder"
echo "  addon/              - Google Apps Script files"
echo ""
echo "🚀 Next Steps:"
echo "  1. Set up Google Cloud Project and enable APIs"
echo "  2. Install Google Apps Script CLI: npm install -g @google/clasp"
echo "  3. Authenticate with Google: clasp login"
echo "  4. Create Apps Script project: cd addon && clasp create"
echo "  5. Start implementing Google Sheets tools"
echo ""
echo "📖 See DEVELOPMENT_SETUP.md for detailed next steps"
echo ""
echo "⚠️  Important: Your original code is safe in the 'main' branch"
echo "   Current working branch: $(git branch --show-current)"