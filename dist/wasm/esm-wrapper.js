"use strict";
// ESM Wrapper for loading WASM bindings in Node.js
// Solves ES Module/CommonJS incompatibility issues
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ESMWrapper = void 0;
exports.loadWasmBindings = loadWasmBindings;
var path = require("path");
var ESMWrapper = /** @class */ (function () {
    function ESMWrapper() {
    }
    /**
     * Load WASM bindings using dynamic import with proper error handling
     */
    ESMWrapper.loadWasmBindings = function (bindingsPath) {
        return __awaiter(this, void 0, void 0, function () {
            var loadPromise, bindings, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Check cache first
                        if (this.cache.has(bindingsPath)) {
                            console.log('📦 Using cached WASM bindings');
                            return [2 /*return*/, this.cache.get(bindingsPath)];
                        }
                        if (!this.loadingPromises.has(bindingsPath)) return [3 /*break*/, 2];
                        console.log('⏳ Waiting for existing WASM binding load');
                        return [4 /*yield*/, this.loadingPromises.get(bindingsPath)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        loadPromise = this._loadBindingsInternal(bindingsPath);
                        this.loadingPromises.set(bindingsPath, loadPromise);
                        return [4 /*yield*/, loadPromise];
                    case 3:
                        bindings = _a.sent();
                        // Cache successful result
                        if (bindings) {
                            this.cache.set(bindingsPath, bindings);
                            console.log('✅ WASM bindings loaded and cached successfully');
                        }
                        // Clean up loading promise
                        this.loadingPromises.delete(bindingsPath);
                        return [2 /*return*/, bindings];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ ESMWrapper failed to load WASM bindings:', error_1);
                        this.loadingPromises.delete(bindingsPath);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ESMWrapper._loadBindingsInternal = function (bindingsPath) {
        return __awaiter(this, void 0, void 0, function () {
            var absolutePath, pathToFileURL, fileUrl, dynamicImport, module_1, requiredFunctions, missingFunctions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        absolutePath = path.resolve(bindingsPath);
                        console.log("\uD83D\uDD0D Loading WASM bindings from: ".concat(absolutePath));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('url'); })];
                    case 1:
                        pathToFileURL = (_a.sent()).pathToFileURL;
                        fileUrl = pathToFileURL(absolutePath);
                        console.log("\uD83C\uDF10 Using file URL: ".concat(fileUrl.href));
                        dynamicImport = new Function('path', 'return import(path)');
                        return [4 /*yield*/, dynamicImport(fileUrl.href)];
                    case 2:
                        module_1 = _a.sent();
                        console.log("\uD83D\uDCCA WASM bindings loaded. Keys available:", Object.keys(module_1));
                        requiredFunctions = [
                            '__wbg_log_7ff3e5f5d9bc8473',
                            '__wbg_error_7534b8e9a36f1ab4',
                            '__wbindgen_init_externref_table'
                        ];
                        missingFunctions = requiredFunctions.filter(function (fn) { return !(fn in module_1); });
                        if (missingFunctions.length > 0) {
                            console.warn("\u26A0\uFE0F  Missing expected functions: ".concat(missingFunctions.join(', ')));
                        }
                        return [2 /*return*/, module_1];
                    case 3:
                        error_2 = _a.sent();
                        console.error('💥 Internal binding load failed:', error_2);
                        // Provide helpful error messages for common issues
                        if (error_2.message.includes('ENOENT')) {
                            console.error('📁 File not found. Check if the WASM package was built correctly.');
                        }
                        else if (error_2.message.includes('SyntaxError')) {
                            console.error('📝 Syntax error in binding file. May need to rebuild WASM package.');
                        }
                        else if (error_2.message.includes('ERR_MODULE_NOT_FOUND')) {
                            console.error('🔍 Module resolution failed. Check file path and permissions.');
                        }
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create import object for WASM instantiation with real bindings
     */
    ESMWrapper.createImportObject = function (bindings) {
        console.log('🔧 Creating WASM import object with real bindings');
        return {
            './fast_schema_bg.js': __assign({ 
                // Use real binding functions if available, fallback to stubs
                __wbg_set_wasm: bindings.__wbg_set_wasm || (function () { }), __wbg_log_7ff3e5f5d9bc8473: bindings.__wbg_log_7ff3e5f5d9bc8473 ||
                    (function (ptr, len) { return console.log('WASM Log (fallback)'); }), __wbg_error_7534b8e9a36f1ab4: bindings.__wbg_error_7534b8e9a36f1ab4 ||
                    (function (ptr, len) { return console.error('WASM Error (fallback)'); }), __wbg_error_785f3cbbddee182e: bindings.__wbg_error_785f3cbbddee182e ||
                    (function (ptr, len) { return console.error('WASM Error (fallback)'); }), __wbg_new_8a6f238a6ece86ea: bindings.__wbg_new_8a6f238a6ece86ea || (function () { return ({}); }), __wbg_stack_0ed75d68575b0f3c: bindings.__wbg_stack_0ed75d68575b0f3c ||
                    (function (ptr, len) { return ''; }), __wbg_warn_3db133942ab6822e: bindings.__wbg_warn_3db133942ab6822e ||
                    (function (ptr, len) { return console.warn('WASM Warning (fallback)'); }), __wbg_wbindgenthrow_4c11a24fca429ccf: bindings.__wbg_wbindgenthrow_4c11a24fca429ccf ||
                    (function (ptr, len) { throw new Error('WASM throw (fallback)'); }), __wbindgen_cast_2241b6af4c4b2941: bindings.__wbindgen_cast_2241b6af4c4b2941 ||
                    (function (arg0, arg1) { return arg0; }), __wbindgen_init_externref_table: bindings.__wbindgen_init_externref_table || (function () { }) }, bindings),
            __wbindgen_placeholder__: {},
        };
    };
    /**
     * Check if we're in an environment that supports ES modules
     */
    ESMWrapper.supportsESModules = function () {
        try {
            // Check Node.js version and ES module support
            var nodeVersion = process.versions.node;
            var majorVersion = parseInt(nodeVersion.split('.')[0]);
            // Node.js 14+ has stable ES module support
            return majorVersion >= 14;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Get loading statistics
     */
    ESMWrapper.getStats = function () {
        return {
            cached: this.cache.size,
            loading: this.loadingPromises.size
        };
    };
    /**
     * Clear cache (useful for testing)
     */
    ESMWrapper.clearCache = function () {
        this.cache.clear();
        this.loadingPromises.clear();
        console.log('🗑️  ESMWrapper cache cleared');
    };
    ESMWrapper.cache = new Map();
    ESMWrapper.loadingPromises = new Map();
    return ESMWrapper;
}());
exports.ESMWrapper = ESMWrapper;
// Export convenience function
function loadWasmBindings(bindingsPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ESMWrapper.loadWasmBindings(bindingsPath)];
        });
    });
}
exports.default = ESMWrapper;
