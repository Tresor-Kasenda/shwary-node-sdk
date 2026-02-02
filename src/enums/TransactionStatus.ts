/**
 * Transaction status enum
 */
export enum TransactionStatus {
  /** Payment request submitted, awaiting processing */
  PENDING = 'pending',
  /** Payment successfully completed */
  COMPLETED = 'completed',
  /** Payment failed */
  FAILED = 'failed',
}

/**
 * Helper methods for transaction status
 */
export class TransactionStatusHelper {
  /**
   * Check if a status is terminal (will not change)
   * @param status - Transaction status
   * @returns true if status is COMPLETED or FAILED
   */
  static isTerminal(status: TransactionStatus): boolean {
    return status === TransactionStatus.COMPLETED || status === TransactionStatus.FAILED;
  }

  /**
   * Check if a status indicates successful transaction
   * @param status - Transaction status
   * @returns true if status is COMPLETED
   */
  static isSuccessful(status: TransactionStatus): boolean {
    return status === TransactionStatus.COMPLETED;
  }

  /**
   * Check if a status indicates pending transaction
   * @param status - Transaction status
   * @returns true if status is PENDING
   */
  static isPending(status: TransactionStatus): boolean {
    return status === TransactionStatus.PENDING;
  }
}
