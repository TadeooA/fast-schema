#!/usr/bin/env node

import { runAjvVsFastSchemaBenchmark } from './ajv-vs-fastschema';

async function main() {
  try {
    console.log('Starting AJV vs Fast-Schema benchmark...\n');
    const results = await runAjvVsFastSchemaBenchmark();

    console.log('\n✅ AJV benchmark completed successfully!');
    console.log(`📈 Generated ${results.length} performance comparisons against AJV`);

    // Summary statistics
    const improvements = results.map(r => r.improvement);
    const average = improvements.reduce((a, b) => a + b) / improvements.length;
    const fastest = Math.max(...improvements);
    const slowest = Math.min(...improvements);

    console.log(`\n📊 Summary vs AJV:`);
    console.log(`   Average: ${average >= 1 ? average.toFixed(1) + 'x faster' : (1/average).toFixed(1) + 'x slower'}`);
    console.log(`   Best: ${fastest.toFixed(1)}x ${fastest >= 1 ? 'faster' : 'slower'}`);
    console.log(`   Worst: ${slowest.toFixed(1)}x ${slowest >= 1 ? 'faster' : 'slower'}`);

  } catch (error) {
    console.error('❌ AJV benchmark failed:', error);
    process.exit(1);
  }
}

main();