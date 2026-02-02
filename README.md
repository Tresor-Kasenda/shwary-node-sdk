# Shwary Node.js SDK

Official Node.js/TypeScript SDK for Shwary Payment API - Make Mobile Money payments for DRC, Kenya, and Uganda.

[![npm version](https://img.shields.io/npm/v/@shwary/node-sdk.svg)](https://www.npmjs.com/package/@shwary/node-sdk)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-brightgreen)](https://nodejs.org/)

**Developed by [Tresor Kasenda](https://github.com/Tresor-Kasenda)** - Independent Developer

## Features

- ✅ **Full TypeScript Support** - Complete type definitions and IntelliSense
- ✅ **Native Fetch API** - Zero external HTTP dependencies (Node.js 18+)
- ✅ **Dual Module Support** - Both ESM and CommonJS
- ✅ **Type-Safe** - Strict TypeScript with full validation
- ✅ **Easy Initialization** - Facade pattern for simple usage, client pattern for advanced needs
- ✅ **Comprehensive Error Handling** - Custom error classes with context
- ✅ **Pre-flight Validation** - Immediate feedback before API calls
- ✅ **Webhook Support** - Built-in webhook parsing and handling
- ✅ **Sandbox Mode** - Test integration without real payments
- ✅ **Optional Logging** - Inject your own logger or use default no-op
- ✅ **Well Documented** - JSDoc/TSDoc on all public APIs

## Supported Countries

| Country | Currency | Dial Code | Min Amount |
|---------|----------|-----------|------------|
| **DRC** | CDF | +243 | 2,900 |
| **Kenya** | KES | +254 | 0 |
| **Uganda** | UGX | +256 | 0 |

## Installation

```bash
npm install @shwary/node-sdk
```

Or with other package managers:

```bash
yarn add @shwary/node-sdk
pnpm add @shwary/node-sdk
```

### Requirements

- **Node.js 18.0.0 or higher** (for native `fetch` support)
- **TypeScript 5.0+** (optional, for TypeScript projects)

## Quick Start

### 1. Set up Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
SHWARY_MERCHANT_ID=your-merchant-id
SHWARY_MERCHANT_KEY=your-merchant-secret-key
SHWARY_SANDBOX=true
```

### 2. Initialize and Make a Payment

```typescript
import { Shwary, Country } from '@shwary/node-sdk';

// Initialize once (load from env vars)
Shwary.initFromEnvironment();

// Make a payment for DRC
const transaction = await Shwary.payDRC(
  5000,                               // amount in CDF
  '+243812345678',                    // customer phone
  'https://myapp.com/webhooks/shwary' // optional callback URL
);

console.log(`Payment ID: ${transaction.id}`);
console.log(`Status: ${transaction.status}`); // 'pending' or 'completed' in sandbox
```

## Usage Patterns

### Facade Pattern (Simple)

Use the static `Shwary` class for straightforward usage:

```typescript
import { Shwary } from '@shwary/node-sdk';

Shwary.initFromEnvironment();

// Country-specific shortcuts
const drcTx = await Shwary.payDRC(5000, '+243812345678');
const kenyaTx = await Shwary.payKenya(2500, '+254712345678');
const ugandaTx = await Shwary.payUganda(10000, '+256701234567');

// Generic payment
const customTx = await Shwary.pay(5000, '+243812345678', Country.DRC);

// Retrieve transaction
const tx = await Shwary.getTransaction(drcTx.id);

// Check status
if (tx.isCompleted()) {
  console.log('Payment successful');
}
```

### Client Pattern (Advanced)

Use `ShwaryClient` for dependency injection and testability:

```typescript
import { ShwaryClient, Config } from '@shwary/node-sdk';

const config = new Config({
  merchantId: process.env.SHWARY_MERCHANT_ID!,
  merchantKey: process.env.SHWARY_MERCHANT_KEY!,
  sandbox: true,
});

const client = new ShwaryClient(config);

// Use like Shwary facade
const transaction = await client.payDRC(5000, '+243812345678');
```

### With Custom Logger

```typescript
import { ShwaryClient, Config } from '@shwary/node-sdk';

const logger = {
  debug: (msg, ctx) => console.log(`[DEBUG] ${msg}`, ctx),
  info: (msg, ctx) => console.log(`[INFO] ${msg}`, ctx),
  error: (msg, ctx) => console.error(`[ERROR] ${msg}`, ctx),
};

const client = ShwaryClient.fromEnvironment(logger);
```

## API Reference

### Payment Methods

#### `Shwary.payDRC(amount, phone, callbackUrl?)`

Create a payment for Democratic Republic of Congo.

```typescript
const tx = await Shwary.payDRC(5000, '+243812345678');
// amount: must be > 2900 CDF
// phone: must start with +243
```

#### `Shwary.payKenya(amount, phone, callbackUrl?)`

Create a payment for Kenya.

```typescript
const tx = await Shwary.payKenya(2500, '+254712345678');
```

#### `Shwary.payUganda(amount, phone, callbackUrl?)`

Create a payment for Uganda.

```typescript
const tx = await Shwary.payUganda(10000, '+256701234567');
```

#### `Shwary.pay(amount, phone, country, callbackUrl?)`

Create a payment for any supported country.

```typescript
const tx = await Shwary.pay(5000, '+243812345678', Country.DRC);
```

### Transaction Methods

#### `Shwary.getTransaction(id)`

Retrieve a transaction by ID.

```typescript
const tx = await Shwary.getTransaction('transaction-uuid');
console.log(tx.status); // 'pending', 'completed', or 'failed'
```

### Webhook Handling

#### `Shwary.parseWebhook(payload)`

Parse a webhook payload from Shwary.

```typescript
app.post('/webhooks/shwary', (req, res) => {
  const transaction = Shwary.parseWebhook(JSON.stringify(req.body));

  if (transaction.isCompleted()) {
    // Handle successful payment
  }

  res.json({ success: true });
});
```

#### `Shwary.webhook().createResponse(success, message?)`

Create a webhook response.

```typescript
const response = Shwary.webhook().createResponse(
  true,
  'Webhook processed'
);
res.json(response);
```

## Error Handling

The SDK provides custom error classes for different scenarios:

```typescript
import {
  ValidationError,
  AuthenticationError,
  ApiError,
} from '@shwary/node-sdk';

try {
  await Shwary.payDRC(100, '+243812345678'); // Amount too low
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
    console.error('Context:', error.context); // { field: 'amount', minimum: 2900, ... }
  } else if (error instanceof AuthenticationError) {
    console.error('Auth failed:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.code);
  }
}
```

### Error Classes

- **ValidationError** - Input validation failed (400)
  - `invalidAmount(amount, country)`
  - `invalidPhoneNumber(phone, country)`
  - `invalidCallbackUrl(url)`
  - `missingRequiredField(field)`

- **AuthenticationError** - Credentials invalid (401)
  - `invalidCredentials()`

- **ApiError** - API call failed
  - `fromResponse(response, body)` - Parse HTTP error response
  - `networkError(message, cause)`
  - `badGateway(message)`
  - `clientNotFound(phone)`

## Configuration

### Environment Variables

```env
# Required
SHWARY_MERCHANT_ID=your-merchant-id
SHWARY_MERCHANT_KEY=your-merchant-secret-key

# Optional
SHWARY_SANDBOX=true                          # default: false
SHWARY_BASE_URL=https://api.shwary.com       # default: https://api.shwary.com
SHWARY_TIMEOUT=30000                         # default: 30000 (milliseconds)
```

### Programmatic Configuration

```typescript
import { Config, ShwaryClient } from '@shwary/node-sdk';

const config = new Config({
  merchantId: 'your-id',
  merchantKey: 'your-key',
  sandbox: true,
  timeout: 60000,
  baseUrl: 'https://api.shwary.com',
});

const client = new ShwaryClient(config);
```

## TypeScript Support

The SDK is fully typed and provides excellent TypeScript support:

```typescript
import { Shwary, Country, Transaction, ValidationError } from '@shwary/node-sdk';

Shwary.initFromEnvironment();

async function processPayment(
  amount: number,
  phone: string,
  country: Country['DRC']
): Promise<void> {
  try {
    const transaction: Transaction = await Shwary.pay(
      amount,
      phone,
      country
    );

    if (transaction.isCompleted()) {
      console.log('Payment successful');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      // TypeScript knows error.context exists
      console.error(error.context);
    }
    throw error;
  }
}
```

## Webhook Integration

### Express.js Example

```typescript
import express from 'express';
import { Shwary, TransactionStatus } from '@shwary/node-sdk';

const app = express();
app.use(express.json());

Shwary.initFromEnvironment();

app.post('/webhooks/shwary', async (req, res) => {
  try {
    const transaction = Shwary.parseWebhook(JSON.stringify(req.body));

    if (transaction.status === TransactionStatus.COMPLETED) {
      // Update database, send confirmation email, etc.
      console.log(`✓ Payment completed: ${transaction.id}`);
    } else if (transaction.status === TransactionStatus.FAILED) {
      console.log(`✗ Payment failed: ${transaction.failureReason}`);
    }

    res.json(Shwary.webhook().createResponse(true));
  } catch (error) {
    res.status(400).json(
      Shwary.webhook().createResponse(false, error.message)
    );
  }
});
```

### Webhook Request Format

Shwary sends POST requests to your callback URL with this format:

```json
{
  "id": "transaction-uuid",
  "userId": "merchant-uuid",
  "amount": 5000,
  "currency": "CDF",
  "status": "completed",
  "recipientPhoneNumber": "+243812345678",
  "referenceId": "merchant-ref-id",
  "createdAt": "2025-01-16T10:15:00Z",
  "updatedAt": "2025-01-16T10:16:00Z",
  "completedAt": "2025-01-16T10:16:00Z",
  "isSandbox": false,
  ...
}
```

## Sandbox Mode

Test your integration without making real payments:

```typescript
// Initialize in sandbox mode
Shwary.initFromObject({
  merchantId: 'test-id',
  merchantKey: 'test-key',
  sandbox: true,
});

// Sandbox payments complete immediately
const tx = await Shwary.payDRC(5000, '+243812345678');
console.log(tx.status); // 'completed'
console.log(tx.isSandbox); // true
```

Sandbox payments:
- ✅ Complete immediately
- ✅ Don't charge actual mobile money accounts
- ✅ Trigger webhooks for testing
- ✅ Use the same validation as live payments

## Transaction Status

Transactions can be in three states:

```typescript
const tx = await Shwary.getTransaction(id);

// Check individual status
if (tx.isPending()) { /* payment in progress */ }
if (tx.isCompleted()) { /* payment successful */ }
if (tx.isFailed()) { /* payment failed */ }

// Check terminal status
if (tx.isTerminal()) { /* will not change */ }

// Access status directly
switch (tx.status) {
  case TransactionStatus.PENDING:
    // Awaiting processing
    break;
  case TransactionStatus.COMPLETED:
    // Successfully processed
    break;
  case TransactionStatus.FAILED:
    // Failed, check failureReason
    console.log(tx.failureReason);
    break;
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const tx = await Shwary.payDRC(amount, phone);
} catch (error) {
  // Handle specific error types
  if (error instanceof ValidationError) {
    // Show user-friendly validation message
  } else if (error instanceof AuthenticationError) {
    // Check credentials
  } else if (error instanceof ApiError) {
    // Log and retry
  }
}
```

### 2. Use Webhooks for Status Updates

Don't poll for transaction status; use webhooks instead:

```typescript
// ❌ Don't do this
for (let i = 0; i < 10; i++) {
  const tx = await Shwary.getTransaction(id);
  if (tx.isTerminal()) break;
  await delay(5000);
}

// ✅ Do this instead
// Set callback URL when creating payment
const tx = await Shwary.payDRC(5000, phone, callbackUrl);
// Shwary will POST to your callback URL when status changes
```

### 3. Idempotent Webhook Handling

```typescript
app.post('/webhooks/shwary', async (req, res) => {
  const tx = Shwary.parseWebhook(JSON.stringify(req.body));

  // Check if we already processed this transaction
  const existing = await db.transactions.findOne({ id: tx.id });
  if (existing) {
    // Already processed, just return success
    return res.json({ success: true });
  }

  // Process new transaction
  await db.transactions.insert(tx.toJSON());
  res.json({ success: true });
});
```

### 4. Store Transaction References

```typescript
// Save the merchant's reference ID for reconciliation
const tx = await Shwary.payDRC(5000, phone);
await db.payments.insert({
  shwaryId: tx.id,           // Shwary's transaction ID
  referenceId: tx.referenceId, // Your merchant reference
  status: tx.status,
  createdAt: tx.createdAt,
});
```

## Examples

See the `examples/` directory for complete examples:

- `basic-payment.ts` - Simple payment usage
- `webhook-handler.ts` - Express.js webhook server

## Troubleshooting

### "Merchant ID is required"

```typescript
// ❌ Empty credential
Shwary.initFromEnvironment(); // Env var not set

// ✅ Set environment variable
process.env.SHWARY_MERCHANT_ID = 'your-id';
Shwary.initFromEnvironment();
```

### "Phone number must start with {dialCode}"

```typescript
// ❌ Wrong format
await Shwary.payDRC(5000, '243812345678'); // Missing +

// ✅ Correct E.164 format
await Shwary.payDRC(5000, '+243812345678');
```

### "Amount must be greater than 2900 CDF"

```typescript
// ❌ DRC minimum is 2900
await Shwary.payDRC(1000, '+243812345678');

// ✅ Meet country minimum
await Shwary.payDRC(5000, '+243812345678');
```

### "Invalid merchant credentials"

```typescript
// Check your credentials in the Shwary dashboard
// Make sure you've copied the key (only shown once)
Shwary.initFromObject({
  merchantId: 'check-your-dashboard',
  merchantKey: 'copy-fresh-key-from-dashboard',
  sandbox: true, // Test in sandbox first
});
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository: [Tresor-Kasenda/shwary-node-sdk](https://github.com/Tresor-Kasenda/shwary-node-sdk)
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Tresor-Kasenda/shwary-node-sdk.git
cd shwary-node-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type check
npm run type-check
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Building

```bash
# Build for distribution
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## API Documentation

Complete API documentation is available in the TypeScript type definitions. Your IDE will provide IntelliSense/autocomplete for all methods and parameters.

For detailed JSDoc comments, see the source files in the `src/` directory.

## License

MIT - see LICENSE file for details

## Support

For issues and questions:

- 📖 [Official Shwary Documentation](https://docs.shwary.com)
- 🐛 [Report Issues](https://github.com/Tresor-Kasenda/shwary-node-sdk/issues)
- 💬 [Discussions](https://github.com/Tresor-Kasenda/shwary-node-sdk/discussions)
- 👨‍💻 [Developer GitHub](https://github.com/Tresor-Kasenda)

## Developer

**Tresor Kasenda** - Independent Developer

- GitHub: [@Tresor-Kasenda](https://github.com/Tresor-Kasenda)
- Email: tresorkasendat@gmail.com

This SDK is developed and maintained by Tresor Kasenda. For professional inquiries or custom development, feel free to reach out.

## Related Projects

- [Shwary PHP SDK](https://github.com/Tresor-Kasenda/shwary-php-sdk) - Official PHP SDK for Shwary Payment API

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and breaking changes.

---

**Made with ❤️ by [Tresor Kasenda](https://github.com/Tresor-Kasenda) for the African developer community**

Repository: [github.com/Tresor-Kasenda/shwary-node-sdk](https://github.com/Tresor-Kasenda/shwary-node-sdk)

---
