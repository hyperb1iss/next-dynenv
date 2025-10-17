# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Fork Notice:** This is the changelog for the Next.js 15 compatible fork maintained at
> [@hyperb1iss/next-runtime-env](https://github.com/hyperb1iss/next-runtime-env). For the original project history
> (versions 3.x and below), see the [original repository](https://github.com/expatfile/next-runtime-env).

---

## [4.0.0] - 2025-10-16

This major release brings full Next.js 15 and React 19 support with modern async server component patterns. This fork
represents a comprehensive modernization of the package while maintaining backward compatibility with the core API.

### Added

- **Next.js 15 Support:** Full compatibility with Next.js 15's dynamic rendering APIs
- **React 19 Support:** Updated for React 19 with proper server component patterns
- **Modern Dynamic Rendering:** Migration from deprecated `unstable_noStore()` to Next.js 15's `connection()` API
- **Integration Testing:** Added comprehensive integration test with real Next.js application
- **ESLint 9 Support:** Migrated to ESLint 9 flat configuration system
- **Test Infrastructure:** Enhanced testing setup optimized for Next.js 15 and async components
- **TypeScript Configuration:** Improved TypeScript setup specifically for Next.js 15 compatibility

### Changed

- **Package Rebranding:** Renamed from `next-runtime-env` to `@hyperb1iss/next-runtime-env` to clearly differentiate the
  fork
- **Async Server Components:** Updated all server components to use async patterns as required by Next.js 15
- **Dependency Updates:** Comprehensive dependency updates for Next.js 15 and React 19 ecosystem compatibility
- **Build Configuration:** Refined build process for modern Next.js applications
- **Peer Dependencies:** Updated to require Next.js 15 and React 19
- **Code Style:** Prettier configuration converted to ES module format
- **Testing Approach:** Updated test patterns for async server component behavior

### Documentation

- **Comprehensive Documentation Overhaul:** All documentation updated for Next.js 15 patterns and features
- **Migration Guide:** Created detailed migration guide from Next.js 14 to Next.js 15
- **Updated Examples:** All code examples reflect Next.js 15 and React 19 patterns
- **API Documentation:** Clarified async/await requirements for server components
- **Version Guide:** Clear documentation of fork versioning strategy (4.x) vs original project (1-3.x)
- **Compatibility Matrix:** Documented version compatibility across Next.js releases
- **Fork Attribution:** Comprehensive acknowledgment of original project and maintainers

### Technical Details

- **Dynamic Rendering Migration:** Replaced Next.js 14's `unstable_noStore()` with Next.js 15's stable `connection()`
  API for opt-in dynamic rendering
- **Server Component Patterns:** All server components now properly implement async function signatures
- **ESLint Modernization:** Migrated from legacy `.eslintrc` to ESLint 9 flat config (`eslint.config.mjs`)
- **Type Safety:** Enhanced TypeScript configuration for stricter Next.js 15 type checking
- **Testing Infrastructure:** Updated Jest configuration and test utilities for React 19 and Next.js 15

### Breaking Changes

- **Minimum Requirements:** Requires Next.js 15+ and React 19+ (use `next-runtime-env@3.x` for Next.js 14)
- **Server Components:** All server-side usage must now use async/await patterns
- **Package Name:** New scoped package name `@hyperb1iss/next-runtime-env` (migration required)
- **Node.js Version:** Updated minimum Node.js version requirements per Next.js 15 specifications

---

## [3.x and below] - Original Project

This fork begins at version 4.0.0. For the complete history of versions 3.x, 2.x, and 1.x, please refer to the
[original next-runtime-env repository](https://github.com/expatfile/next-runtime-env).

### Original Project Version History

- **3.x:** Next.js 14 with advanced caching support
- **2.x:** Next.js 13 App Router support
- **1.x:** Next.js 12/13 Pages Router support

All credit for versions 1.x through 3.x goes to the original maintainers at [Expatfile.tax LLC](https://expatfile.tax).

---

## Attribution

This package is a fork of [next-runtime-env](https://github.com/expatfile/next-runtime-env) by Expatfile.tax LLC. All
credit for the original implementation, core concepts, and foundational work goes to the original authors.

**Fork Maintainer:** [Stefanie Jane (@hyperb1iss)](https://github.com/hyperb1iss)

**Original Authors:** [Expatfile.tax LLC](https://expatfile.tax)

[4.0.0]: https://github.com/hyperb1iss/next-runtime-env/releases/tag/v4.0.0
