import { TransactionStatus, TransactionStatusHelper } from '../enums/TransactionStatus';

/**
 * Raw transaction data from API
 */
export interface TransactionData {
  /** Transaction ID (UUID) */
  id: string;
  /** Merchant user ID */
  userId: string;
  /** Payment amount */
  amount: number;
  /** Currency code (CDF, KES, UGX) */
  currency: string;
  /** Transaction type (e.g., 'deposit') */
  type: string;
  /** Transaction status (pending, completed, failed) */
  status: TransactionStatus;
  /** Customer phone number */
  recipientPhoneNumber: string;
  /** Merchant's reference ID */
  referenceId: string;
  /** Custom metadata (optional) */
  metadata?: Record<string, unknown> | null;
  /** Failure reason if transaction failed */
  failureReason?: string | null;
  /** Completion timestamp if transaction completed */
  completedAt?: string | null;
  /** Transaction creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Whether this is a sandbox transaction */
  isSandbox: boolean;
  /** Pretium transaction ID if available */
  pretiumTransactionId?: string | null;
  /** Error message if transaction failed */
  error?: string | null;
}

/**
 * Immutable Transaction class representing a payment transaction
 */
export class Transaction {
  /** Transaction ID (UUID) */
  readonly id: string;

  /** Merchant user ID */
  readonly userId: string;

  /** Payment amount */
  readonly amount: number;

  /** Currency code (CDF, KES, UGX) */
  readonly currency: string;

  /** Transaction type */
  readonly type: string;

  /** Transaction status */
  readonly status: TransactionStatus;

  /** Customer phone number */
  readonly recipientPhoneNumber: string;

  /** Merchant's reference ID */
  readonly referenceId: string;

  /** Custom metadata */
  readonly metadata: Record<string, unknown> | null;

  /** Failure reason if failed */
  readonly failureReason: string | null;

  /** Completion timestamp */
  readonly completedAt: Date | null;

  /** Creation timestamp */
  readonly createdAt: Date;

  /** Last update timestamp */
  readonly updatedAt: Date;

  /** Sandbox transaction flag */
  readonly isSandbox: boolean;

  /** Pretium transaction ID */
  readonly pretiumTransactionId: string | null;

  /** Error message if failed */
  readonly error: string | null;

  /**
   * Create a new Transaction instance
   * @param data - Transaction data
   */
  constructor(data: TransactionData) {
    this.id = data.id;
    this.userId = data.userId;
    this.amount = data.amount;
    this.currency = data.currency;
    this.type = data.type;
    this.status = data.status;
    this.recipientPhoneNumber = data.recipientPhoneNumber;
    this.referenceId = data.referenceId;
    this.metadata = data.metadata ?? null;
    this.failureReason = data.failureReason ?? null;
    this.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.isSandbox = data.isSandbox;
    this.pretiumTransactionId = data.pretiumTransactionId ?? null;
    this.error = data.error ?? null;
  }

  /**
   * Create Transaction from API response
   * @param data - Raw API response data
   * @returns Transaction instance
   */
  static fromApiResponse(data: Record<string, unknown>): Transaction {
    // Map API response to TransactionData
    const transactionData: TransactionData = {
      id: String(data.id ?? ''),
      userId: String(data.userId ?? ''),
      amount: Number(data.amount ?? 0),
      currency: String(data.currency ?? ''),
      type: String(data.type ?? 'deposit'),
      status: (data.status as TransactionStatus) ?? TransactionStatus.PENDING,
      recipientPhoneNumber: String(data.recipientPhoneNumber ?? ''),
      referenceId: String(data.referenceId ?? ''),
      metadata: (data.metadata as Record<string, unknown>) ?? null,
      failureReason: (data.failureReason as string) ?? null,
      completedAt: (data.completedAt as string) ?? null,
      createdAt: String(data.createdAt ?? new Date().toISOString()),
      updatedAt: String(data.updatedAt ?? new Date().toISOString()),
      isSandbox: Boolean(data.isSandbox ?? false),
      pretiumTransactionId: (data.pretiumTransactionId as string) ?? null,
      error: (data.error as string) ?? null,
    };

    return new Transaction(transactionData);
  }

  /**
   * Check if transaction is pending
   */
  isPending(): boolean {
    return TransactionStatusHelper.isPending(this.status);
  }

  /**
   * Check if transaction is completed successfully
   */
  isCompleted(): boolean {
    return TransactionStatusHelper.isSuccessful(this.status);
  }

  /**
   * Check if transaction failed
   */
  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  /**
   * Check if transaction is in a terminal state (will not change)
   */
  isTerminal(): boolean {
    return TransactionStatusHelper.isTerminal(this.status);
  }

  /**
   * Convert to plain object (JSON-serializable)
   */
  toJSON(): TransactionData {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      recipientPhoneNumber: this.recipientPhoneNumber,
      referenceId: this.referenceId,
      metadata: this.metadata,
      failureReason: this.failureReason,
      completedAt: this.completedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isSandbox: this.isSandbox,
      pretiumTransactionId: this.pretiumTransactionId,
      error: this.error,
    };
  }
}
