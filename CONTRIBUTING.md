# Contributing to Fast-Schema

Thank you for your interest in contributing to Fast-Schema!

## How to Contribute

We welcome contributions of all kinds:
- Bug reports and fixes
- New features and enhancements
- Documentation improvements
- Performance optimizations
- Tests and benchmarks
- Ideas and suggestions

## Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/fast-schema.git
   cd fast-schema
   ```

3. **Install dependencies**
   ```bash
   npm install
   wasm-pack build --target bundler --out-dir js/pkg
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-awesome-feature
   ```

5. **Make your changes**
6. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run benchmark
   ```

7. **Commit your changes**
   ```bash
   git commit -m "feat: add your awesome feature"
   ```

8. **Push and create a Pull Request**

## Development Setup

### Prerequisites
- Node.js 16+
- Rust 1.70+
- wasm-pack

### Build Commands
```bash
# Build WASM module
wasm-pack build --target bundler --out-dir js/pkg

# Build TypeScript
npm run build:ts

# Run tests
npm test

# Run benchmarks
npm run benchmark

# Lint code
npm run lint
```

## Pull Request Guidelines

### Before submitting:
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Benchmarks show no performance regression
- [ ] Documentation is updated if needed
- [ ] Commit messages follow [Conventional Commits](https://conventionalcommits.org/)

### PR Title Format:
```
type(scope): description

Examples:
feat(async): add async validation support
fix(core): resolve memory leak in validation
docs(readme): update installation instructions
perf(wasm): optimize validation performance
```

### PR Description:
- Clear description of what the PR does
- Link to any related issues
- Include benchmark results for performance changes
- Add screenshots/GIFs for UI changes

## Testing

We use Jest for testing. Please include tests for new features:

```typescript
// Example test
import { z } from '../src';

describe('New Feature', () => {
  it('should work correctly', () => {
    const schema = z.string().newFeature();
    expect(schema.parse('test')).toBe('test');
  });
});
```

## Performance Guidelines

Fast-Schema is all about performance. When contributing:

1. **Run benchmarks** before and after your changes
2. **Include benchmark results** in your PR
3. **No performance regressions** without justification
4. **Optimize for common use cases** first

## Code Style

We use ESLint and Prettier:
- TypeScript for all new code
- Clean, readable code with good variable names
- JSDoc comments for public APIs
- Consistent error handling

## Priority Areas

We're especially looking for help with:

### High Priority
- [ ] Async validation implementation
- [ ] State management integrations (Redux, Zustand)
- [ ] React Hook Form resolver
- [ ] Performance optimizations
- [ ] Framework integrations

### Medium Priority
- [ ] Additional string formats
- [ ] Better error messages
- [ ] Documentation improvements
- [ ] Example applications
- [ ] TypeScript type improvements

### Ideas Welcome
- [ ] New validation methods
- [ ] Developer tools
- [ ] IDE extensions
- [ ] Community resources

## Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discord**: [Coming soon] For real-time chat
- **Twitter**: [@fast_schema](https://twitter.com/fast_schema) for updates

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Added to our README contributors section
- Mentioned in release notes
- Given credit in commit messages
- Invited to our contributor Discord

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/tadeoaragoon/fast-schema/discussions)
- Create an [Issue](https://github.com/tadeoaragoon/fast-schema/issues)
- Reach out on Twitter [@tadeoaragoon](https://twitter.com/tadeoaragoon)

**Thank you for helping make Fast-Schema better!**