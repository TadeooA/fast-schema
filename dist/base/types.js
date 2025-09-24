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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(issues) {
        var _this = this;
        var message = issues.map(function (issue) {
            return "".concat(issue.path.length > 0 ? issue.path.join('.') + ': ' : '').concat(issue.message);
        }).join('; ');
        _this = _super.call(this, message) || this;
        _this.name = 'ValidationError';
        _this.issues = issues;
        return _this;
    }
    ValidationError.prototype.format = function () {
        var formatted = {};
        for (var _i = 0, _a = this.issues; _i < _a.length; _i++) {
            var issue = _a[_i];
            var path = issue.path.join('.');
            if (path) {
                formatted[path] = issue.message;
            }
            else {
                formatted._errors = formatted._errors || [];
                formatted._errors.push(issue.message);
            }
        }
        return formatted;
    };
    ValidationError.prototype.flatten = function () {
        var fieldErrors = {};
        var formErrors = [];
        for (var _i = 0, _a = this.issues; _i < _a.length; _i++) {
            var issue = _a[_i];
            if (issue.path.length > 0) {
                var path = issue.path.join('.');
                fieldErrors[path] = fieldErrors[path] || [];
                fieldErrors[path].push(issue.message);
            }
            else {
                formErrors.push(issue.message);
            }
        }
        return { fieldErrors: fieldErrors, formErrors: formErrors };
    };
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
