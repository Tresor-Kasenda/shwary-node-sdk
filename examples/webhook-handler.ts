/**
 * Express.js webhook handler example
 *
 * This example shows how to handle webhook callbacks from Shwary
 */

import express from 'express';
import { Shwary, TransactionStatus } from '../src';

const app = express();

// Middleware
app.use(express.json());

// Initialize Shwary SDK
Shwary.initFromEnvironment();

/**
 * Webhook endpoint for Shwary payment notifications
 *
 * Shwary will POST transaction updates to this endpoint
 */
app.post('/webhooks/shwary', (req, res) => {
  try {
    // Parse the webhook payload
    const transaction = Shwary.parseWebhook(JSON.stringify(req.body));

    console.log(`Webhook received: Transaction ${transaction.id}`);
    console.log(`Status: ${transaction.status}`);

    // Handle different transaction statuses
    if (transaction.status === TransactionStatus.COMPLETED) {
      console.log(`✓ Payment completed: ${transaction.amount} ${transaction.currency}`);
      // TODO: Update your database, send confirmation email, etc.
    } else if (transaction.status === TransactionStatus.FAILED) {
      console.log(`✗ Payment failed: ${transaction.failureReason || 'Unknown reason'}`);
      // TODO: Retry, notify user, etc.
    } else if (transaction.status === TransactionStatus.PENDING) {
      console.log(`⏳ Payment pending`);
      // TODO: Wait for next update, maybe set a timeout
    }

    // Send success response back to Shwary
    const response = Shwary.webhook().createResponse(
      true,
      'Webhook processed successfully',
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('Webhook error:', error);

    // Send error response back to Shwary
    const response = Shwary.webhook().createResponse(
      false,
      `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );

    res.status(400).json(response);
  }
});

/**
 * Example endpoint to check transaction status
 */
app.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Shwary.getTransaction(req.params.id);

    res.json({
      success: true,
      data: transaction.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sandbox: Shwary.isSandbox(),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`POST ${PORT}/webhooks/shwary`);
});
