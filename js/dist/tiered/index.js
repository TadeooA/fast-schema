"use strict";
// Tiered Performance API - Choose your speed level
// This provides multiple performance tiers for different use cases
Object.defineProperty(exports, "__esModule", { value: true });
exports.ultra = exports.fast_tier = exports.normal = exports.getRecommendation = exports.selectTier = exports.PerformanceTierSelector = exports.recommendations = void 0;
const api_1 = require("../api");
/**
 * Performance Tiers:
 *
 * 🐌 NORMAL (1x) - Zod-compatible, easy to use, good for prototyping
 * ⚡ FAST (10x) - Optimized but still familiar API, good for production
 * 🚀 ULTRA (100x) - Maximum performance, minimal overhead, good for high-throughput
 */
// Normal Performance Tier (1x baseline)
// Familiar Zod-like API with basic optimizations
const normal = {
    string: () => api_1.fast.string(),
    number: () => api_1.fast.number(),
    boolean: () => api_1.fast.boolean(),
    array: (schema) => api_1.fast.array(schema),
    object: (shape) => api_1.fast.object(shape),
    // Utility methods
    literal: (value) => api_1.fast.literal(value),
    any: () => api_1.fast.any(),
    union: (schemas) => api_1.fast.union(schemas),
    // Async support
    async: (validator) => api_1.fast.async(validator),
    // Metadata
    tier: 'normal',
    description: 'Familiar Zod-like API, good for prototyping and development',
    expectedSpeedup: '1x (baseline)',
    useCases: ['Prototyping', 'Simple applications', 'Learning'],
    overhead: 'Standard class-based validation with full error details'
};
exports.normal = normal;
// Fast Performance Tier (10x faster)
// Optimized validation with hybrid WASM support
const fast_tier = {
    string: () => api_1.fast.wasm.hybridize(api_1.fast.string()),
    number: () => api_1.fast.wasm.hybridize(api_1.fast.number()),
    boolean: () => api_1.fast.wasm.hybridize(api_1.fast.boolean()),
    array: (schema) => api_1.fast.wasm.hybridize(api_1.fast.array(schema)),
    object: (shape) => api_1.fast.wasm.hybridize(api_1.fast.object(shape)),
    // Batch processing
    batch: (schema) => api_1.fast.batch(schema),
    // JIT optimization
    jit: (schema) => api_1.fast.jit(schema),
    // Smart optimization
    smart: (schema) => api_1.fast.wasm.optimize(schema),
    // Utility methods with optimization
    literal: (value) => api_1.fast.wasm.hybridize(api_1.fast.literal(value)),
    any: () => api_1.fast.wasm.hybridize(api_1.fast.any()),
    // Metadata
    tier: 'fast',
    description: 'WASM-optimized validation with hybrid fallback, good for production',
    expectedSpeedup: '5-15x faster than normal',
    useCases: ['Production applications', 'APIs with moderate load', 'Real-time validation'],
    overhead: 'Minimal with WASM acceleration and smart caching'
};
exports.fast_tier = fast_tier;
// Ultra Performance Tier (100x+ faster)
// Maximum performance with pre-compiled validators
const ultra_tier = {
    string: () => api_1.fast.ultra.extreme.string(),
    number: () => api_1.fast.ultra.extreme.number(),
    boolean: () => api_1.fast.ultra.extreme.boolean(),
    array: (schema) => api_1.fast.ultra.extreme.array(schema),
    object: (shape) => api_1.fast.ultra.extreme.object(shape),
    // High-performance batch processing
    batch: (schema) => api_1.fast.ultra.extreme.batch(schema),
    // Pre-compilation for maximum speed
    precompile: (schema) => api_1.fast.ultra.optimize.precompile(schema),
    // Bulk operations
    bulk: (schema, data) => api_1.fast.ultra.optimize.bulkValidate(schema, data),
    // Memory-efficient processing
    stream: (schema, options) => ({
        validate: (items) => api_1.fast.ultra.optimize.bulkValidate(schema, items, {
            chunkSize: options?.chunkSize || 1000,
            parallel: true,
            errorStrategy: 'fail-fast'
        })
    }),
    // Metadata
    tier: 'ultra',
    description: 'Maximum performance with pre-compiled validators, good for high-throughput',
    expectedSpeedup: '50-400x faster than normal',
    useCases: ['High-traffic APIs', 'Real-time systems', 'Batch processing', 'Performance-critical applications'],
    overhead: 'Minimal overhead with compiled validators and memory pooling'
};
exports.ultra = ultra_tier;
// Performance recommendations based on use case
exports.recommendations = {
    // Development and prototyping
    development: normal,
    // Production with moderate load
    production: fast_tier,
    // High-performance production
    highPerformance: ultra_tier,
    // Specific use cases
    api: fast_tier,
    realTime: ultra_tier,
    batchProcessing: ultra_tier,
    microservices: fast_tier,
    serverless: fast_tier, // Fast startup, good performance
    mobile: fast_tier, // Balance of performance and bundle size
    // Based on data volume
    smallData: normal, // < 1000 validations/sec
    mediumData: fast_tier, // 1000-10000 validations/sec
    bigData: ultra_tier, // > 10000 validations/sec
};
// Auto-selection based on performance requirements
class PerformanceTierSelector {
    static selectTier(requirements) {
        const { validationsPerSecond, dataSize, environment, priority } = requirements;
        // Priority-based selection
        if (priority === 'ease-of-use')
            return normal;
        if (priority === 'maximum-performance')
            return ultra_tier;
        // Environment-based selection
        if (environment === 'development')
            return normal;
        if (environment === 'high-performance')
            return ultra_tier;
        // Performance-based selection
        if (validationsPerSecond) {
            if (validationsPerSecond > 10000)
                return ultra_tier;
            if (validationsPerSecond > 1000)
                return fast_tier;
            return normal;
        }
        // Data size-based selection
        if (dataSize === 'large')
            return ultra_tier;
        if (dataSize === 'medium')
            return fast_tier;
        if (dataSize === 'small')
            return normal;
        // Default balanced approach
        return fast_tier;
    }
    static getRecommendation(requirements) {
        const tier = PerformanceTierSelector.selectTier(requirements);
        return {
            tier,
            reasoning: PerformanceTierSelector.explainSelection(requirements, tier),
            alternatives: PerformanceTierSelector.getAlternatives(tier),
            migration: PerformanceTierSelector.getMigrationTips(tier)
        };
    }
    static explainSelection(requirements, selectedTier) {
        const reasons = [];
        if (requirements.priority === 'ease-of-use') {
            reasons.push('Prioritizing ease of use over performance');
        }
        else if (requirements.priority === 'maximum-performance') {
            reasons.push('Maximum performance requested');
        }
        if (requirements.environment === 'development') {
            reasons.push('Development environment - prioritizing developer experience');
        }
        else if (requirements.environment === 'high-performance') {
            reasons.push('High-performance environment detected');
        }
        if (requirements.validationsPerSecond) {
            if (requirements.validationsPerSecond > 10000) {
                reasons.push(`High throughput required (${requirements.validationsPerSecond.toLocaleString()} ops/sec)`);
            }
            else if (requirements.validationsPerSecond > 1000) {
                reasons.push(`Moderate throughput required (${requirements.validationsPerSecond.toLocaleString()} ops/sec)`);
            }
        }
        if (requirements.dataSize === 'large') {
            reasons.push('Large data size requires maximum performance');
        }
        return reasons.length > 0
            ? `Selected ${selectedTier.tier} tier: ${reasons.join(', ')}`
            : `Selected ${selectedTier.tier} tier as balanced default`;
    }
    static getAlternatives(selectedTier) {
        const alternatives = [];
        if (selectedTier !== normal) {
            alternatives.push({
                tier: normal,
                reason: 'Use for simpler development or when performance is not critical'
            });
        }
        if (selectedTier !== fast_tier) {
            alternatives.push({
                tier: fast_tier,
                reason: 'Balanced option with good performance and familiar API'
            });
        }
        if (selectedTier !== ultra_tier) {
            alternatives.push({
                tier: ultra_tier,
                reason: 'Maximum performance for high-throughput scenarios'
            });
        }
        return alternatives;
    }
    static getMigrationTips(tier) {
        const tips = [];
        if (tier === normal) {
            tips.push('Start here for learning and prototyping');
            tips.push('Easy migration to fast tier by changing import');
            tips.push('Compatible with Zod patterns');
        }
        else if (tier === fast_tier) {
            tips.push('Drop-in replacement for normal tier');
            tips.push('Automatic WASM acceleration when available');
            tips.push('Consider batch() for array processing');
        }
        else if (tier === ultra_tier) {
            tips.push('Use precompile() for frequently used schemas');
            tips.push('Use batch() and bulk() for large datasets');
            tips.push('Consider stream() for very large data processing');
            tips.push('Monitor memory usage with large datasets');
        }
        return tips;
    }
}
exports.PerformanceTierSelector = PerformanceTierSelector;
// Convenience functions for quick tier selection
exports.selectTier = PerformanceTierSelector.selectTier;
exports.getRecommendation = PerformanceTierSelector.getRecommendation;
// Default export with tier selection
exports.default = {
    normal,
    fast: fast_tier,
    ultra: ultra_tier,
    select: exports.selectTier,
    recommend: exports.getRecommendation,
    // Quick access to recommendations
    for: exports.recommendations
};
//# sourceMappingURL=index.js.map