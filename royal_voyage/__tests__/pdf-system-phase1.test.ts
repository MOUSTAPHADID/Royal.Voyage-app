import { describe, it, expect, beforeEach } from "vitest";
import {
  generateTicketPdf,
  generatePaymentReceiptPdf,
  generateInvoicePdf,
  generateSettlementReportPdf,
} from "../server/notifications/pdf-generator";
import { pdfLogger } from "../server/notifications/pdf-logger";

describe("PDF System Phase 1 - Real PDF Generation", () => {
  beforeEach(() => {
    pdfLogger.clearLogs();
  });

  describe("Ticket PDF Generation", () => {
    it("should generate a real PDF buffer for ticket", async () => {
      const result = await generateTicketPdf({
        bookingId: "BOOKING_001",
        ticketNumber: "TKT_001",
        pnr: "ABC123",
        passengerName: "John Doe",
        passengerEmail: "john@example.com",
        airline: "Emirates",
        flightNumber: "EK123",
        route: "DXB-CDG",
        departure: "Dubai",
        arrival: "Paris",
        departureTime: "14:30",
        arrivalTime: "18:45",
        baggage: "23kg",
        fare: 500,
        taxes: 50,
        total: 550,
        currency: "MRU",
        issueDate: "2026-04-25",
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer!.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // Check if it's a real PDF (starts with PDF magic bytes)
      const pdfMagic = result.buffer!.toString("ascii", 0, 4);
      expect(pdfMagic).toBe("%PDF");
    });

    it("should handle ticket PDF generation errors gracefully", async () => {
      // Pass invalid data to trigger error
      const result = await generateTicketPdf({
        bookingId: "",
        ticketNumber: "",
        pnr: "",
        passengerName: "",
        passengerEmail: "",
        airline: "",
        flightNumber: "",
        route: "",
        departure: "",
        arrival: "",
        departureTime: "",
        arrivalTime: "",
        fare: NaN,
        taxes: NaN,
        total: NaN,
        currency: "",
        issueDate: "",
      });

      // Should still succeed because PDFKit handles empty strings
      expect(result.success).toBe(true);
    });
  });

  describe("Payment Receipt PDF Generation", () => {
    it("should generate a real PDF buffer for payment receipt", async () => {
      const result = await generatePaymentReceiptPdf({
        bookingId: "BOOKING_003",
        paymentId: "PAY_001",
        amount: 550,
        currency: "MRU",
        method: "Credit Card",
        status: "paid",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        date: "2026-04-25",
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer!.length).toBeGreaterThan(0);

      // Check PDF magic bytes
      const pdfMagic = result.buffer!.toString("ascii", 0, 4);
      expect(pdfMagic).toBe("%PDF");
    });
  });

  describe("Invoice PDF Generation", () => {
    it("should generate a real PDF buffer for invoice", async () => {
      const result = await generateInvoicePdf({
        invoiceId: "INV_001",
        bookingId: "BOOKING_005",
        agencyName: "Travel Agency XYZ",
        date: "2026-04-25",
        items: [
          { description: "Flight Ticket", amount: 500 },
          { description: "Service Fee", amount: 50 },
        ],
        subtotal: 550,
        tax: 55,
        total: 605,
        currency: "MRU",
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer!.length).toBeGreaterThan(0);

      // Check PDF magic bytes
      const pdfMagic = result.buffer!.toString("ascii", 0, 4);
      expect(pdfMagic).toBe("%PDF");
    });
  });

  describe("Settlement Report PDF Generation", () => {
    it("should generate a real PDF buffer for settlement report", async () => {
      const result = await generateSettlementReportPdf({
        reportId: "SETTLE_001",
        agencyName: "Premium Travel Agency",
        period: "April 2026",
        sales: 50000,
        commission: 5000,
        markup: 2500,
        walletBalance: 10000,
        creditUsed: 5000,
        amountDueToRoyalVoyage: 7500,
        amountDueToAgency: 2500,
        currency: "MRU",
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer!.length).toBeGreaterThan(0);

      // Check PDF magic bytes
      const pdfMagic = result.buffer!.toString("ascii", 0, 4);
      expect(pdfMagic).toBe("%PDF");
    });
  });

  describe("PDF Logging System", () => {
    it("should log PDF generation", () => {
      pdfLogger.logGenerated("ticket", "BOOKING_007", { airline: "Emirates" });

      const logs = pdfLogger.getLogsByPdfType("ticket");
      expect(logs.length).toBe(1);
      expect(logs[0].type).toBe("generated");
      expect(logs[0].status).toBe("success");
    });

    it("should log PDF generation failures", () => {
      pdfLogger.logFailed("receipt", "BOOKING_008", "SMTP not configured");

      const logs = pdfLogger.getLogsByPdfType("receipt");
      expect(logs.length).toBe(1);
      expect(logs[0].type).toBe("failed");
      expect(logs[0].status).toBe("failed");
      expect(logs[0].error).toBe("SMTP not configured");
    });

    it("should log PDF delivery", () => {
      pdfLogger.logSent("ticket", "BOOKING_009", "email", "john@example.com");

      const logs = pdfLogger.getLogsByType("sent");
      expect(logs.length).toBe(1);
      expect(logs[0].type).toBe("sent");
      expect(logs[0].metadata?.channel).toBe("email");
    });

    it("should log PDF downloads", () => {
      pdfLogger.logDownloaded("invoice", "BOOKING_010", "user_123");

      const logs = pdfLogger.getLogsByType("downloaded");
      expect(logs.length).toBe(1);
      expect(logs[0].type).toBe("downloaded");
      expect(logs[0].userId).toBe("user_123");
    });

    it("should provide error statistics", () => {
      pdfLogger.logGenerated("ticket", "BOOKING_011");
      pdfLogger.logFailed("receipt", "BOOKING_012", "Error 1");
      pdfLogger.logFailed("receipt", "BOOKING_013", "Error 2");
      pdfLogger.logGenerated("invoice", "BOOKING_014");

      const stats = pdfLogger.getErrorStats();
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByType.receipt).toBe(2);
      expect(stats.errorsByType.ticket).toBe(0);
      expect(stats.recentErrors.length).toBe(2);
    });

    it("should filter logs by booking ID", () => {
      pdfLogger.logGenerated("ticket", "BOOKING_015");
      pdfLogger.logGenerated("receipt", "BOOKING_015");
      pdfLogger.logGenerated("invoice", "BOOKING_016");

      const logs = pdfLogger.getLogsByBookingId("BOOKING_015");
      expect(logs.length).toBe(2);
      expect(logs.every((log) => log.bookingId === "BOOKING_015")).toBe(true);
    });
  });

  describe("PDF Validity", () => {
    it("all PDFs should be valid PDF format", async () => {
      const ticketResult = await generateTicketPdf({
        bookingId: "BRAND_001",
        ticketNumber: "TKT_BRAND",
        pnr: "BRAND123",
        passengerName: "Test User",
        passengerEmail: "test@example.com",
        airline: "Test Airline",
        flightNumber: "TEST123",
        route: "TST-TST",
        departure: "Test City",
        arrival: "Test City",
        departureTime: "12:00",
        arrivalTime: "14:00",
        fare: 100,
        taxes: 10,
        total: 110,
        currency: "MRU",
        issueDate: "2026-04-25",
      });

      const receiptResult = await generatePaymentReceiptPdf({
        bookingId: "BRAND_002",
        paymentId: "PAY_BRAND",
        amount: 110,
        currency: "MRU",
        method: "Test",
        status: "paid",
        customerName: "Test User",
        customerEmail: "test@example.com",
        date: "2026-04-25",
      });

      const invoiceResult = await generateInvoicePdf({
        invoiceId: "INV_BRAND",
        bookingId: "BRAND_003",
        agencyName: "Test Agency",
        date: "2026-04-25",
        items: [{ description: "Test Item", amount: 100 }],
        subtotal: 100,
        tax: 10,
        total: 110,
        currency: "MRU",
      });

      const settlementResult = await generateSettlementReportPdf({
        reportId: "SETTLE_BRAND",
        agencyName: "Test Agency",
        period: "Test Period",
        sales: 1000,
        commission: 100,
        markup: 50,
        walletBalance: 500,
        creditUsed: 200,
        amountDueToRoyalVoyage: 150,
        amountDueToAgency: 50,
        currency: "MRU",
      });

      // All should be successful
      expect(ticketResult.success).toBe(true);
      expect(receiptResult.success).toBe(true);
      expect(invoiceResult.success).toBe(true);
      expect(settlementResult.success).toBe(true);

      // All should have valid PDF buffers
      expect(ticketResult.buffer).toBeDefined();
      expect(receiptResult.buffer).toBeDefined();
      expect(invoiceResult.buffer).toBeDefined();
      expect(settlementResult.buffer).toBeDefined();

      // All should be real PDFs (start with %PDF)
      const ticketMagic = ticketResult.buffer!.toString("ascii", 0, 4);
      const receiptMagic = receiptResult.buffer!.toString("ascii", 0, 4);
      const invoiceMagic = invoiceResult.buffer!.toString("ascii", 0, 4);
      const settlementMagic = settlementResult.buffer!.toString("ascii", 0, 4);

      expect(ticketMagic).toBe("%PDF");
      expect(receiptMagic).toBe("%PDF");
      expect(invoiceMagic).toBe("%PDF");
      expect(settlementMagic).toBe("%PDF");
    });
  });
});
