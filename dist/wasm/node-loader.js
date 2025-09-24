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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeWasmLoader = void 0;
// Node.js WASM loader - Native WebAssembly loading for Node.js environment
var fs = require("fs");
var path = require("path");
var NodeWasmLoader = /** @class */ (function () {
    function NodeWasmLoader() {
    }
    /**
     * Load WASM module for Node.js environment
     */
    NodeWasmLoader.loadWasm = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Return cached instance if already loaded
                if (this.wasmInstance) {
                    return [2 /*return*/, this.wasmInstance];
                }
                // Return existing loading promise to avoid concurrent loads
                if (this.loadingPromise) {
                    return [2 /*return*/, this.loadingPromise];
                }
                this.loadingPromise = this._loadWasmInternal();
                return [2 /*return*/, this.loadingPromise];
            });
        });
    };
    NodeWasmLoader._loadWasmInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wasmPath, wasmBuffer, bindingsPath, imports, ESMWrapper, realBindings, error_1, wasmModule, wasmInstance, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        wasmPath = this._findWasmFile();
                        if (!wasmPath) {
                            throw new Error('WASM file not found');
                        }
                        console.log("Loading WASM from: ".concat(wasmPath));
                        wasmBuffer = fs.readFileSync(wasmPath);
                        bindingsPath = this._findBindingsFile();
                        imports = {};
                        if (!bindingsPath) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        console.log("\uD83D\uDD27 Loading real WASM bindings from: ".concat(bindingsPath));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./esm-wrapper'); })];
                    case 2:
                        ESMWrapper = (_a.sent()).ESMWrapper;
                        return [4 /*yield*/, ESMWrapper.loadWasmBindings(bindingsPath)];
                    case 3:
                        realBindings = _a.sent();
                        if (realBindings) {
                            console.log('🚀 SUCCESS: Real WASM bindings loaded!');
                            imports = ESMWrapper.createImportObject(realBindings);
                        }
                        else {
                            console.log('⚠️  Falling back to stub bindings');
                            imports = this.createFallbackImports();
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.warn('❌ Failed to load real WASM bindings, using fallbacks:', error_1.message);
                        imports = this.createFallbackImports();
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        console.log('📝 No bindings path found, using fallback imports');
                        imports = this.createFallbackImports();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, WebAssembly.compile(wasmBuffer)];
                    case 8:
                        wasmModule = _a.sent();
                        return [4 /*yield*/, WebAssembly.instantiate(wasmModule, imports)];
                    case 9:
                        wasmInstance = _a.sent();
                        result = {
                            instance: wasmInstance,
                            module: wasmModule,
                            exports: wasmInstance.exports
                        };
                        this.wasmInstance = result;
                        console.log('✅ WASM loaded successfully in Node.js');
                        return [2 /*return*/, result];
                    case 10:
                        error_2 = _a.sent();
                        console.error('❌ Failed to load WASM in Node.js:', error_2);
                        throw error_2;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find WASM file in possible locations
     */
    NodeWasmLoader._findWasmFile = function () {
        var possiblePaths = [
            // Relative to compiled JS
            path.join(__dirname, '../../pkg/fast_schema_bg.wasm'),
            path.join(__dirname, '../pkg/fast_schema_bg.wasm'),
            path.join(__dirname, './pkg/fast_schema_bg.wasm'),
            // Relative to source
            path.join(__dirname, '../../../pkg/fast_schema_bg.wasm'),
            // Common locations
            './pkg/fast_schema_bg.wasm',
            '../pkg/fast_schema_bg.wasm',
        ];
        for (var _i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
            var wasmPath = possiblePaths_1[_i];
            try {
                if (fs.existsSync(wasmPath)) {
                    console.log("Found WASM at: ".concat(wasmPath));
                    return wasmPath;
                }
            }
            catch (error) {
                continue;
            }
        }
        console.warn('WASM file not found in any of the expected locations:', possiblePaths);
        return null;
    };
    /**
     * Create fallback imports when real bindings can't be loaded
     */
    NodeWasmLoader.createFallbackImports = function () {
        return {
            './fast_schema_bg.js': {
                __wbg_set_wasm: function () { },
                __wbg_error_7534b8e9a36f1ab4: function (ptr, len) { return console.error('WASM Error (fallback)'); },
                __wbg_error_785f3cbbddee182e: function (ptr, len) { return console.error('WASM Error (fallback)'); },
                __wbg_log_7ff3e5f5d9bc8473: function (ptr, len) { return console.log('WASM Log (fallback)'); },
                __wbg_new_8a6f238a6ece86ea: function () { return ({}); },
                __wbg_stack_0ed75d68575b0f3c: function (ptr, len) { return ''; },
                __wbg_warn_3db133942ab6822e: function (ptr, len) { return console.warn('WASM Warning (fallback)'); },
                __wbg_wbindgenthrow_4c11a24fca429ccf: function (ptr, len) { throw new Error('WASM throw (fallback)'); },
                __wbindgen_cast_2241b6af4c4b2941: function (arg0, arg1) { return arg0; },
                __wbindgen_init_externref_table: function () { }
            },
            __wbindgen_placeholder__: {},
        };
    };
    /**
     * Find JavaScript bindings file
     */
    NodeWasmLoader._findBindingsFile = function () {
        var possiblePaths = [
            // Relative to compiled JS
            path.join(__dirname, '../../pkg/fast_schema_bg.js'),
            path.join(__dirname, '../pkg/fast_schema_bg.js'),
            path.join(__dirname, './pkg/fast_schema_bg.js'),
            // Relative to source
            path.join(__dirname, '../../../pkg/fast_schema_bg.js'),
            // Common locations
            './pkg/fast_schema_bg.js',
            '../pkg/fast_schema_bg.js',
        ];
        for (var _i = 0, possiblePaths_2 = possiblePaths; _i < possiblePaths_2.length; _i++) {
            var bindingsPath = possiblePaths_2[_i];
            try {
                if (fs.existsSync(bindingsPath)) {
                    console.log("Found WASM bindings at: ".concat(bindingsPath));
                    return bindingsPath;
                }
            }
            catch (error) {
                continue;
            }
        }
        console.warn('WASM bindings not found in any expected location');
        return null;
    };
    /**
     * Check if we're running in Node.js environment
     */
    NodeWasmLoader.isNodeEnvironment = function () {
        return typeof process !== 'undefined' &&
            process.versions != null &&
            process.versions.node != null;
    };
    /**
     * Check if WASM is supported in current environment
     */
    NodeWasmLoader.isWasmSupported = function () {
        try {
            return typeof WebAssembly !== 'undefined' &&
                typeof WebAssembly.instantiate === 'function';
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Get WASM instance (load if needed)
     */
    NodeWasmLoader.getInstance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isNodeEnvironment() || !this.isWasmSupported()) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.loadWasm()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to get WASM instance:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NodeWasmLoader.wasmInstance = null;
    NodeWasmLoader.loadingPromise = null;
    return NodeWasmLoader;
}());
exports.NodeWasmLoader = NodeWasmLoader;
