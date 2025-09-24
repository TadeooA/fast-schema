export interface WasmInstance {
    instance: WebAssembly.Instance;
    module: WebAssembly.Module;
    exports: any;
}
export declare class NodeWasmLoader {
    private static wasmInstance;
    private static loadingPromise;
    /**
     * Load WASM module for Node.js environment
     */
    static loadWasm(): Promise<WasmInstance>;
    private static _loadWasmInternal;
    /**
     * Find WASM file in possible locations
     */
    private static _findWasmFile;
    /**
     * Find JavaScript bindings file
     */
    private static _findBindingsFile;
    /**
     * Check if we're running in Node.js environment
     */
    static isNodeEnvironment(): boolean;
    /**
     * Check if WASM is supported in current environment
     */
    static isWasmSupported(): boolean;
    /**
     * Get WASM instance (load if needed)
     */
    static getInstance(): Promise<WasmInstance | null>;
}
