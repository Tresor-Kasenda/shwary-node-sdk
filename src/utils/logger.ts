/**
 * Optional logger interface (duck-typing)
 * Implement this interface to enable SDK logging
 */
export interface Logger {
  /**
   * Log debug message
   */
  debug(message: string, context?: unknown): void;

  /**
   * Log info message
   */
  info(message: string, context?: unknown): void;

  /**
   * Log error message
   */
  error(message: string, context?: unknown): void;
}

/**
 * No-op logger (default)
 */
export class NullLogger implements Logger {
  debug(): void {
    // No-op
  }

  info(): void {
    // No-op
  }

  error(): void {
    // No-op
  }
}
