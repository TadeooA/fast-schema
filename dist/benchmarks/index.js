"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBenchmarkCLI = exports.compareSchemas = exports.measurePerformance = exports.RegressionTester = exports.BenchmarkSuites = exports.PerformanceBenchmark = void 0;
// Performance benchmarking suite for fast-schema
var index_1 = require("../index");
var PerformanceBenchmark = /** @class */ (function () {
    function PerformanceBenchmark(options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c;
        this.warmupIterations = 100;
        this.measureIterations = 1000;
        this.memoryMeasurement = false;
        this.warmupIterations = (_a = options.warmupIterations) !== null && _a !== void 0 ? _a : 100;
        this.measureIterations = (_b = options.measureIterations) !== null && _b !== void 0 ? _b : 1000;
        this.memoryMeasurement = (_c = options.memoryMeasurement) !== null && _c !== void 0 ? _c : false;
    }
    PerformanceBenchmark.prototype.benchmark = function (name, fn, iterations) {
        return __awaiter(this, void 0, void 0, function () {
            var testIterations, i, times, memoryBefore, memoryAfter, i, start, end, sortedTimes, averageTime, variance, standardDeviation;
            return __generator(this, function (_a) {
                testIterations = iterations !== null && iterations !== void 0 ? iterations : this.measureIterations;
                // Warmup phase
                for (i = 0; i < this.warmupIterations; i++) {
                    fn();
                }
                // Force garbage collection if available
                if (typeof global !== 'undefined' && global.gc) {
                    global.gc();
                }
                times = [];
                memoryBefore = 0;
                memoryAfter = 0;
                // Memory measurement setup
                if (this.memoryMeasurement && typeof process !== 'undefined') {
                    memoryBefore = process.memoryUsage().heapUsed;
                }
                // Measurement phase
                for (i = 0; i < testIterations; i++) {
                    start = performance.now();
                    fn();
                    end = performance.now();
                    times.push(end - start);
                }
                // Memory measurement
                if (this.memoryMeasurement && typeof process !== 'undefined') {
                    memoryAfter = process.memoryUsage().heapUsed;
                }
                sortedTimes = times.sort(function (a, b) { return a - b; });
                averageTime = times.reduce(function (sum, time) { return sum + time; }, 0) / times.length;
                variance = times.reduce(function (sum, time) { return sum + Math.pow(time - averageTime, 2); }, 0) / times.length;
                standardDeviation = Math.sqrt(variance);
                return [2 /*return*/, {
                        name: name,
                        averageTime: averageTime,
                        throughput: 1000 / averageTime, // operations per second
                        memoryUsage: this.memoryMeasurement ? memoryAfter - memoryBefore : undefined,
                        iterations: testIterations,
                        standardDeviation: standardDeviation,
                        percentiles: {
                            p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
                            p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
                            p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
                        }
                    }];
            });
        });
    };
    PerformanceBenchmark.prototype.benchmarkSchema = function (name, schema, testData, iterations) {
        return __awaiter(this, void 0, void 0, function () {
            var dataIndex;
            return __generator(this, function (_a) {
                dataIndex = 0;
                return [2 /*return*/, this.benchmark(name, function () {
                        schema.parse(testData[dataIndex % testData.length]);
                        dataIndex++;
                    }, iterations)];
            });
        });
    };
    PerformanceBenchmark.prototype.compare = function (schemas_1, testData_1) {
        return __awaiter(this, arguments, void 0, function (schemas, testData, options) {
            var results, _i, _a, _b, name_1, schema, result, baseline, improvements, _c, _d, result;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        results = [];
                        if (options.warmupRuns) {
                            this.warmupIterations = options.warmupRuns;
                        }
                        if (options.measureMemory) {
                            this.memoryMeasurement = options.measureMemory;
                        }
                        _i = 0, _a = Object.entries(schemas);
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], name_1 = _b[0], schema = _b[1];
                        return [4 /*yield*/, this.benchmarkSchema(name_1, schema, testData, options.iterations)];
                    case 2:
                        result = _e.sent();
                        results.push(result);
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        baseline = results[0];
                        improvements = {};
                        for (_c = 0, _d = results.slice(1); _c < _d.length; _c++) {
                            result = _d[_c];
                            improvements[result.name] = baseline.averageTime / result.averageTime;
                        }
                        return [2 /*return*/, {
                                name: 'Schema Comparison',
                                results: results,
                                comparison: {
                                    baseline: baseline.name,
                                    improvements: improvements
                                }
                            }];
                }
            });
        });
    };
    PerformanceBenchmark.formatResults = function (suite) {
        var output = "\n=== ".concat(suite.name, " ===\n\n");
        // Results table
        output += '| Schema | Avg Time (ms) | Throughput (ops/sec) | P95 (ms) | P99 (ms) | Memory (bytes) |\n';
        output += '|--------|---------------|---------------------|----------|----------|----------------|\n';
        for (var _i = 0, _a = suite.results; _i < _a.length; _i++) {
            var result = _a[_i];
            var memoryStr = result.memoryUsage ? result.memoryUsage.toLocaleString() : 'N/A';
            output += "| ".concat(result.name, " | ").concat(result.averageTime.toFixed(3), " | ").concat(Math.round(result.throughput).toLocaleString(), " | ").concat(result.percentiles.p95.toFixed(3), " | ").concat(result.percentiles.p99.toFixed(3), " | ").concat(memoryStr, " |\n");
        }
        // Comparison section
        if (suite.comparison) {
            output += "\n### Performance Improvements (vs ".concat(suite.comparison.baseline, ")\n\n");
            for (var _b = 0, _c = Object.entries(suite.comparison.improvements); _b < _c.length; _b++) {
                var _d = _c[_b], name_2 = _d[0], improvement = _d[1];
                var speedup = "".concat(improvement.toFixed(1), "x faster");
                var percentage = "(".concat(((improvement - 1) * 100).toFixed(1), "% improvement)");
                output += "- **".concat(name_2, "**: ").concat(speedup, " ").concat(percentage, "\n");
            }
        }
        return output;
    };
    return PerformanceBenchmark;
}());
exports.PerformanceBenchmark = PerformanceBenchmark;
// Predefined benchmark suites
var BenchmarkSuites = /** @class */ (function () {
    function BenchmarkSuites() {
    }
    BenchmarkSuites.runBasicTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark, schemas, testData;
            return __generator(this, function (_a) {
                benchmark = new PerformanceBenchmark();
                schemas = {
                    string: index_1.z.string(),
                    number: index_1.z.number(),
                    boolean: index_1.z.boolean(),
                    stringJIT: index_1.z.jit(index_1.z.string()),
                    numberJIT: index_1.z.jit(index_1.z.number()),
                    booleanJIT: index_1.z.jit(index_1.z.boolean())
                };
                testData = [
                    ['hello', 'world', 'test', 'validation', 'schema'],
                    [1, 2, 3, 42, 100],
                    [true, false, true, false, true]
                ];
                return [2 /*return*/, benchmark.compare(schemas, testData.flat(), { iterations: 5000 })];
            });
        });
    };
    BenchmarkSuites.runComplexObjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark, userSchema, schemas, testData;
            return __generator(this, function (_a) {
                benchmark = new PerformanceBenchmark({ memoryMeasurement: true });
                userSchema = index_1.z.object({
                    id: index_1.z.string().uuid(),
                    name: index_1.z.string().min(2).max(50),
                    email: index_1.z.string().email(),
                    age: index_1.z.number().min(0).max(120),
                    preferences: index_1.z.object({
                        theme: index_1.z.enum(['light', 'dark']),
                        notifications: index_1.z.boolean(),
                        language: index_1.z.string().min(2).max(5)
                    }),
                    tags: index_1.z.array(index_1.z.string()).max(10),
                    metadata: index_1.z.record(index_1.z.any()).optional()
                });
                schemas = {
                    regular: userSchema,
                    jit: index_1.z.jit(userSchema),
                    wasm: index_1.z.wasm.hybridize(userSchema)
                };
                testData = Array.from({ length: 100 }, function (_, i) { return ({
                    id: "550e8400-e29b-41d4-a716-44665544000".concat(i % 10),
                    name: "User ".concat(i),
                    email: "user".concat(i, "@example.com"),
                    age: 20 + (i % 50),
                    preferences: {
                        theme: i % 2 === 0 ? 'light' : 'dark',
                        notifications: i % 3 === 0,
                        language: 'en'
                    },
                    tags: ["tag".concat(i % 5), "category".concat(i % 3)],
                    metadata: { created: Date.now(), index: i }
                }); });
                return [2 /*return*/, benchmark.compare(schemas, testData, { iterations: 1000, measureMemory: true })];
            });
        });
    };
    BenchmarkSuites.runArrayValidation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark, itemSchema, schemas, largeArray, singleItem, testDataArray, results, _a, _b, _loop_1, _i, _c, _d, name_3, schema;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        benchmark = new PerformanceBenchmark();
                        itemSchema = index_1.z.object({
                            id: index_1.z.number(),
                            name: index_1.z.string(),
                            active: index_1.z.boolean()
                        });
                        schemas = {
                            individual: itemSchema,
                            batch: index_1.z.batch(itemSchema),
                            jitBatch: index_1.z.batch(index_1.z.jit(itemSchema)),
                            wasmBatch: index_1.z.batch(index_1.z.wasm.hybridize(itemSchema))
                        };
                        largeArray = Array.from({ length: 1000 }, function (_, i) { return ({
                            id: i,
                            name: "Item ".concat(i),
                            active: i % 2 === 0
                        }); });
                        singleItem = largeArray[0];
                        testDataArray = [singleItem];
                        results = [];
                        // Individual validation (validate single item repeatedly)
                        _b = (_a = results).push;
                        return [4 /*yield*/, benchmark.benchmarkSchema('individual', schemas.individual, testDataArray, 1000)];
                    case 1:
                        // Individual validation (validate single item repeatedly)
                        _b.apply(_a, [_e.sent()]);
                        _loop_1 = function (name_3, schema) {
                            var result;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        if (name_3 === 'individual')
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, benchmark.benchmark(name_3, function () {
                                                if ('validate' in schema) {
                                                    schema.validate(largeArray);
                                                }
                                                else {
                                                    schema.parse(largeArray);
                                                }
                                            }, 50 // Fewer iterations for array operations
                                            )];
                                    case 1:
                                        result = _f.sent();
                                        results.push(result);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _c = Object.entries(schemas);
                        _e.label = 2;
                    case 2:
                        if (!(_i < _c.length)) return [3 /*break*/, 5];
                        _d = _c[_i], name_3 = _d[0], schema = _d[1];
                        return [5 /*yield**/, _loop_1(name_3, schema)];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            name: 'Array Validation Comparison',
                            results: results,
                            comparison: {
                                baseline: 'individual',
                                improvements: {
                                    batch: results[0].averageTime / results[1].averageTime,
                                    jitBatch: results[0].averageTime / results[2].averageTime,
                                    wasmBatch: results[0].averageTime / results[3].averageTime
                                }
                            }
                        }];
                }
            });
        });
    };
    BenchmarkSuites.runStringFormats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var benchmark, schemas, testData;
            return __generator(this, function (_a) {
                benchmark = new PerformanceBenchmark();
                schemas = {
                    email: index_1.z.string().email(),
                    uuid: index_1.z.string().uuid(),
                    url: index_1.z.string().url(),
                    datetime: index_1.z.string().datetime(),
                    emailJIT: index_1.z.jit(index_1.z.string().email()),
                    uuidJIT: index_1.z.jit(index_1.z.string().uuid()),
                    urlJIT: index_1.z.jit(index_1.z.string().url()),
                    datetimeJIT: index_1.z.jit(index_1.z.string().datetime())
                };
                testData = [
                    'user@example.com',
                    'test@domain.org',
                    '550e8400-e29b-41d4-a716-446655440000',
                    'https://example.com/path',
                    '2023-10-15T14:30:00Z'
                ];
                return [2 /*return*/, benchmark.compare(schemas, testData, { iterations: 2000 })];
            });
        });
    };
    BenchmarkSuites.runRegressionSuite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var suites;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🏃 Running comprehensive benchmark suite...\n');
                        return [4 /*yield*/, Promise.all([
                                this.runBasicTypes(),
                                this.runComplexObjects(),
                                this.runArrayValidation(),
                                this.runStringFormats()
                            ])];
                    case 1:
                        suites = _a.sent();
                        return [2 /*return*/, suites];
                }
            });
        });
    };
    return BenchmarkSuites;
}());
exports.BenchmarkSuites = BenchmarkSuites;
// Regression testing utilities
var RegressionTester = /** @class */ (function () {
    function RegressionTester() {
        this.baselines = new Map();
    }
    RegressionTester.prototype.setBaseline = function (name, result) {
        this.baselines.set(name, result);
    };
    RegressionTester.prototype.checkRegression = function (name, current, threshold) {
        if (threshold === void 0) { threshold = 1.5; }
        var baseline = this.baselines.get(name);
        if (!baseline) {
            return {
                hasRegression: false,
                improvement: 1,
                message: "No baseline found for ".concat(name)
            };
        }
        var improvement = baseline.averageTime / current.averageTime;
        var hasRegression = improvement < (1 / threshold);
        var message;
        if (hasRegression) {
            message = "\u26A0\uFE0F Performance regression in ".concat(name, ": ").concat((current.averageTime / baseline.averageTime).toFixed(2), "x slower");
        }
        else if (improvement > 1.2) {
            message = "\uD83D\uDE80 Performance improvement in ".concat(name, ": ").concat(improvement.toFixed(2), "x faster");
        }
        else {
            message = "\u2705 ".concat(name, ": Performance stable (").concat(improvement.toFixed(2), "x)");
        }
        return {
            hasRegression: hasRegression,
            improvement: improvement,
            message: message
        };
    };
    RegressionTester.prototype.runRegressionCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var suites, _i, suites_1, suite, _a, _b, result, regression;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('🔍 Running performance regression tests...\n');
                        return [4 /*yield*/, BenchmarkSuites.runRegressionSuite()];
                    case 1:
                        suites = _c.sent();
                        for (_i = 0, suites_1 = suites; _i < suites_1.length; _i++) {
                            suite = suites_1[_i];
                            console.log("\n=== ".concat(suite.name, " ==="));
                            for (_a = 0, _b = suite.results; _a < _b.length; _a++) {
                                result = _b[_a];
                                regression = this.checkRegression(result.name, result);
                                console.log(regression.message);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return RegressionTester;
}());
exports.RegressionTester = RegressionTester;
// Export utilities for manual testing
var measurePerformance = function (name_4, fn_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([name_4, fn_1], args_1, true), void 0, function (name, fn, iterations) {
        var benchmark;
        if (iterations === void 0) { iterations = 1000; }
        return __generator(this, function (_a) {
            benchmark = new PerformanceBenchmark();
            return [2 /*return*/, benchmark.benchmark(name, fn, iterations)];
        });
    });
};
exports.measurePerformance = measurePerformance;
var compareSchemas = function (schemas, testData, options) { return __awaiter(void 0, void 0, void 0, function () {
    var benchmark;
    return __generator(this, function (_a) {
        benchmark = new PerformanceBenchmark({
            memoryMeasurement: options === null || options === void 0 ? void 0 : options.measureMemory
        });
        return [2 /*return*/, benchmark.compare(schemas, testData, options)];
    });
}); };
exports.compareSchemas = compareSchemas;
// CLI interface for running benchmarks
var runBenchmarkCLI = function () { return __awaiter(void 0, void 0, void 0, function () {
    var suites, _i, suites_2, suite, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔬 Fast-Schema Performance Benchmark Suite\n');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, BenchmarkSuites.runRegressionSuite()];
            case 2:
                suites = _a.sent();
                for (_i = 0, suites_2 = suites; _i < suites_2.length; _i++) {
                    suite = suites_2[_i];
                    console.log(PerformanceBenchmark.formatResults(suite));
                }
                console.log('\n✅ Benchmark suite completed successfully!');
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('❌ Benchmark suite failed:', error_1);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.runBenchmarkCLI = runBenchmarkCLI;
