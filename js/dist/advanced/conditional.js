"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalSchema = void 0;
exports.conditional = conditional;
// Conditional schema for context-dependent validation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class ConditionalSchema extends schema_1.Schema {
    constructor(condition, trueSchema, falseSchema) {
        super({
            type: 'conditional',
            condition: condition.toString(),
            trueSchema: trueSchema.getSchema(),
            falseSchema: falseSchema.getSchema()
        });
        this.condition = condition;
        this.trueSchema = trueSchema;
        this.falseSchema = falseSchema;
    }
    _validate(data) {
        try {
            if (this.condition(data)) {
                return this.trueSchema._validate(data);
            }
            else {
                return this.falseSchema._validate(data);
            }
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                // Re-throw with conditional context
                const issues = error.issues.map(issue => ({
                    ...issue,
                    message: `Conditional validation failed: ${issue.message}`
                }));
                throw new types_1.ValidationError(issues);
            }
            throw error;
        }
    }
    // Helper methods
    getCondition() {
        return this.condition;
    }
    getTrueSchema() {
        return this.trueSchema;
    }
    getFalseSchema() {
        return this.falseSchema;
    }
}
exports.ConditionalSchema = ConditionalSchema;
// Utility function to create conditional schemas
function conditional(condition, trueSchema, falseSchema) {
    return new ConditionalSchema(condition, trueSchema, falseSchema);
}
//# sourceMappingURL=conditional.js.map