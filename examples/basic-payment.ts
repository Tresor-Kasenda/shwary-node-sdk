/**
 * Basic payment example using Shwary SDK
 *
 * This example shows how to use the Shwary facade for simple payments
 */

import { Shwary, Country, ValidationError, AuthenticationError, ApiError } from '../src';

async function main() {
  try {
    // Initialize SDK from environment variables
    // Set these in your .env file or export them:
    // export SHWARY_MERCHANT_ID="your-merchant-id"
    // export SHWARY_MERCHANT_KEY="your-merchant-key"
    // export SHWARY_SANDBOX="true"  # for testing
    Shwary.initFromEnvironment();

    console.log('Initialized Shwary SDK');
    console.log(
      `Running in ${Shwary.isSandbox() ? 'SANDBOX' : 'LIVE'} mode`,
    );

    // Example 1: Create a payment for DRC
    console.log('\n=== Example 1: DRC Payment ===');
    const drcTransaction = await Shwary.payDRC(
      5000,
      '+243812345678',
      'https://your-app.com/webhooks/shwary',
    );

    console.log('DRC Payment created:');
    console.log(` - ID: ${drcTransaction.id}`);
    console.log(` - Amount: ${drcTransaction.amount} ${drcTransaction.currency}`);
    console.log(` - Status: ${drcTransaction.status}`);
    console.log(` - Sandbox: ${drcTransaction.isSandbox}`);

    // Example 2: Create a payment for Kenya
    console.log('\n=== Example 2: Kenya Payment ===');
    const kenyaTransaction = await Shwary.pay(
      2500,
      '+254712345678',
      Country.KENYA,
    );

    console.log('Kenya Payment created:');
    console.log(` - ID: ${kenyaTransaction.id}`);
    console.log(` - Amount: ${kenyaTransaction.amount} ${kenyaTransaction.currency}`);
    console.log(` - Status: ${kenyaTransaction.status}`);

    // Example 3: Create a payment for Uganda
    console.log('\n=== Example 3: Uganda Payment ===');
    const ugandaTransaction = await Shwary.payUganda(10000, '+256701234567');

    console.log('Uganda Payment created:');
    console.log(` - ID: ${ugandaTransaction.id}`);
    console.log(` - Amount: ${ugandaTransaction.amount} ${ugandaTransaction.currency}`);
    console.log(` - Status: ${ugandaTransaction.status}`);

    // Example 4: Retrieve a transaction by ID
    console.log('\n=== Example 4: Get Transaction ===');
    const retrievedTx = await Shwary.getTransaction(drcTransaction.id);

    console.log('Retrieved transaction:');
    console.log(` - ID: ${retrievedTx.id}`);
    console.log(` - Status: ${retrievedTx.status}`);
    console.log(` - Created: ${retrievedTx.createdAt.toISOString()}`);

    // Example 5: Check transaction status
    console.log('\n=== Example 5: Check Status ===');
    console.log(`Is completed: ${drcTransaction.isCompleted()}`);
    console.log(`Is pending: ${drcTransaction.isPending()}`);
    console.log(`Is failed: ${drcTransaction.isFailed()}`);
    console.log(`Is terminal: ${drcTransaction.isTerminal()}`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation Error:', error.message);
      console.error('Context:', error.context);
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication Error:', error.message);
      console.error('Check your merchant ID and key');
    } else if (error instanceof ApiError) {
      console.error('API Error:', error.message);
      console.error('Status:', error.code);
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the example
main().catch(console.error);
