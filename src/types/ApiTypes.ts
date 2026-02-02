/**
 * API request/response type definitions
 */

/**
 * Generic API response structure
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  [key: string]: unknown;
}
