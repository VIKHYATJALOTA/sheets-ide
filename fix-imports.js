#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'addon') {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace @roo-code/types imports with local imports
  const rooCodeTypesRegex = /import\s+{([^}]+)}\s+from\s+['"]@roo-code\/types['"]/g;
  if (rooCodeTypesRegex.test(content)) {
    // Calculate relative path to shared/types.ts
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src/shared/types.ts'));
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    
    content = content.replace(rooCodeTypesRegex, `import {$1} from "${importPath.replace(/\\/g, '/')}"`);
    modified = true;
  }
  
  // Replace @roo-code/telemetry imports (remove them for now)
  const telemetryRegex = /import\s+.*from\s+['"]@roo-code\/telemetry['"]\s*;?\s*\n?/g;
  if (telemetryRegex.test(content)) {
    content = content.replace(telemetryRegex, '');
    modified = true;
  }
  
  // Replace @roo-code/cloud imports (remove them for now)
  const cloudRegex = /import\s+.*from\s+['"]@roo-code\/cloud['"]\s*;?\s*\n?/g;
  if (cloudRegex.test(content)) {
    content = content.replace(cloudRegex, '');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Main execution
console.log('Fixing @roo-code imports...');

const tsFiles = findTsFiles('./src');
console.log(`Found ${tsFiles.length} TypeScript files`);

for (const file of tsFiles) {
  try {
    fixImports(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log('Import fixing complete!');