import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  generateTicketPdfPhase2,
  generatePaymentReceiptPdfPhase2,
  generateInvoicePdfPhase2,
  generateSettlementReportPdfPhase2,
} from "../server/notifications/pdf-generator-phase2";
import { PdfStorageManager } from "../server/pdf/storage";
import { pdfLogger } from "../server/notifications/pdf-logger";

describe("PDF System Phase 2", () => {
  beforeAll(() => {
    PdfStorageManager.initialize();
  });

  afterAll(() => {
    PdfStorageManager.cleanupExpiredTokens();
  });

  it("should generate ticket PDF with Arabic support", async () => {
    const result = await generateTicketPdfPhase2(
      {
        ticketNumber: "TK123456",
        pnr: "ABC123",
        passengerName: "محمد علي",
        airline: "Royal Air",
        flightNumber: "RA101",
        route: "DAK-CDG",
        departure: "Dakar",
        departureTime: "10:00",
        arrival: "Paris",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: "500",
        taxes: "100",
        total: "600",
        currency: "MRU",
        bookingId: "BOOK001",
      },
      {
        includeArabic: true,
        includeQrCode: true,
        storeInStorage: true,
      }
    );

    expect(result.success).toBe(true);
    expect(result.buffer).toBeDefined();
    expect(result.pdfId).toBeDefined();
    expect(result.token).toBeDefined();
    const pdfStart = result.buffer?.toString("utf8", 0, 4);
    expect(pdfStart).toBe("%PDF");
  });

  it("should generate payment receipt PDF with PAID watermark", async () => {
    const result = await generatePaymentReceiptPdfPhase2(
      {
        paymentId: "PAY001",
        bookingId: "BOOK004",
        date: new Date().toISOString().split("T")[0],
        customerName: "محمد علي",
        customerEmail: "customer@example.com",
        amount: "600",
        currency: "MRU",
        method: "Bank Transfer",
        status: "paid",
      },
      {
        watermarkStatus: "PAID",
        storeInStorage: true,
      }
    );

    expect(result.success).toBe(true);
    expect(result.buffer?.toString("utf8", 0, 4)).toBe("%PDF");
    expect(result.pdfId).toBeDefined();
    expect(result.token).toBeDefined();
  });

  it("should generate invoice PDF with DRAFT watermark", async () => {
    const result = await generateInvoicePdfPhase2(
      {
        invoiceId: "INV001",
        bookingId: "BOOK006",
        agencyName: "Royal Travel Agency",
        date: new Date().toISOString().split("T")[0],
        items: [
          { description: "Flight Ticket", amount: "500" },
          { description: "Service Fee", amount: "50" },
        ],
        subtotal: "550",
        tax: "50",
        total: "600",
        currency: "MRU",
      },
      {
        watermarkStatus: "DRAFT",
        storeInStorage: true,
      }
    );

    expect(result.success).toBe(true);
    expect(result.buffer?.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate settlement report PDF with QR code", async () => {
    const result = await generateSettlementReportPdfPhase2(
      {
        reportId: "SETTLE001",
        agencyName: "Royal Travel Agency",
        period: "April 2026",
        sales: "50000",
        commission: "5000",
        markup: "2500",
        walletBalance: "10000",
        creditUsed: "5000",
        amountDueToRoyalVoyage: "7500",
        amountDueToAgency: "2500",
        currency: "MRU",
      },
      {
        includeQrCode: true,
        watermarkStatus: "PAID",
        storeInStorage: true,
      }
    );

    expect(result.success).toBe(true);
    expect(result.buffer?.toString("utf8", 0, 4)).toBe("%PDF");
    expect(result.pdfId).toBeDefined();
  });

  it("should store PDF and generate download token", async () => {
    const result = await generateTicketPdfPhase2(
      {
        ticketNumber: "TK999999",
        pnr: "ZZZ999",
        passengerName: "Test User",
        airline: "Royal Air",
        flightNumber: "RA999",
        route: "DAK-CDG",
        departure: "Dakar",
        departureTime: "10:00",
        arrival: "Paris",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: "500",
        taxes: "100",
        total: "600",
        currency: "MRU",
        bookingId: "BOOK999",
      },
      {
        storeInStorage: true,
      }
    );

    expect(result.token).toBeDefined();
    const pdf = PdfStorageManager.getPdfByToken(result.token!);
    expect(pdf).toBeDefined();
    expect(pdf?.bookingId).toBe("BOOK999");
  });

  it("should track download count", async () => {
    const result = await generateTicketPdfPhase2(
      {
        ticketNumber: "TK333333",
        pnr: "CCC333",
        passengerName: "Download Test",
        airline: "Royal Air",
        flightNumber: "RA333",
        route: "DAK-CDG",
        departure: "Dakar",
        departureTime: "10:00",
        arrival: "Paris",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: "500",
        taxes: "100",
        total: "600",
        currency: "MRU",
        bookingId: "BOOK333",
      },
      {
        storeInStorage: true,
      }
    );

    const token = result.token!;
    PdfStorageManager.recordDownload(token);
    PdfStorageManager.recordDownload(token);
    PdfStorageManager.recordDownload(token);

    const tokenInfo = PdfStorageManager.getTokenInfo(token);
    expect(tokenInfo?.downloadCount).toBe(3);
  });

  it("should provide storage statistics", () => {
    const stats = PdfStorageManager.getStats();

    expect(stats).toBeDefined();
    expect(stats.totalPdfs).toBeGreaterThanOrEqual(0);
    expect(stats.totalTokens).toBeGreaterThanOrEqual(0);
    expect(stats.pdfsByType).toBeDefined();
  });
});
