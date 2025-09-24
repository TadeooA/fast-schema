"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.PromiseSchema = exports.AsyncRefinementSchema = exports.AsyncSchema = void 0;
// Async validation schemas
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var AsyncSchema = /** @class */ (function (_super) {
    __extends(AsyncSchema, _super);
    function AsyncSchema(asyncValidator, syncFallback) {
        var _this = _super.call(this, {
            type: 'async',
            hasSyncFallback: !!syncFallback
        }) || this;
        _this.asyncValidator = asyncValidator;
        _this.syncFallback = syncFallback;
        return _this;
    }
    AsyncSchema.prototype._validate = function (data) {
        // For sync validation, use fallback if available
        if (this.syncFallback) {
            return this.syncFallback._validate(data);
        }
        throw new types_1.ValidationError([{
                code: 'async_validation_required',
                path: [],
                message: 'This schema requires async validation. Use parseAsync() instead.'
            }]);
    };
    // Async validation methods
    AsyncSchema.prototype.parseAsync = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.asyncValidator(data)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof types_1.ValidationError) {
                            throw error_1;
                        }
                        throw new types_1.ValidationError([{
                                code: 'async_validation_failed',
                                path: [],
                                message: error_1 instanceof Error ? error_1.message : 'Async validation failed'
                            }]);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AsyncSchema.prototype.safeParseAsync = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.parseAsync(data)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, { success: true, data: result }];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof types_1.ValidationError) {
                            return [2 /*return*/, { success: false, error: error_2 }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: new types_1.ValidationError([{
                                        code: 'unknown_error',
                                        path: [],
                                        message: error_2 instanceof Error ? error_2.message : 'Unknown async error'
                                    }])
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AsyncSchema;
}(schema_1.Schema));
exports.AsyncSchema = AsyncSchema;
// Async refinement schema
var AsyncRefinementSchema = /** @class */ (function (_super) {
    __extends(AsyncRefinementSchema, _super);
    function AsyncRefinementSchema(innerSchema, asyncPredicate, message) {
        var _this = _super.call(this, {
            type: 'async_refinement',
            innerSchema: innerSchema.getSchema(),
            message: message
        }) || this;
        _this.innerSchema = innerSchema;
        _this.asyncPredicate = asyncPredicate;
        _this.message = message;
        return _this;
    }
    AsyncRefinementSchema.prototype._validate = function (data) {
        // Sync validation of inner schema only
        return this.innerSchema._validate(data);
    };
    AsyncRefinementSchema.prototype.parseAsync = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var validated, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validated = this.innerSchema._validate(data);
                        return [4 /*yield*/, this.asyncPredicate(validated)];
                    case 1:
                        isValid = _a.sent();
                        if (!isValid) {
                            throw new types_1.ValidationError([{
                                    code: 'async_refinement_failed',
                                    path: [],
                                    message: this.message
                                }]);
                        }
                        return [2 /*return*/, validated];
                }
            });
        });
    };
    AsyncRefinementSchema.prototype.safeParseAsync = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.parseAsync(data)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, { success: true, data: result }];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof types_1.ValidationError) {
                            return [2 /*return*/, { success: false, error: error_3 }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: new types_1.ValidationError([{
                                        code: 'unknown_error',
                                        path: [],
                                        message: error_3 instanceof Error ? error_3.message : 'Unknown async error'
                                    }])
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AsyncRefinementSchema;
}(schema_1.Schema));
exports.AsyncRefinementSchema = AsyncRefinementSchema;
// Promise schema for validating promises
var PromiseSchema = /** @class */ (function (_super) {
    __extends(PromiseSchema, _super);
    function PromiseSchema(valueSchema) {
        var _this = _super.call(this, {
            type: 'promise',
            valueSchema: valueSchema.getSchema()
        }) || this;
        _this.valueSchema = valueSchema;
        return _this;
    }
    PromiseSchema.prototype._validate = function (data) {
        if (!(data instanceof Promise)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected Promise',
                    received: typeof data,
                    expected: 'Promise'
                }]);
        }
        return data;
    };
    // Override parseAsync to handle Promise validation
    PromiseSchema.prototype.parseAsync = function (data) {
        var _this = this;
        // First validate that the data is a Promise
        var promise = this._validate(data);
        // Return the promise that will resolve to the validated value
        return promise.then(function (resolved) {
            var validated = _this.valueSchema._validate(resolved);
            return Promise.resolve(validated);
        });
    };
    PromiseSchema.prototype.safeParseAsync = function (data) {
        try {
            var result = this.parseAsync(data);
            return result.then(function (data) { return ({ success: true, data: data }); }).catch(function (error) { return ({
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown promise error'
                    }])
            }); });
        }
        catch (error) {
            return Promise.resolve({
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown promise error'
                    }])
            });
        }
    };
    return PromiseSchema;
}(schema_1.Schema));
exports.PromiseSchema = PromiseSchema;
