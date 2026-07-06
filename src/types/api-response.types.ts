/**
 * @fileoverview Generic API response type definitions.
 * Wraps domain-specific types with standard API envelope patterns
 * for consistent response handling and validation.
 */

/** Standard API response envelope */
export interface ApiResponse<T> {
  readonly status: number;
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly meta?: ApiMeta;
}

/** API error object */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, string[]>;
}

/** API response metadata (pagination, etc.) */
export interface ApiMeta {
  readonly page?: number;
  readonly perPage?: number;
  readonly total?: number;
  readonly totalPages?: number;
}

/** HTTP method types used in API interception */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Intercepted request data for assertion */
export interface InterceptedRequest {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Record<string, string>;
  readonly body?: unknown;
  readonly timestamp: number;
}

/** Intercepted response data for assertion */
export interface InterceptedResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body?: unknown;
  readonly timing?: number;
}

/** Network request/response pair */
export interface NetworkExchange {
  readonly request: InterceptedRequest;
  readonly response: InterceptedResponse;
}
