"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionSchema = void 0;
// Intersection schema for combining multiple schemas
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class IntersectionSchema extends schema_1.Schema {
    constructor(schemaA, schemaB) {
        super({
            type: 'intersection',
            schemas: [schemaA.getSchema(), schemaB.getSchema()]
        });
        this.schemaA = schemaA;
        this.schemaB = schemaB;
    }
    _validate(data) {
        // Validate against both schemas
        const resultA = this.schemaA._validate(data);
        const resultB = this.schemaB._validate(data);
        // For objects, merge the results
        if (typeof resultA === 'object' && typeof resultB === 'object' &&
            resultA !== null && resultB !== null &&
            !Array.isArray(resultA) && !Array.isArray(resultB)) {
            return { ...resultA, ...resultB };
        }
        // For primitives, both must be the same value
        if (resultA === resultB) {
            return resultA;
        }
        throw new types_1.ValidationError([{
                code: 'invalid_intersection',
                path: [],
                message: 'Values do not match for intersection type'
            }]);
    }
    // Helper method to access schemas
    left() {
        return this.schemaA;
    }
    right() {
        return this.schemaB;
    }
}
exports.IntersectionSchema = IntersectionSchema;
//# sourceMappingURL=intersection.js.map