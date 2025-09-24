#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_vs_fastschema_1 = require("./zod-vs-fastschema");
async function main() {
    try {
        console.log('Starting Zod vs Fast-Schema benchmark...\n');
        const results = await (0, zod_vs_fastschema_1.runZodVsFastSchemaBenchmark)();
        console.log('\n✅ Benchmark completed successfully!');
        console.log(`📈 Generated ${results.length} performance comparisons`);
    }
    catch (error) {
        console.error('❌ Benchmark failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=run-zod-benchmark.js.map