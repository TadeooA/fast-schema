# Pull Request

## Description

<!-- Provide a clear and concise description of the changes -->

## Type of Change

<!-- Mark the relevant option with "x" -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code cleanup/refactoring
- [ ] Tests

## Related Issues

<!-- Link to related issues using "Fixes #123" or "Closes #123" -->

- Fixes #
- Related to #

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

### Test Plan
- [ ] Unit tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] WASM build succeeds (`wasm-pack build`)
- [ ] Benchmarks show no regression (`npm run benchmark`)

### Manual Testing
<!-- Describe any manual testing performed -->

## Performance Impact

<!-- If this change affects performance, provide benchmark results -->

### Before
```
<!-- Benchmark results before changes -->
```

### After
```
<!-- Benchmark results after changes -->
```

### Analysis
<!-- Explain performance impact -->

## API Changes

<!-- If this introduces API changes, document them -->

### Breaking Changes
<!-- List any breaking changes -->

### New APIs
<!-- List any new APIs introduced -->

### Deprecated APIs
<!-- List any APIs that are now deprecated -->

## Screenshots

<!-- If applicable, add screenshots to help explain your changes -->

## Checklist

### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added error handling where appropriate

### Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the WASM build locally
- [ ] I have run benchmarks and verified no performance regression

### Documentation
- [ ] I have made corresponding changes to the documentation
- [ ] I have updated the README if needed
- [ ] I have added JSDoc comments for new public APIs
- [ ] I have updated TypeScript types and definitions

### Compatibility
- [ ] My changes maintain backward compatibility
- [ ] I have tested with TypeScript strict mode
- [ ] I have verified Zod API compatibility (if applicable)
- [ ] I have tested in multiple environments (Node.js, browser)

## Deployment Notes

<!-- Any special instructions for deployment -->

## Additional Notes

<!-- Any additional information that would be helpful for reviewers -->

---

**Performance is our priority!** Please ensure your changes maintain or improve Fast-Schema's performance standards.