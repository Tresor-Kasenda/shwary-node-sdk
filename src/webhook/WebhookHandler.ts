import { Transaction } from '../types/Transaction';
import { ShwaryError } from '../errors/ShwaryError';

/**
 * Webhook response format
 */
export interface WebhookResponse {
  /** Whether webhook was processed successfully */
  success: boolean;
  /** Message describing the result */
  message: string;
  /** Timestamp of the response */
  timestamp: string;
}

/**
 * Handles parsing and validating webhook payloads from Shwary
 */
export class WebhookHandler {
  /**
   * Parse a webhook payload from JSON string
   * @param payload - JSON string from webhook
   * @returns Parsed transaction
   * @throws ShwaryError if payload is invalid
   */
  parsePayload(payload: string): Transaction {
    try {
      const data = JSON.parse(payload);
      return this.parseFromRequest(data);
    } catch (error) {
      throw new ShwaryError(
        'Invalid webhook payload: failed to parse JSON',
        400,
        {
          reason: 'invalid_json',
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  /**
   * Parse a webhook payload from an already-parsed object
   * @param body - Parsed webhook body
   * @returns Parsed transaction
   * @throws ShwaryError if payload is invalid
   */
  parseFromRequest(body: unknown): Transaction {
    if (!body || typeof body !== 'object') {
      throw new ShwaryError(
        'Invalid webhook payload: expected object',
        400,
        { reason: 'invalid_format' },
      );
    }

    try {
      const transaction = Transaction.fromApiResponse(
        body as Record<string, unknown>,
      );
      return transaction;
    } catch (error) {
      throw new ShwaryError(
        'Invalid webhook payload: missing required fields',
        400,
        {
          reason: 'missing_fields',
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  /**
   * Check if a transaction is in a terminal state
   * @param transaction - Transaction to check
   * @returns true if transaction is completed or failed
   */
  isTerminalStatus(transaction: Transaction): boolean {
    return transaction.isTerminal();
  }

  /**
   * Create a webhook response
   * @param success - Whether processing was successful
   * @param message - Response message
   * @returns Webhook response object
   */
  createResponse(success: boolean, message?: string): WebhookResponse {
    return {
      success,
      message: message || (success ? 'Webhook processed successfully' : 'Failed to process webhook'),
      timestamp: new Date().toISOString(),
    };
  }
}
