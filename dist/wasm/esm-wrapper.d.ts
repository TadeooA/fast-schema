export interface WasmBindings {
    [key: string]: any;
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
export declare class ESMWrapper {
    private static cache;
    private static loadingPromises;
    /**
     * Load WASM bindings using dynamic import with proper error handling
     */
    static loadWasmBindings(bindingsPath: string): Promise<WasmBindings | null>;
    private static _loadBindingsInternal;
    /**
     * Create import object for WASM instantiation with real bindings
     */
    static createImportObject(bindings: WasmBindings): any;
    /**
     * Check if we're in an environment that supports ES modules
     */
    static supportsESModules(): boolean;
    /**
     * Get loading statistics
     */
    static getStats(): {
        cached: number;
        loading: number;
    };
    /**
     * Clear cache (useful for testing)
     */
    static clearCache(): void;
}
export declare function loadWasmBindings(bindingsPath: string): Promise<WasmBindings | null>;
export default ESMWrapper;
