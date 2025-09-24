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

  // For now, create a simpler solution - copy the CommonJS file and add .mjs extension info
  // This is a temporary solution until we can properly convert the entire build pipeline
  const simpleEsmWrapper = `
// ESM compatibility wrapper
import createRequire from 'module';
const require = createRequire(import.meta.url);

// Import the CommonJS version
const cjsModule = require('./${path.basename(filePath)}');

// Re-export everything
export const {
  fast, ValidationError, Schema, normal, fastTier, ultra, select, recommend, recommendations,
  StringSchema, NumberSchema, BooleanSchema, NullSchema, UndefinedSchema, AnySchema,
  UnknownSchema, NeverSchema, ArraySchema, ObjectSchema, UnionSchema, LiteralSchema,
  EnumSchema, OptionalSchema, NullableSchema, DefaultSchema, RefinementSchema,
  TransformSchema, IntersectionSchema, ConditionalSchema, AsyncSchema, AsyncRefinementSchema,
  PromiseSchema, AdvancedStringSchema, StringFormats, RegexCache, SchemaCache, ValidationPool,
  JITSchema, BatchValidator, StreamingValidator, DeepPartialSchema, RequiredSchema,
  ReadonlySchema, NonNullableSchema, KeyofSchema, SchemaMerger, DiscriminatedUnionSchema,
  FastSchemaWasm, ZodError, z
} = cjsModule;

export default cjsModule;
`;

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