# Changelog

All notable changes to the Shwary Node.js SDK will be documented in this file.

## [1.0.0] - 2025-01-16

### Added

- Initial release of Shwary Node.js/TypeScript SDK
- Full TypeScript support with strict type checking
- Native fetch API integration (Node.js 18+)
- Dual module output (ESM and CommonJS)
- Complete API support for DRC, Kenya, and Uganda
- Payment endpoints:
  - `payDRC()` - Create payment for Democratic Republic of Congo
  - `payKenya()` - Create payment for Kenya
  - `payUganda()` - Create payment for Uganda
  - `pay()` - Generic payment method for any country
  - `getTransaction()` - Retrieve transaction by ID
- Sandbox mode for testing without real payments
- Webhook parsing and handling
- Comprehensive error handling with custom error classes:
  - `ValidationError` - Input validation errors
  - `AuthenticationError` - Authentication failures
  - `ApiError` - API communication errors
- Pre-flight validation:
  - Amount validation per country
  - Phone number format validation (E.164)
  - Callback URL validation (HTTPS only)
- Configuration management:
  - `Config.fromEnvironment()` - Load from env vars
  - `Config.fromObject()` - Load from plain object
  - Support for custom base URLs and timeouts
- Multiple initialization patterns:
  - Facade pattern via static `Shwary` class
  - Client pattern via `ShwaryClient` for dependency injection
- Optional logging interface for custom logger injection
- Immutable data objects for type safety
- Helper methods for transaction status checking
- JSDoc/TSDoc documentation on all public APIs
- Full test coverage with Vitest
- Examples for common use cases
- Comprehensive README with best practices

### Features

- ✅ TypeScript-first design
- ✅ Zero HTTP dependencies (native fetch)
- ✅ Strict mode TypeScript compilation
- ✅ Dual ESM/CommonJS output
- ✅ Type-safe error handling
- ✅ Pre-flight input validation
- ✅ Webhook support
- ✅ Sandbox testing mode
- ✅ Optional logging
- ✅ Well-documented with examples

### Known Limitations

- Requires Node.js 18+ (for native fetch support)
- No automatic retry mechanism (implementable by users)
- Webhook payload size limited by your server configuration

## Future Roadmap

- [ ] Automatic retry with exponential backoff
- [ ] Request rate limiting
- [ ] Support for additional payment providers
- [ ] React Native support
- [ ] Browser support (if Shwary enables CORS)
- [ ] Built-in caching layer
- [ ] Comprehensive integration tests with mock server
- [ ] GraphQL API support
