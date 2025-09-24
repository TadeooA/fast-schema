"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(issues) {
        const message = issues.map(issue => `${issue.path.length > 0 ? issue.path.join('.') + ': ' : ''}${issue.message}`).join('; ');
        super(message);
        this.name = 'ValidationError';
        this.issues = issues;
    }
    format() {
        const formatted = {};
        for (const issue of this.issues) {
            const path = issue.path.join('.');
            if (path) {
                formatted[path] = issue.message;
            }
            else {
                formatted._errors = formatted._errors || [];
                formatted._errors.push(issue.message);
            }
        }
        return formatted;
    }
    flatten() {
        const fieldErrors = {};
        const formErrors = [];
        for (const issue of this.issues) {
            if (issue.path.length > 0) {
                const path = issue.path.join('.');
                fieldErrors[path] = fieldErrors[path] || [];
                fieldErrors[path].push(issue.message);
            }
            else {
                formErrors.push(issue.message);
            }
        }
        return { fieldErrors, formErrors };
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=types.js.map