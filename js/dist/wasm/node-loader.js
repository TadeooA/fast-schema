"use strict";
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
exports.NodeWasmLoader = void 0;
// Node.js WASM loader - Native WebAssembly loading for Node.js environment
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class NodeWasmLoader {
    /**
     * Load WASM module for Node.js environment
     */
    static async loadWasm() {
        // Return cached instance if already loaded
        if (this.wasmInstance) {
            return this.wasmInstance;
        }
        // Return existing loading promise to avoid concurrent loads
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        this.loadingPromise = this._loadWasmInternal();
        return this.loadingPromise;
    }
    static async _loadWasmInternal() {
        try {
            // Find WASM file path
            const wasmPath = this._findWasmFile();
            if (!wasmPath) {
                throw new Error('WASM file not found');
            }
            console.log(`Loading WASM from: ${wasmPath}`);
            // Read WASM file as buffer
            const wasmBuffer = fs.readFileSync(wasmPath);
            // Load JavaScript bindings
            const bindingsPath = this._findBindingsFile();
            let imports = {};
            // Try to load real WASM bindings using ESM Wrapper
            if (bindingsPath) {
                try {
                    console.log(`🔧 Loading real WASM bindings from: ${bindingsPath}`);
                    // Import ESM Wrapper
                    const { ESMWrapper } = await Promise.resolve().then(() => __importStar(require('./esm-wrapper')));
                    // Load real WASM bindings
                    const realBindings = await ESMWrapper.loadWasmBindings(bindingsPath);
                    if (realBindings) {
                        console.log('🚀 SUCCESS: Real WASM bindings loaded!');
                        imports = ESMWrapper.createImportObject(realBindings);
                    }
                    else {
                        console.log('⚠️  Falling back to stub bindings');
                        imports = this.createFallbackImports();
                    }
                }
                catch (error) {
                    console.warn('❌ Failed to load real WASM bindings, using fallbacks:', error.message);
                    imports = this.createFallbackImports();
                }
            }
            else {
                console.log('📝 No bindings path found, using fallback imports');
                imports = this.createFallbackImports();
            }
            // Instantiate WASM module
            const wasmModule = await WebAssembly.compile(wasmBuffer);
            const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
            const result = {
                instance: wasmInstance,
                module: wasmModule,
                exports: wasmInstance.exports
            };
            this.wasmInstance = result;
            console.log('✅ WASM loaded successfully in Node.js');
            return result;
        }
        catch (error) {
            console.error('❌ Failed to load WASM in Node.js:', error);
            throw error;
        }
    }
    /**
     * Find WASM file in possible locations
     */
    static _findWasmFile() {
        const possiblePaths = [
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
        for (const wasmPath of possiblePaths) {
            try {
                if (fs.existsSync(wasmPath)) {
                    console.log(`Found WASM at: ${wasmPath}`);
                    return wasmPath;
                }
            }
            catch (error) {
                continue;
            }
        }
        console.warn('WASM file not found in any of the expected locations:', possiblePaths);
        return null;
    }
    /**
     * Create fallback imports when real bindings can't be loaded
     */
    static createFallbackImports() {
        return {
            './fast_schema_bg.js': {
                __wbg_set_wasm: () => { },
                __wbg_error_7534b8e9a36f1ab4: (ptr, len) => console.error('WASM Error (fallback)'),
                __wbg_error_785f3cbbddee182e: (ptr, len) => console.error('WASM Error (fallback)'),
                __wbg_log_7ff3e5f5d9bc8473: (ptr, len) => console.log('WASM Log (fallback)'),
                __wbg_new_8a6f238a6ece86ea: () => ({}),
                __wbg_stack_0ed75d68575b0f3c: (ptr, len) => '',
                __wbg_warn_3db133942ab6822e: (ptr, len) => console.warn('WASM Warning (fallback)'),
                __wbg_wbindgenthrow_4c11a24fca429ccf: (ptr, len) => { throw new Error('WASM throw (fallback)'); },
                __wbindgen_cast_2241b6af4c4b2941: (arg0, arg1) => arg0,
                __wbindgen_init_externref_table: () => { }
            },
            __wbindgen_placeholder__: {},
        };
    }
    /**
     * Find JavaScript bindings file
     */
    static _findBindingsFile() {
        const possiblePaths = [
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
        for (const bindingsPath of possiblePaths) {
            try {
                if (fs.existsSync(bindingsPath)) {
                    console.log(`Found WASM bindings at: ${bindingsPath}`);
                    return bindingsPath;
                }
            }
            catch (error) {
                continue;
            }
        }
        console.warn('WASM bindings not found in any expected location');
        return null;
    }
    /**
     * Check if we're running in Node.js environment
     */
    static isNodeEnvironment() {
        return typeof process !== 'undefined' &&
            process.versions != null &&
            process.versions.node != null;
    }
    /**
     * Check if WASM is supported in current environment
     */
    static isWasmSupported() {
        try {
            return typeof WebAssembly !== 'undefined' &&
                typeof WebAssembly.instantiate === 'function';
        }
        catch {
            return false;
        }
    }
    /**
     * Get WASM instance (load if needed)
     */
    static async getInstance() {
        try {
            if (!this.isNodeEnvironment() || !this.isWasmSupported()) {
                return null;
            }
            return await this.loadWasm();
        }
        catch (error) {
            console.error('Failed to get WASM instance:', error);
            return null;
        }
    }
}
exports.NodeWasmLoader = NodeWasmLoader;
NodeWasmLoader.wasmInstance = null;
NodeWasmLoader.loadingPromise = null;
//# sourceMappingURL=node-loader.js.map