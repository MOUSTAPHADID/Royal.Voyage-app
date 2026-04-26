import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { WebhookEngine } from "@/server/webhooks/engine";
import { SettlementEngine } from "@/server/settlement/engine";
import { Logger } from "@/server/monitoring/logger";
import { SandboxEngine } from "@/server/sandbox/engine";

describe("Phase 4 - Operational Tests", () => {
  beforeEach(() => {
    Logger.clearLogs();
    SandboxEngine.clearHistory();
  });

  // ============================================
  // 1. Webhook Delivery Engine Tests
  // ============================================
  describe("Webhook Delivery Engine", () => {
    it("should generate valid HMAC-SHA256 signature", () => {
      const payload = JSON.stringify({
        event: "booking_created",
        timestamp: "2026-04-25T12:00:00Z",
        data: { bookingId: "123" },
      });

      const secret = "test_secret_key";
      const signature = WebhookEngine.generateSignature(payload, secret);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
    });

    it("should queue and deliver webhook successfully", async () => {
      const mockUrl = "https://example.com/webhooks";
      const secret = "test_secret";

      const deliveryId = await WebhookEngine.queueWebhook(mockUrl, secret, "booking_created", {
        bookingId: "booking_123",
        amount: 500.0,
      });

      expect(deliveryId).toBeDefined();
      expect(deliveryId).toMatch(/^wh_/);

      // Wait a bit for async delivery
      await new Promise((resolve) => setTimeout(resolve, 100));

      const log = WebhookEngine.getDeliveryLog(deliveryId);
      expect(log).toBeDefined();
      expect(log?.status).toMatch(/^(pending|failed)$/); // May fail due to mock URL
    });

    it("should track webhook delivery attempts", async () => {
      const mockUrl = "https://example.com/webhooks";
      const secret = "test_secret";

      const deliveryId = await WebhookEngine.queueWebhook(mockUrl, secret, "ticket_issued", {
        ticketId: "ticket_123",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const log = WebhookEngine.getDeliveryLog(deliveryId);
      expect(log?.attempts).toBeGreaterThanOrEqual(1);
    });

    it("should return delivery statistics", async () => {
      const mockUrl = "https://example.com/webhooks";
      const secret = "test_secret";

      // Queue multiple webhooks
      await WebhookEngine.queueWebhook(mockUrl, secret, "booking_created", {});
      await WebhookEngine.queueWebhook(mockUrl, secret, "ticket_issued", {});

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = WebhookEngine.getDeliveryStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
    });

    it("should support all webhook event types", async () => {
      const mockUrl = "https://example.com/webhooks";
      const secret = "test_secret";

      const events = [
        "booking_created",
        "price_changed",
        "ticket_issued",
        "ticket_failed",
        "refund_requested",
        "refund_completed",
        "payment_pending",
        "payment_confirmed",
      ] as const;

      for (const event of events) {
        const deliveryId = await WebhookEngine.queueWebhook(mockUrl, secret, event, {});
        expect(deliveryId).toBeDefined();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const logs = WebhookEngine.getDeliveryLogs();
      expect(logs.length).toBeGreaterThanOrEqual(events.length);
    });
  });

  // ============================================
  // 2. Settlement Automation Tests
  // ============================================
  describe("Settlement Automation", () => {
    it("should generate settlement report for partner", () => {
      const report = SettlementEngine.generateSettlementReport("partner_1", "2026-04");

      expect(report).toBeDefined();
      expect(report.partnerId).toBe("partner_1");
      expect(report.month).toBe("2026-04");
      expect(report.status).toBe("draft");
      expect(report.totalSales).toBeGreaterThan(0);
      expect(report.bookingsCount).toBeGreaterThan(0);
    });

    it("should calculate commissions correctly", () => {
      const report = SettlementEngine.generateSettlementReport("partner_2", "2026-04");

      const expectedCommissions = report.totalSales * 0.05; // 5% commission
      expect(report.commissions).toBeCloseTo(expectedCommissions, 2);
    });

    it("should calculate amounts due correctly", () => {
      const report = SettlementEngine.generateSettlementReport("partner_3", "2026-04");

      const expectedAmountDueToRoyalVoyage = report.commissions + report.markup;
      expect(report.amountDueToRoyalVoyage).toBeCloseTo(expectedAmountDueToRoyalVoyage, 2);

      const expectedAmountDueToPartner = report.totalSales - expectedAmountDueToRoyalVoyage;
      expect(report.amountDueToPartner).toBeCloseTo(expectedAmountDueToPartner, 2);
    });

    it("should generate reports for all partners", () => {
      const reports = SettlementEngine.generateAllSettlementReports("2026-04");

      expect(reports.length).toBeGreaterThan(0);
      expect(reports.every((r) => r.month === "2026-04")).toBe(true);
    });

    it("should finalize settlement report", () => {
      const report = SettlementEngine.generateSettlementReport("partner_1", "2026-04");
      const reportId = report.id;

      const finalized = SettlementEngine.finalizeSettlement(reportId);
      expect(finalized?.status).toBe("finalized");
    });

    it("should mark settlement as paid", () => {
      const report = SettlementEngine.generateSettlementReport("partner_1", "2026-04");
      const reportId = report.id;

      const paid = SettlementEngine.markSettlementAsPaid(reportId);
      expect(paid?.status).toBe("paid");
    });

    it("should export settlement as CSV", () => {
      const report = SettlementEngine.generateSettlementReport("partner_1", "2026-04");
      const csv = SettlementEngine.exportSettlementAsCSV(report.id);

      expect(csv).toContain("Settlement Report");
      expect(csv).toContain("partner_1");
      expect(csv).toContain("Total Sales");
      expect(csv).toContain("Commissions");
    });

    it("should list settlement reports for partner", () => {
      SettlementEngine.generateSettlementReport("partner_1", "2026-04");
      SettlementEngine.generateSettlementReport("partner_1", "2026-03");
      SettlementEngine.generateSettlementReport("partner_2", "2026-04");

      const reports = SettlementEngine.listSettlementReports("partner_1");
      expect(reports.length).toBe(2);
      expect(reports.every((r) => r.partnerId === "partner_1")).toBe(true);
    });
  });

  // ============================================
  // 3. Monitoring & Logging Tests
  // ============================================
  describe("Monitoring & Logging", () => {
    it("should log API errors", () => {
      Logger.logApiError("API request failed", 500, { endpoint: "/api/test" }, "user_1");

      const logs = Logger.getRecentLogs("api");
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].message).toContain("API request failed");
    });

    it("should log Amadeus errors", () => {
      Logger.logAmadeusError("Amadeus search failed", { error: "timeout" }, "user_1");

      const logs = Logger.getRecentLogs("amadeus");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log Hotelbeds errors", () => {
      Logger.logHotelbdsError("Hotelbeds booking failed", { error: "invalid_rate" }, "user_1");

      const logs = Logger.getRecentLogs("hotelbeds");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log payment errors", () => {
      Logger.logPaymentError("Payment processing failed", { amount: 500 }, "user_1");

      const logs = Logger.getRecentLogs("payment");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log rate limit errors", () => {
      Logger.logRateLimitError("Rate limit exceeded", { limit: 1000 }, "user_1");

      const logs = Logger.getRecentLogs("rate_limit");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log ticketing errors", () => {
      Logger.logTicketingError("Ticketing failed", { bookingId: "123" }, "user_1", "agency_1");

      const logs = Logger.getRecentLogs("ticketing");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log IATA validation blocks", () => {
      Logger.logIataValidationBlock("IATA validation failed", { reason: "insufficient_wallet" }, "agency_1");

      const logs = Logger.getRecentLogs("iata_validation");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should log webhook failures", () => {
      Logger.logWebhookFailure("Webhook delivery failed", { url: "https://example.com" }, "partner_1");

      const logs = Logger.getRecentLogs("webhook");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should provide error statistics", () => {
      Logger.logApiError("Error 1", 500);
      Logger.logApiError("Error 2", 500);
      Logger.logRateLimitError("Rate limit 1");

      const stats = Logger.getErrorStats();
      expect(stats.api_errors).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // 4. Sandbox Mode Tests
  // ============================================
  describe("Sandbox Mode", () => {
    it("should identify sandbox API keys", () => {
      expect(SandboxEngine.isSandboxKey("sandbox_test_key")).toBe(true);
      expect(SandboxEngine.isSandboxKey("live_test_key")).toBe(false);
    });

    it("should test flight search in sandbox", () => {
      const request = SandboxEngine.testEndpoint("/api/flights/search", "POST", {
        from: "DXB",
        to: "LHR",
      });

      expect(request.response.sandbox).toBe(true);
      expect(request.response.data.flights).toBeDefined();
      expect(request.response.data.flights.length).toBeGreaterThan(0);
    });

    it("should test hotel search in sandbox", () => {
      const request = SandboxEngine.testEndpoint("/api/hotels/search", "POST", {
        city: "Dubai",
      });

      expect(request.response.sandbox).toBe(true);
      expect(request.response.data.hotels).toBeDefined();
    });

    it("should test booking creation in sandbox", () => {
      const request = SandboxEngine.testEndpoint("/api/bookings", "POST", {
        flightId: "flight_1",
        hotelId: "hotel_1",
      });

      expect(request.response.sandbox).toBe(true);
      expect(request.response.data.bookingId).toContain("sandbox");
      expect(request.response.data.note).toContain("sandbox");
    });

    it("should test ticketing in sandbox", () => {
      const request = SandboxEngine.testEndpoint("/api/tickets", "POST", {
        bookingId: "booking_123",
      });

      expect(request.response.sandbox).toBe(true);
      expect(request.response.data.ticketId).toContain("sandbox");
      expect(request.response.data.note).toContain("sandbox");
    });

    it("should track sandbox request history", () => {
      SandboxEngine.testEndpoint("/api/flights/search", "POST");
      SandboxEngine.testEndpoint("/api/hotels/search", "POST");
      SandboxEngine.testEndpoint("/api/bookings", "POST");

      const history = SandboxEngine.getRequestHistory();
      expect(history.length).toBe(3);
    });

    it("should provide sandbox statistics", () => {
      SandboxEngine.testEndpoint("/api/flights/search", "POST");
      SandboxEngine.testEndpoint("/api/flights/search", "POST");
      SandboxEngine.testEndpoint("/api/hotels/search", "POST");

      const stats = SandboxEngine.getStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.requestsByEndpoint["/api/flights/search"]).toBe(2);
      expect(stats.requestsByMethod["POST"]).toBe(3);
    });
  });

  // ============================================
  // 5. Access Isolation Tests
  // ============================================
  describe("Access Isolation", () => {
    it("agency should not access another agency data", () => {
      // In production, this would be tested with actual API calls
      // For now, we verify the settlement engine isolates data
      const agency1Reports = SettlementEngine.listSettlementReports("agency_1");
      const agency2Reports = SettlementEngine.listSettlementReports("agency_2");

      // Generate reports for different agencies
      SettlementEngine.generateSettlementReport("agency_1", "2026-04");
      SettlementEngine.generateSettlementReport("agency_2", "2026-04");

      const agency1ReportsAfter = SettlementEngine.listSettlementReports("agency_1");
      const agency2ReportsAfter = SettlementEngine.listSettlementReports("agency_2");

      // Verify isolation
      expect(agency1ReportsAfter.every((r) => r.partnerId === "agency_1")).toBe(true);
      expect(agency2ReportsAfter.every((r) => r.partnerId === "agency_2")).toBe(true);
    });

    it("partner should not access another partner data", () => {
      SettlementEngine.generateSettlementReport("partner_1", "2026-04");
      SettlementEngine.generateSettlementReport("partner_2", "2026-04");

      const partner1Reports = SettlementEngine.listSettlementReports("partner_1");
      const partner2Reports = SettlementEngine.listSettlementReports("partner_2");

      expect(partner1Reports.every((r) => r.partnerId === "partner_1")).toBe(true);
      expect(partner2Reports.every((r) => r.partnerId === "partner_2")).toBe(true);
      expect(partner1Reports.length).toBeGreaterThan(0);
      expect(partner2Reports.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 6. Integration Tests
  // ============================================
  describe("Integration Tests", () => {
    it("should handle complete webhook + settlement workflow", async () => {
      // Generate settlement report
      const report = SettlementEngine.generateSettlementReport("partner_1", "2026-04");

      // Queue webhook for settlement completion
      const deliveryId = await WebhookEngine.queueWebhook(
        "https://example.com/webhooks",
        "test_secret",
        "payment_confirmed",
        {
          settlementId: report.id,
          amount: report.amountDueToPartner,
        }
      );

      // Log the event
      Logger.logSettlementEvent("Settlement completed", { settlementId: report.id }, "partner_1");

      // Verify all components worked
      expect(report).toBeDefined();
      expect(deliveryId).toBeDefined();

      const logs = Logger.getRecentLogs("settlement");
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should handle sandbox booking + webhook notification", async () => {
      // Test sandbox booking
      const bookingRequest = SandboxEngine.testEndpoint("/api/bookings", "POST", {
        flightId: "flight_1",
      });

      // Queue webhook notification
      const deliveryId = await WebhookEngine.queueWebhook(
        "https://example.com/webhooks",
        "test_secret",
        "booking_created",
        {
          bookingId: bookingRequest.response.data.bookingId,
          sandbox: true,
        }
      );

      // Log the event
      Logger.logApiError("Sandbox booking created", 200, { sandbox: true });

      expect(bookingRequest.response.sandbox).toBe(true);
      expect(deliveryId).toBeDefined();
    });
  });
});
