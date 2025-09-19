# Security Policy

## Supported Versions

We actively maintain security updates for the following versions of Fast-Schema:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Fast-Schema, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security@fast-schema.dev**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Any potential impact assessment
- Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Investigation**: We will investigate and assess the vulnerability within 5 business days
- **Updates**: We will provide regular updates on our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days
- **Disclosure**: We will coordinate disclosure timing with you

### Security Best Practices

When using Fast-Schema:

1. **Input Validation**: Always validate untrusted input before processing
2. **Version Updates**: Keep Fast-Schema updated to the latest version
3. **Dependency Scanning**: Regularly audit your dependencies for vulnerabilities
4. **Error Handling**: Don't expose sensitive information in error messages

### Security Features

Fast-Schema includes several security-focused features:

- **Input Sanitization**: Built-in protection against malicious input
- **Type Safety**: TypeScript provides compile-time type checking
- **Memory Safety**: Rust's ownership system prevents many common vulnerabilities
- **No Eval**: No dynamic code execution or eval() usage
- **Minimal Dependencies**: Reduced attack surface through minimal dependencies

### Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported to security@fast-schema.dev
2. **Day 1-2**: Acknowledgment and initial assessment
3. **Day 3-7**: Investigation and impact analysis
4. **Day 8-30**: Fix development and testing
5. **Day 31**: Coordinated disclosure and patch release
6. **Day 31+**: Public disclosure after patch is available

### Security Hall of Fame

We recognize and thank security researchers who help make Fast-Schema more secure:

- [Your name could be here!]

## Contact

For any security-related questions or concerns:
- Email: security@fast-schema.dev
- For non-security issues: https://github.com/tadeoaragoon/fast-schema/issues

---

Thank you for helping keep Fast-Schema and our community safe!