/**
 * @fileoverview Network helper utilities for capturing, inspecting, and
 * validating HTTP requests and responses during E2E test execution.
 * 
 * Enables API-level assertions within E2E tests by intercepting
 * and recording network traffic for later validation.
 */

import { type Page, type Request, type Response } from '@playwright/test';
import type { InterceptedRequest, InterceptedResponse, NetworkExchange, HttpMethod } from '../types/api-response.types';

/**
 * Network helper class for monitoring and capturing HTTP traffic.
 * Attaches listeners to the page and records matching requests/responses.
 */
export class NetworkHelper {
  private readonly page: Page;
  private readonly capturedExchanges: NetworkExchange[] = [];
  private isListening = false;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Starts listening for network requests matching the given pattern.
   * All matching request/response pairs are stored for later assertion.
   * 
   * @param urlPattern - String pattern to match in request URLs
   */
  startCapturing(urlPattern: string): void {
    if (this.isListening) return;
    this.isListening = true;

    this.page.on('response', async (response: Response) => {
      const request = response.request();
      if (request.url().includes(urlPattern)) {
        const exchange: NetworkExchange = {
          request: {
            url: request.url(),
            method: request.method() as HttpMethod,
            headers: request.headers(),
            body: this.safeParseBody(request.postData()),
            timestamp: Date.now(),
          },
          response: {
            status: response.status(),
            headers: response.headers(),
            body: await this.safeParseResponse(response),
          },
        };
        this.capturedExchanges.push(exchange);
      }
    });
  }

  /**
   * Returns all captured network exchanges.
   */
  getCapturedExchanges(): NetworkExchange[] {
    return [...this.capturedExchanges];
  }

  /**
   * Returns captured exchanges filtered by HTTP method.
   * 
   * @param method - The HTTP method to filter by
   */
  getExchangesByMethod(method: HttpMethod): NetworkExchange[] {
    return this.capturedExchanges.filter(e => e.request.method === method);
  }

  /**
   * Returns the last captured exchange.
   */
  getLastExchange(): NetworkExchange | undefined {
    return this.capturedExchanges[this.capturedExchanges.length - 1];
  }

  /**
   * Clears all captured exchanges.
   */
  clearCaptures(): void {
    this.capturedExchanges.length = 0;
  }

  /**
   * Waits for a specific API request and returns its data.
   * 
   * @param urlPattern - URL pattern to wait for
   * @param method - Expected HTTP method
   * @param timeout - Maximum wait time in ms
   * @returns The intercepted request data
   */
  async waitForRequest(
    urlPattern: string,
    method: HttpMethod = 'GET',
    timeout = 15000
  ): Promise<InterceptedRequest> {
    const request = await this.page.waitForRequest(
      (req: Request) =>
        req.url().includes(urlPattern) && req.method() === method,
      { timeout }
    );

    return {
      url: request.url(),
      method: request.method() as HttpMethod,
      headers: request.headers(),
      body: this.safeParseBody(request.postData()),
      timestamp: Date.now(),
    };
  }

  /**
   * Waits for a specific API response and returns its data.
   * 
   * @param urlPattern - URL pattern to wait for
   * @param timeout - Maximum wait time in ms
   * @returns The intercepted response data
   */
  async waitForResponse(
    urlPattern: string,
    timeout = 15000
  ): Promise<InterceptedResponse> {
    const response = await this.page.waitForResponse(
      (res: Response) => res.url().includes(urlPattern),
      { timeout }
    );

    return {
      status: response.status(),
      headers: response.headers(),
      body: await this.safeParseResponse(response),
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────

  /**
   * Safely parses a request body string to an object.
   */
  private safeParseBody(body: string | null): unknown {
    if (!body) return undefined;
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  /**
   * Safely parses a response body to an object.
   */
  private async safeParseResponse(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      try {
        return await response.text();
      } catch {
        return undefined;
      }
    }
  }
}
