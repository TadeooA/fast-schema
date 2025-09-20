// ESM Wrapper for loading WASM bindings in Node.js
// Solves ES Module/CommonJS incompatibility issues

import * as path from 'path';

export interface WasmBindings {
  [key: string]: any;
  // Core WASM binding functions
  __wbg_set_wasm?: (wasm: any) => void;
  __wbg_log_7ff3e5f5d9bc8473?: (ptr: number, len: number) => void;
  __wbg_error_7534b8e9a36f1ab4?: (ptr: number, len: number) => void;
  __wbg_error_785f3cbbddee182e?: (ptr: number, len: number) => void;
  __wbg_new_8a6f238a6ece86ea?: () => any;
  __wbg_stack_0ed75d68575b0f3c?: (ptr: number, len: number) => string;
  __wbg_warn_3db133942ab6822e?: (ptr: number, len: number) => void;
  __wbg_wbindgenthrow_4c11a24fca429ccf?: (ptr: number, len: number) => void;
  __wbindgen_cast_2241b6af4c4b2941?: (arg0: any, arg1: any) => any;
  __wbindgen_init_externref_table?: () => void;
}

export class ESMWrapper {
  private static cache = new Map<string, WasmBindings>();
  private static loadingPromises = new Map<string, Promise<WasmBindings>>();

  /**
   * Load WASM bindings using dynamic import with proper error handling
   */
  static async loadWasmBindings(bindingsPath: string): Promise<WasmBindings | null> {
    try {
      // Check cache first
      if (this.cache.has(bindingsPath)) {
        console.log('📦 Using cached WASM bindings');
        return this.cache.get(bindingsPath)!;
      }

      // Check if already loading
      if (this.loadingPromises.has(bindingsPath)) {
        console.log('⏳ Waiting for existing WASM binding load');
        return await this.loadingPromises.get(bindingsPath)!;
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

    } catch (error) {
      console.error('❌ ESMWrapper failed to load WASM bindings:', error);
      this.loadingPromises.delete(bindingsPath);
      return null;
    }
  }

  private static async _loadBindingsInternal(bindingsPath: string): Promise<WasmBindings | null> {
    try {
      // Resolve absolute path
      const absolutePath = path.resolve(bindingsPath);
      console.log(`🔍 Loading WASM bindings from: ${absolutePath}`);

      // Convert to file:// URL for ES module import
      const { pathToFileURL } = await import('url');
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

      return module as WasmBindings;

    } catch (error) {
      console.error('💥 Internal binding load failed:', error);

      // Provide helpful error messages for common issues
      if (error.message.includes('ENOENT')) {
        console.error('📁 File not found. Check if the WASM package was built correctly.');
      } else if (error.message.includes('SyntaxError')) {
        console.error('📝 Syntax error in binding file. May need to rebuild WASM package.');
      } else if (error.message.includes('ERR_MODULE_NOT_FOUND')) {
        console.error('🔍 Module resolution failed. Check file path and permissions.');
      }

      return null;
    }
  }

  /**
   * Create import object for WASM instantiation with real bindings
   */
  static createImportObject(bindings: WasmBindings): any {
    console.log('🔧 Creating WASM import object with real bindings');

    return {
      './fast_schema_bg.js': {
        // Use real binding functions if available, fallback to stubs
        __wbg_set_wasm: bindings.__wbg_set_wasm || (() => {}),
        __wbg_log_7ff3e5f5d9bc8473: bindings.__wbg_log_7ff3e5f5d9bc8473 ||
          ((ptr: number, len: number) => console.log('WASM Log (fallback)')),
        __wbg_error_7534b8e9a36f1ab4: bindings.__wbg_error_7534b8e9a36f1ab4 ||
          ((ptr: number, len: number) => console.error('WASM Error (fallback)')),
        __wbg_error_785f3cbbddee182e: bindings.__wbg_error_785f3cbbddee182e ||
          ((ptr: number, len: number) => console.error('WASM Error (fallback)')),
        __wbg_new_8a6f238a6ece86ea: bindings.__wbg_new_8a6f238a6ece86ea || (() => ({})),
        __wbg_stack_0ed75d68575b0f3c: bindings.__wbg_stack_0ed75d68575b0f3c ||
          ((ptr: number, len: number) => ''),
        __wbg_warn_3db133942ab6822e: bindings.__wbg_warn_3db133942ab6822e ||
          ((ptr: number, len: number) => console.warn('WASM Warning (fallback)')),
        __wbg_wbindgenthrow_4c11a24fca429ccf: bindings.__wbg_wbindgenthrow_4c11a24fca429ccf ||
          ((ptr: number, len: number) => { throw new Error('WASM throw (fallback)'); }),
        __wbindgen_cast_2241b6af4c4b2941: bindings.__wbindgen_cast_2241b6af4c4b2941 ||
          ((arg0: any, arg1: any) => arg0),
        __wbindgen_init_externref_table: bindings.__wbindgen_init_externref_table || (() => {}),

        // Include any additional functions found in the bindings
        ...bindings
      },
      __wbindgen_placeholder__: {},
    };
  }

  /**
   * Check if we're in an environment that supports ES modules
   */
  static supportsESModules(): boolean {
    try {
      // Check Node.js version and ES module support
      const nodeVersion = process.versions.node;
      const majorVersion = parseInt(nodeVersion.split('.')[0]);

      // Node.js 14+ has stable ES module support
      return majorVersion >= 14;
    } catch {
      return false;
    }
  }

  /**
   * Get loading statistics
   */
  static getStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('🗑️  ESMWrapper cache cleared');
  }
}

// Export convenience function
export async function loadWasmBindings(bindingsPath: string): Promise<WasmBindings | null> {
  return ESMWrapper.loadWasmBindings(bindingsPath);
}

export default ESMWrapper;