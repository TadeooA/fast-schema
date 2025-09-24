#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// CLI for running fast-schema benchmarks
const index_1 = require("./index");
const args = process.argv.slice(2);
const command = args[0] || 'all';
async function runCLI() {
    switch (command) {
        case 'all':
        case 'suite':
            await (0, index_1.runBenchmarkCLI)();
            break;
        case 'basic':
            console.log('🔬 Running basic types benchmark...\n');
            const basicSuite = await index_1.BenchmarkSuites.runBasicTypes();
            console.log(index_1.PerformanceBenchmark.formatResults(basicSuite));
            break;
        case 'complex':
            console.log('🔬 Running complex objects benchmark...\n');
            const complexSuite = await index_1.BenchmarkSuites.runComplexObjects();
            console.log(index_1.PerformanceBenchmark.formatResults(complexSuite));
            break;
        case 'arrays':
            console.log('🔬 Running array validation benchmark...\n');
            const arraySuite = await index_1.BenchmarkSuites.runArrayValidation();
            console.log(index_1.PerformanceBenchmark.formatResults(arraySuite));
            break;
        case 'strings':
            console.log('🔬 Running string formats benchmark...\n');
            const stringsSuite = await index_1.BenchmarkSuites.runStringFormats();
            console.log(index_1.PerformanceBenchmark.formatResults(stringsSuite));
            break;
        case 'regression':
            console.log('🔍 Running regression tests...\n');
            const tester = new index_1.RegressionTester();
            await tester.runRegressionCheck();
            break;
        case 'help':
        case '--help':
        case '-h':
            console.log(`
Fast-Schema Benchmark CLI

Usage: npm run benchmark [command]

Commands:
  all        Run all benchmark suites (default)
  basic      Run basic types benchmark
  complex    Run complex objects benchmark
  arrays     Run array validation benchmark
  strings    Run string formats benchmark
  regression Run regression tests
  help       Show this help message

Examples:
  npm run benchmark
  npm run benchmark complex
  npm run benchmark regression
      `);
            break;
        default:
            console.error(`Unknown command: ${command}`);
            console.log('Run "npm run benchmark help" for available commands.');
            process.exit(1);
    }
}
// Run CLI
runCLI().catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map