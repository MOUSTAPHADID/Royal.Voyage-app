/**
 * Real PDF Ticket Generator (PDFKit-based)
 * Replaces text-based generator with professional PDF output
 */

import PDFDocument from "pdfkit";

// Brand colors
const NAVY = "#1B2B5E";
const GOLD = "#C9A84C";
const WHITE = "#FFFFFF";
const GRAY = "#64748B";
const BORDER = "#E2E8F0";

// Page dimensions
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export interface TicketPdfData {
  bookingId: string;
  ticketNumber: string;
  pnr: string;
  passengerName: string;
  passengerEmail: string;
  airline: string;
  flightNumber: string;
  route: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  baggage?: string;
  fare: number;
  taxes: number;
  total: number;
  currency: string;
  agencyName?: string;
  issueDate: string;
}

export interface PdfResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

/**
 * Generate ticket PDF with PDFKit
 */
export async function generateTicketPdf(data: TicketPdfData): Promise<PdfResult> {
  return new Promise((resolve) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          success: true,
          buffer: Buffer.concat(chunks),
        });
      });
      doc.on("error", (error) => {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "PDF generation failed",
        });
      });

      // Header
      doc.rect(0, 0, PAGE_WIDTH, 80).fill(NAVY);
      doc.fillColor(GOLD).fontSize(24).font("Helvetica-Bold")
        .text("ROYAL VOYAGE", MARGIN, 15, { width: CONTENT_WIDTH, align: "center" });
      doc.fillColor(WHITE).fontSize(11).font("Helvetica")
        .text("FLIGHT TICKET / BOARDING PASS", MARGIN, 45, { width: CONTENT_WIDTH, align: "center" });

      // Ticket info box
      let y = 100;
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("BOOKING INFORMATION", MARGIN, y);
      y += 20;

      const infoData = [
        ["Booking ID", data.bookingId],
        ["Ticket Number", data.ticketNumber],
        ["PNR", data.pnr],
        ["Issue Date", data.issueDate],
      ];

      infoData.forEach(([label, value]) => {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text(label, MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(value, MARGIN + 150, y);
        y += 18;
      });

      // Passenger section
      y += 10;
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("PASSENGER", MARGIN, y);
      y += 18;
      doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold")
        .text(data.passengerName.toUpperCase(), MARGIN, y);
      y += 20;

      // Flight section
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("FLIGHT DETAILS", MARGIN, y);
      y += 18;

      const flightData = [
        ["Airline", data.airline],
        ["Flight Number", data.flightNumber],
        ["Route", data.route],
        ["Departure", `${data.departure} at ${data.departureTime}`],
        ["Arrival", `${data.arrival} at ${data.arrivalTime}`],
      ];

      flightData.forEach(([label, value]) => {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text(label, MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(value, MARGIN + 150, y);
        y += 18;
      });

      if (data.baggage) {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text("Baggage", MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(data.baggage, MARGIN + 150, y);
        y += 18;
      }

      // Fare section
      y += 10;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(GOLD);
      y += 15;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Fare", MARGIN, y);
      doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold")
        .text(`${data.fare} ${data.currency}`, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Taxes & Fees", MARGIN, y);
      doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold")
        .text(`${data.taxes} ${data.currency}`, MARGIN + 150, y);
      y += 18;

      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(BORDER);
      y += 12;

      doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold")
        .text("TOTAL", MARGIN, y);
      doc.fillColor(GOLD).fontSize(14).font("Helvetica-Bold")
        .text(`${data.total} ${data.currency}`, MARGIN + 150, y);

      // Footer
      y = PAGE_HEIGHT - 60;
      doc.rect(0, y - 10, PAGE_WIDTH, 1).fill(BORDER);
      doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text("Royal Voyage | +222 33 70 00 00 | suporte@royalvoyage.online | royalvoyage.online", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });
      doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text("This ticket is valid only for the specified passenger and flight.", MARGIN, y + 12, { width: CONTENT_WIDTH, align: "center" });

      doc.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

/**
 * Generate payment receipt PDF
 */
export async function generatePaymentReceiptPdf(data: {
  bookingId: string;
  paymentId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  customerName: string;
  customerEmail: string;
  date: string;
}): Promise<PdfResult> {
  return new Promise((resolve) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          success: true,
          buffer: Buffer.concat(chunks),
        });
      });
      doc.on("error", (error) => {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "PDF generation failed",
        });
      });

      // Header
      doc.rect(0, 0, PAGE_WIDTH, 80).fill(NAVY);
      doc.fillColor(GOLD).fontSize(24).font("Helvetica-Bold")
        .text("ROYAL VOYAGE", MARGIN, 15, { width: CONTENT_WIDTH, align: "center" });
      doc.fillColor(WHITE).fontSize(11).font("Helvetica")
        .text("PAYMENT RECEIPT", MARGIN, 45, { width: CONTENT_WIDTH, align: "center" });

      let y = 100;

      // Receipt details
      const receiptData = [
        ["Receipt ID", data.paymentId],
        ["Booking ID", data.bookingId],
        ["Date", data.date],
        ["Status", data.status.toUpperCase()],
        ["Payment Method", data.method],
      ];

      receiptData.forEach(([label, value]) => {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text(label, MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(value, MARGIN + 150, y);
        y += 18;
      });

      // Customer info
      y += 10;
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("CUSTOMER", MARGIN, y);
      y += 18;
      doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold")
        .text(data.customerName, MARGIN, y);
      y += 18;
      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text(data.customerEmail, MARGIN, y);

      // Amount
      y += 30;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(GOLD);
      y += 15;
      doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold")
        .text("AMOUNT PAID", MARGIN, y);
      doc.fillColor(GOLD).fontSize(16).font("Helvetica-Bold")
        .text(`${data.amount} ${data.currency}`, MARGIN + 150, y);

      // Footer
      y = PAGE_HEIGHT - 60;
      doc.rect(0, y - 10, PAGE_WIDTH, 1).fill(BORDER);
      doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text("Royal Voyage | +222 33 70 00 00 | suporte@royalvoyage.online | royalvoyage.online", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });

      doc.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

/**
 * Generate invoice PDF
 */
export async function generateInvoicePdf(data: {
  invoiceId: string;
  bookingId: string;
  agencyName: string;
  date: string;
  items: Array<{ description: string; amount: number }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}): Promise<PdfResult> {
  return new Promise((resolve) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          success: true,
          buffer: Buffer.concat(chunks),
        });
      });
      doc.on("error", (error) => {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "PDF generation failed",
        });
      });

      // Header
      doc.rect(0, 0, PAGE_WIDTH, 80).fill(NAVY);
      doc.fillColor(GOLD).fontSize(24).font("Helvetica-Bold")
        .text("ROYAL VOYAGE", MARGIN, 15, { width: CONTENT_WIDTH, align: "center" });
      doc.fillColor(WHITE).fontSize(11).font("Helvetica")
        .text("INVOICE", MARGIN, 45, { width: CONTENT_WIDTH, align: "center" });

      let y = 100;

      // Invoice info
      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Invoice ID", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.invoiceId, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Booking ID", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.bookingId, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Date", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.date, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Agency", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.agencyName, MARGIN + 150, y);

      // Items
      y += 30;
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("ITEMS", MARGIN, y);
      y += 18;

      data.items.forEach((item) => {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text(item.description, MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(`${item.amount} ${data.currency}`, MARGIN + 350, y);
        y += 18;
      });

      // Totals
      y += 10;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(BORDER);
      y += 12;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Subtotal", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(`${data.subtotal} ${data.currency}`, MARGIN + 350, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Tax", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(`${data.tax} ${data.currency}`, MARGIN + 350, y);
      y += 18;

      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(GOLD);
      y += 12;

      doc.fillColor(NAVY).fontSize(12).font("Helvetica-Bold")
        .text("TOTAL", MARGIN, y);
      doc.fillColor(GOLD).fontSize(14).font("Helvetica-Bold")
        .text(`${data.total} ${data.currency}`, MARGIN + 350, y);

      // Footer
      y = PAGE_HEIGHT - 60;
      doc.rect(0, y - 10, PAGE_WIDTH, 1).fill(BORDER);
      doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text("Royal Voyage | +222 33 70 00 00 | suporte@royalvoyage.online | royalvoyage.online", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });

      doc.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

/**
 * Generate settlement report PDF
 */
export async function generateSettlementReportPdf(data: {
  reportId: string;
  agencyName: string;
  period: string;
  sales: number;
  commission: number;
  markup: number;
  walletBalance: number;
  creditUsed: number;
  amountDueToRoyalVoyage: number;
  amountDueToAgency: number;
  currency: string;
}): Promise<PdfResult> {
  return new Promise((resolve) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          success: true,
          buffer: Buffer.concat(chunks),
        });
      });
      doc.on("error", (error) => {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "PDF generation failed",
        });
      });

      // Header
      doc.rect(0, 0, PAGE_WIDTH, 80).fill(NAVY);
      doc.fillColor(GOLD).fontSize(24).font("Helvetica-Bold")
        .text("ROYAL VOYAGE", MARGIN, 15, { width: CONTENT_WIDTH, align: "center" });
      doc.fillColor(WHITE).fontSize(11).font("Helvetica")
        .text("SETTLEMENT REPORT", MARGIN, 45, { width: CONTENT_WIDTH, align: "center" });

      let y = 100;

      // Report info
      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Report ID", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.reportId, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Agency", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.agencyName, MARGIN + 150, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Period", MARGIN, y);
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text(data.period, MARGIN + 150, y);

      // Summary
      y += 30;
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("SUMMARY", MARGIN, y);
      y += 18;

      const summaryData = [
        ["Sales", `${data.sales} ${data.currency}`],
        ["Commission", `${data.commission} ${data.currency}`],
        ["Markup", `${data.markup} ${data.currency}`],
        ["Wallet Balance", `${data.walletBalance} ${data.currency}`],
        ["Credit Used", `${data.creditUsed} ${data.currency}`],
      ];

      summaryData.forEach(([label, value]) => {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
          .text(label, MARGIN, y);
        doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
          .text(value, MARGIN + 250, y);
        y += 18;
      });

      // Settlement
      y += 20;
      doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(GOLD);
      y += 15;

      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("SETTLEMENT", MARGIN, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Amount Due to Royal Voyage", MARGIN, y);
      doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold")
        .text(`${data.amountDueToRoyalVoyage} ${data.currency}`, MARGIN + 250, y);
      y += 18;

      doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Amount Due to Agency", MARGIN, y);
      doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold")
        .text(`${data.amountDueToAgency} ${data.currency}`, MARGIN + 250, y);

      // Footer
      y = PAGE_HEIGHT - 60;
      doc.rect(0, y - 10, PAGE_WIDTH, 1).fill(BORDER);
      doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text("Royal Voyage | +222 33 70 00 00 | suporte@royalvoyage.online | royalvoyage.online", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });

      doc.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
