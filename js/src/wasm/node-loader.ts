// Node.js WASM loader - Native WebAssembly loading for Node.js environment
import * as fs from 'fs';
import * as path from 'path';

export interface WasmInstance {
  instance: WebAssembly.Instance;
  module: WebAssembly.Module;
  exports: any;
}

export class NodeWasmLoader {
  private static wasmInstance: WasmInstance | null = null;
  private static loadingPromise: Promise<WasmInstance> | null = null;

  /**
   * Load WASM module for Node.js environment
   */
  static async loadWasm(): Promise<WasmInstance> {
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

  private static async _loadWasmInternal(): Promise<WasmInstance> {
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

      // For now, let's try without the JS bindings to test basic WASM loading
      // The WASM module might work with minimal imports
      if (bindingsPath) {
        console.log(`WASM bindings found at: ${bindingsPath}, but using minimal imports for now`);
      }

      // Create minimal imports object with required functions
      imports = {
        './fast_schema_bg.js': {
          __wbg_set_wasm: () => {},
          __wbg_error_7534b8e9a36f1ab4: (ptr: number, len: number) => console.error('WASM Error'),
          __wbg_error_785f3cbbddee182e: (ptr: number, len: number) => console.error('WASM Error'),
          __wbg_log_7ff3e5f5d9bc8473: (ptr: number, len: number) => console.log('WASM Log'),
          __wbg_new_8a6f238a6ece86ea: () => ({}),
          __wbg_stack_0ed75d68575b0f3c: (ptr: number, len: number) => '',
          __wbg_warn_3db133942ab6822e: (ptr: number, len: number) => console.warn('WASM Warning'),
          __wbg_wbindgenthrow_4c11a24fca429ccf: (ptr: number, len: number) => { throw new Error('WASM throw'); },
          __wbindgen_cast_2241b6af4c4b2941: (arg0: any, arg1: any) => arg0,
          __wbindgen_init_externref_table: () => {}
        },
        __wbindgen_placeholder__: {},
      };

      // Instantiate WASM module
      const wasmModule = await WebAssembly.compile(wasmBuffer);
      const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);

      const result: WasmInstance = {
        instance: wasmInstance,
        module: wasmModule,
        exports: wasmInstance.exports
      };

      this.wasmInstance = result;
      console.log('✅ WASM loaded successfully in Node.js');

      return result;

    } catch (error) {
      console.error('❌ Failed to load WASM in Node.js:', error);
      throw error;
    }
  }

  /**
   * Find WASM file in possible locations
   */
  private static _findWasmFile(): string | null {
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
      } catch (error) {
        continue;
      }
    }

    console.warn('WASM file not found in any of the expected locations:', possiblePaths);
    return null;
  }

  /**
   * Find JavaScript bindings file
   */
  private static _findBindingsFile(): string | null {
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
      } catch (error) {
        continue;
      }
    }

    console.warn('WASM bindings not found in any expected location');
    return null;
  }

  /**
   * Check if we're running in Node.js environment
   */
  static isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' &&
           process.versions != null &&
           process.versions.node != null;
  }

  /**
   * Check if WASM is supported in current environment
   */
  static isWasmSupported(): boolean {
    try {
      return typeof WebAssembly !== 'undefined' &&
             typeof WebAssembly.instantiate === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Get WASM instance (load if needed)
   */
  static async getInstance(): Promise<WasmInstance | null> {
    try {
      if (!this.isNodeEnvironment() || !this.isWasmSupported()) {
        return null;
      }

      return await this.loadWasm();
    } catch (error) {
      console.error('Failed to get WASM instance:', error);
      return null;
    }
  }
}