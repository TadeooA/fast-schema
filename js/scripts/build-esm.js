const fs = require('fs');
const path = require('path');

// Read the CommonJS build from js/dist (already built)
const sourceDir = path.join(__dirname, '../dist');
const outputDir = path.join(__dirname, '../../dist');

function convertToESM(filePath, outputPath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Source file not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Convert CommonJS to ESM - this is a complex process, so we'll create a simple wrapper
  const esmWrapper = `
// ESM wrapper for ${path.basename(filePath)}
const cjsModule = await import('./${path.basename(filePath)}');

// Re-export everything from the CommonJS module
export * from './${path.basename(filePath)}';

// Handle default export if it exists
if (cjsModule.default) {
  export { cjsModule as default };
} else if (typeof cjsModule === 'function' || (typeof cjsModule === 'object' && cjsModule !== null)) {
  export default cjsModule;
}
`;

  // Create a true ESM version by converting CommonJS exports
  let esmContent = content;

  // Remove "use strict"
  esmContent = esmContent.replace(/["']use strict["'];?\r?\n?/g, '');

  // Convert CommonJS require() to import statements
  esmContent = esmContent.replace(/const\s+(.+?)\s*=\s*require\(["'](.+?)["']\);?\r?\n?/g, (match, varName, modulePath) => {
    // Handle destructuring imports
    if (varName.includes('{') && varName.includes('}')) {
      return `import ${varName} from "${modulePath}";\n`;
    }
    // Handle default imports
    return `import ${varName} from "${modulePath}";\n`;
  });

  // Convert Object.defineProperty exports to direct exports
  esmContent = esmContent.replace(/Object\.defineProperty\(exports,\s*["'](__esModule)["'],\s*\{\s*value:\s*true\s*\}\);?\r?\n?/g, '');

  // Convert named exports
  esmContent = esmContent.replace(/Object\.defineProperty\(exports,\s*["'](.+?)["'],\s*\{\s*enumerable:\s*true,\s*get:\s*function\s*\(\)\s*\{\s*return\s*(.+?);\s*\}\s*\}\);?\r?\n?/g,
    'export const $1 = $2;\n');

  // Convert direct exports assignment
  esmContent = esmContent.replace(/exports\.(\w+)\s*=\s*(.+?);?\r?\n?/g, 'export const $1 = $2;\n');

  // Convert module.exports
  esmContent = esmContent.replace(/module\.exports\s*=\s*(.+?);?\r?\n?/g, 'export default $1;\n');

  // Handle __exportStar calls
  esmContent = esmContent.replace(/__exportStar\(require\(["'](.+?)["']\),\s*exports\);?\r?\n?/g, 'export * from "$1";\n');

  // Remove remaining CommonJS boilerplate
  esmContent = esmContent.replace(/var __createBinding[^;]+;?\r?\n?/g, '');
  esmContent = esmContent.replace(/var __exportStar[^;]+;?\r?\n?/g, '');
  esmContent = esmContent.replace(/var _a;?\r?\n?/g, '');

  // Clean up extra newlines
  esmContent = esmContent.replace(/\n\n+/g, '\n\n');

  const simpleEsmWrapper = esmContent;

  // Ensure the output directory exists
  const outputDirPath = path.dirname(outputPath);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  fs.writeFileSync(outputPath, simpleEsmWrapper);
}

// Convert main index file
const indexPath = path.join(sourceDir, 'index.js');
if (fs.existsSync(indexPath)) {
  convertToESM(indexPath, path.join(outputDir, 'index.mjs'));
  console.log('Created index.mjs');
}

// Convert api file if it exists
const apiPath = path.join(sourceDir, 'api.js');
if (fs.existsSync(apiPath)) {
  convertToESM(apiPath, path.join(outputDir, 'api.esm.js'));
  console.log('Created api.esm.js');
}

console.log('ESM build completed');