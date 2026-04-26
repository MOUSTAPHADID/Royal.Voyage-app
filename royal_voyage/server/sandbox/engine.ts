export interface SandboxRequest {
  id: string;
  endpoint: string;
  method: string;
  payload?: Record<string, any>;
  response: Record<string, any>;
  timestamp: Date;
}

// In-memory store for sandbox requests (in production, use database)
const sandboxRequests: SandboxRequest[] = [];

/**
 * Sandbox Mode Engine
 * Provides safe testing environment without affecting production data
 */
export class SandboxEngine {
  /**
   * Check if API key is sandbox
   */
  static isSandboxKey(apiKey: string): boolean {
    return apiKey.startsWith("sandbox_");
  }

  /**
   * Test API endpoint in sandbox mode
   */
  static testEndpoint(
    endpoint: string,
    method: string,
    payload?: Record<string, any>
  ): SandboxRequest {
    const requestId = `sandbox_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate mock response based on endpoint
    const response = this.generateMockResponse(endpoint, method, payload);

    const request: SandboxRequest = {
      id: requestId,
      endpoint,
      method,
      payload,
      response,
      timestamp: new Date(),
    };

    // Store request
    sandboxRequests.push(request);

    // Keep only last 100 requests
    if (sandboxRequests.length > 100) {
      sandboxRequests.shift();
    }

    console.log(`[Sandbox] Test request: ${method} ${endpoint}`);

    return request;
  }

  /**
   * Generate mock response for endpoint
   */
  private static generateMockResponse(
    endpoint: string,
    method: string,
    payload?: Record<string, any>
  ): Record<string, any> {
    // Flight search
    if (endpoint.includes("/flights/search")) {
      return {
        sandbox: true,
        status: "success",
        data: {
          flights: [
            {
              id: "flight_1",
              airline: "Emirates",
              departure: "2026-05-01T10:00:00Z",
              arrival: "2026-05-01T14:00:00Z",
              price: 450.0,
              currency: "USD",
              sandbox: true,
            },
          ],
        },
      };
    }

    // Hotel search
    if (endpoint.includes("/hotels/search")) {
      return {
        sandbox: true,
        status: "success",
        data: {
          hotels: [
            {
              id: "hotel_1",
              name: "Sandbox Hotel",
              city: "Dubai",
              price: 150.0,
              currency: "USD",
              sandbox: true,
            },
          ],
        },
      };
    }

    // Booking creation
    if (endpoint.includes("/bookings") && method === "POST") {
      return {
        sandbox: true,
        status: "success",
        data: {
          bookingId: "booking_sandbox_123",
          status: "confirmed",
          totalPrice: 600.0,
          currency: "USD",
          sandbox: true,
          note: "This is a sandbox booking and will not be processed",
        },
      };
    }

    // Ticketing
    if (endpoint.includes("/tickets") && method === "POST") {
      return {
        sandbox: true,
        status: "success",
        data: {
          ticketId: "ticket_sandbox_123",
          status: "issued",
          ticketNumber: "SANDBOX123456",
          sandbox: true,
          note: "This is a sandbox ticket and will not be issued",
        },
      };
    }

    // Default response
    return {
      sandbox: true,
      status: "success",
      data: {
        message: "Sandbox mode - no real data processed",
      },
    };
  }

  /**
   * Get sandbox request history
   */
  static getRequestHistory(limit: number = 50): SandboxRequest[] {
    return sandboxRequests.slice(-limit);
  }

  /**
   * Get sandbox request by ID
   */
  static getRequest(requestId: string): SandboxRequest | undefined {
    return sandboxRequests.find((r) => r.id === requestId);
  }

  /**
   * Clear sandbox history (for testing)
   */
  static clearHistory(): void {
    sandboxRequests.length = 0;
  }

  /**
   * Get sandbox statistics
   */
  static getStats(): {
    totalRequests: number;
    requestsByEndpoint: Record<string, number>;
    requestsByMethod: Record<string, number>;
  } {
    const stats = {
      totalRequests: sandboxRequests.length,
      requestsByEndpoint: {} as Record<string, number>,
      requestsByMethod: {} as Record<string, number>,
    };

    for (const request of sandboxRequests) {
      stats.requestsByEndpoint[request.endpoint] =
        (stats.requestsByEndpoint[request.endpoint] || 0) + 1;
      stats.requestsByMethod[request.method] = (stats.requestsByMethod[request.method] || 0) + 1;
    }

    return stats;
  }
}
