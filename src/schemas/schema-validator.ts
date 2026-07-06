/**
 * @fileoverview Reusable AJV schema validator utility.
 * Provides a singleton AJV instance with formats support
 * and a generic validation function for use across all test schemas.
 * 
 * Usage:
 *   import { validateSchema } from './schema-validator';
 *   import { cartItemSchema } from './cart.schema';
 *   const result = validateSchema(cartItemSchema, responseData);
 *   expect(result.valid).toBe(true);
 */

import Ajv, { type JSONSchemaType, type ValidateFunction, type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

/** Validation result with typed error details */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ErrorObject[] | null;
  readonly errorMessages: string[];
}

/**
 * Singleton AJV instance configured with format validation.
 * Using allErrors to report all validation issues at once (useful for debugging).
 */
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});
addFormats(ajv);

/**
 * Validates data against a JSON Schema using AJV.
 * 
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @returns ValidationResult with validity flag and error details
 * 
 * @example
 * ```typescript
 * const result = validateSchema(cartResponseSchema, apiResponse);
 * if (!result.valid) {
 *   console.error('Validation failed:', result.errorMessages);
 * }
 * ```
 */
export function validateSchema(schema: object, data: unknown): ValidationResult {
  const validate: ValidateFunction = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid: valid as boolean,
    errors: validate.errors || null,
    errorMessages: (validate.errors || []).map(
      (err) => `${err.instancePath || '/'} ${err.message || 'unknown error'}`
    ),
  };
}

/**
 * Asserts that data matches a schema, throwing a descriptive error if not.
 * Useful for inline assertion in tests.
 * 
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @param context - Optional context string for error messages
 * @throws Error with detailed validation failure message
 */
export function assertSchema(schema: object, data: unknown, context?: string): void {
  const result = validateSchema(schema, data);
  if (!result.valid) {
    const prefix = context ? `Schema validation failed for ${context}` : 'Schema validation failed';
    throw new Error(`${prefix}:\n${result.errorMessages.join('\n')}`);
  }
}
