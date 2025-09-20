#!/usr/bin/env node

import { runZodVsFastSchemaBenchmark } from './zod-vs-fastschema';

async function main() {
  try {
    console.log('Starting Zod vs Fast-Schema benchmark...\n');
    const results = await runZodVsFastSchemaBenchmark();

    console.log('\n✅ Benchmark completed successfully!');
    console.log(`📈 Generated ${results.length} performance comparisons`);

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

main();