/**
 * Base error class for all Shwary SDK errors
 */
export class ShwaryError extends Error {
  /**
   * Error code
   */
  readonly code: number;

  /**
   * Additional context information
   */
  readonly context: Record<string, unknown>;

  /**
   * Create a new ShwaryError
   * @param message - Error message
   * @param code - Error code (default: 0)
   * @param context - Additional context information
   */
  constructor(
    message: string,
    code: number = 0,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ShwaryError.prototype);
  }

  /**
   * Convert error to JSON object
   */
  toJSON(): {
    name: string;
    message: string;
    code: number;
    context: Record<string, unknown>;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    };
  }
}
