"use strict";
// ESM Wrapper for loading WASM bindings in Node.js
// Solves ES Module/CommonJS incompatibility issues
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESMWrapper = void 0;
exports.loadWasmBindings = loadWasmBindings;
const path = __importStar(require("path"));
class ESMWrapper {
    /**
     * Load WASM bindings using dynamic import with proper error handling
     */
    static async loadWasmBindings(bindingsPath) {
        try {
            // Check cache first
            if (this.cache.has(bindingsPath)) {
                console.log('📦 Using cached WASM bindings');
                return this.cache.get(bindingsPath);
            }
            // Check if already loading
            if (this.loadingPromises.has(bindingsPath)) {
                console.log('⏳ Waiting for existing WASM binding load');
                return await this.loadingPromises.get(bindingsPath);
            }
            // Start new loading process
            const loadPromise = this._loadBindingsInternal(bindingsPath);
            this.loadingPromises.set(bindingsPath, loadPromise);
            const bindings = await loadPromise;
            // Cache successful result
            if (bindings) {
                this.cache.set(bindingsPath, bindings);
                console.log('✅ WASM bindings loaded and cached successfully');
            }
            // Clean up loading promise
            this.loadingPromises.delete(bindingsPath);
            return bindings;
        }
        catch (error) {
            console.error('❌ ESMWrapper failed to load WASM bindings:', error);
            this.loadingPromises.delete(bindingsPath);
            return null;
        }
    }
    static async _loadBindingsInternal(bindingsPath) {
        try {
            // Resolve absolute path
            const absolutePath = path.resolve(bindingsPath);
            console.log(`🔍 Loading WASM bindings from: ${absolutePath}`);
            // Convert to file:// URL for ES module import
            const { pathToFileURL } = await Promise.resolve().then(() => __importStar(require('url')));
            const fileUrl = pathToFileURL(absolutePath);
            console.log(`🌐 Using file URL: ${fileUrl.href}`);
            // Use Function constructor to bypass TypeScript's static analysis
            // This prevents TS from trying to resolve the import at compile time
            const dynamicImport = new Function('path', 'return import(path)');
            // Load the ES module
            const module = await dynamicImport(fileUrl.href);
            console.log(`📊 WASM bindings loaded. Keys available:`, Object.keys(module));
            // Validate that we have the expected binding functions
            const requiredFunctions = [
                '__wbg_log_7ff3e5f5d9bc8473',
                '__wbg_error_7534b8e9a36f1ab4',
                '__wbindgen_init_externref_table'
            ];
            const missingFunctions = requiredFunctions.filter(fn => !(fn in module));
            if (missingFunctions.length > 0) {
                console.warn(`⚠️  Missing expected functions: ${missingFunctions.join(', ')}`);
            }
            return module;
        }
        catch (error) {
            console.error('💥 Internal binding load failed:', error);
            // Provide helpful error messages for common issues
            if (error instanceof Error) {
                if (error.message.includes('ENOENT')) {
                    console.error('📁 File not found. Check if the WASM package was built correctly.');
                }
                else if (error.message.includes('SyntaxError')) {
                    console.error('📝 Syntax error in binding file. May need to rebuild WASM package.');
                }
                else if (error.message.includes('ERR_MODULE_NOT_FOUND')) {
                    console.error('🔍 Module resolution failed. Check file path and permissions.');
                }
            }
            return null;
        }
    }
    /**
     * Create import object for WASM instantiation with real bindings
     */
    static createImportObject(bindings) {
        console.log('🔧 Creating WASM import object with real bindings');
        return {
            './fast_schema_bg.js': {
                // Use real binding functions if available, fallback to stubs
                __wbg_set_wasm: bindings.__wbg_set_wasm || (() => { }),
                __wbg_log_7ff3e5f5d9bc8473: bindings.__wbg_log_7ff3e5f5d9bc8473 ||
                    ((_ptr, _len) => console.log('WASM Log (fallback)')),
                __wbg_error_7534b8e9a36f1ab4: bindings.__wbg_error_7534b8e9a36f1ab4 ||
                    ((_ptr, _len) => console.error('WASM Error (fallback)')),
                __wbg_error_785f3cbbddee182e: bindings.__wbg_error_785f3cbbddee182e ||
                    ((_ptr, _len) => console.error('WASM Error (fallback)')),
                __wbg_new_8a6f238a6ece86ea: bindings.__wbg_new_8a6f238a6ece86ea || (() => ({})),
                __wbg_stack_0ed75d68575b0f3c: bindings.__wbg_stack_0ed75d68575b0f3c ||
                    ((_ptr, _len) => ''),
                __wbg_warn_3db133942ab6822e: bindings.__wbg_warn_3db133942ab6822e ||
                    ((_ptr, _len) => console.warn('WASM Warning (fallback)')),
                __wbg_wbindgenthrow_4c11a24fca429ccf: bindings.__wbg_wbindgenthrow_4c11a24fca429ccf ||
                    ((_ptr, _len) => { throw new Error('WASM throw (fallback)'); }),
                __wbindgen_cast_2241b6af4c4b2941: bindings.__wbindgen_cast_2241b6af4c4b2941 ||
                    ((arg0, _arg1) => arg0),
                __wbindgen_init_externref_table: bindings.__wbindgen_init_externref_table || (() => { }),
                // Include any additional functions found in the bindings
                ...bindings
            },
            __wbindgen_placeholder__: {},
        };
    }
    /**
     * Check if we're in an environment that supports ES modules
     */
    static supportsESModules() {
        try {
            // Check Node.js version and ES module support
            const nodeVersion = process.versions.node;
            const majorVersion = parseInt(nodeVersion.split('.')[0]);
            // Node.js 14+ has stable ES module support
            return majorVersion >= 14;
        }
        catch {
            return false;
        }
    }
    /**
     * Get loading statistics
     */
    static getStats() {
        return {
            cached: this.cache.size,
            loading: this.loadingPromises.size
        };
    }
    /**
     * Clear cache (useful for testing)
     */
    static clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
        console.log('🗑️  ESMWrapper cache cleared');
    }
}
exports.ESMWrapper = ESMWrapper;
ESMWrapper.cache = new Map();
ESMWrapper.loadingPromises = new Map();
// Export convenience function
async function loadWasmBindings(bindingsPath) {
    return ESMWrapper.loadWasmBindings(bindingsPath);
}
exports.default = ESMWrapper;
//# sourceMappingURL=esm-wrapper.js.map