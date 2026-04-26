/**
 * PDF Generator Phase 2
 * Enhanced with Arabic/RTL support, QR codes, watermarks, and storage integration
 */

import PDFDocument from "pdfkit";
import * as QRCode from "qrcode";
import { PdfStorageManager } from "../pdf/storage";
import { pdfLogger } from "./pdf-logger";

export interface PdfGeneratorOptions {
  includeArabic?: boolean;
  includeQrCode?: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
  watermarkStatus?: "PAID" | "PENDING" | "CANCELLED" | "REFUNDED" | "DRAFT";
  storeInStorage?: boolean;
}

/**
 * Add Arabic text to PDF with RTL support
 */
function addArabicText(
  doc: typeof PDFDocument,
  text: string,
  x: number,
  y: number,
  options: any = {}
): void {
  // PDFKit doesn't have built-in RTL support, so we reverse the text
  // In production, use a library like bidi.js for proper bidirectional text
  const reversedText = text.split("").reverse().join("");

  doc.text(reversedText, x, y, {
    align: options.align || "right",
    ...options,
  });
}

/**
 * Add QR code to PDF
 */
async function addQrCode(
  doc: any,
  data: string,
  x: number,
  y: number,
  size: number = 100
): Promise<void> {
  try {
    const qrImage = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H" as any,
      type: "image/png" as any,
      margin: 1,
      width: size,
    } as any);

    doc.image(qrImage as any, x, y, { width: size, height: size })
  } catch (error) {
    console.warn(`[PDF] Failed to generate QR code: ${error}`);
  }
}

/**
 * Add watermark to PDF
 */
function addWatermark(
  doc: typeof PDFDocument,
  status: "PAID" | "PENDING" | "CANCELLED" | "REFUNDED" | "DRAFT"
): void {
  const colors: Record<string, string> = {
    PAID: "#22C55E",
    PENDING: "#F59E0B",
    CANCELLED: "#EF4444",
    REFUNDED: "#3B82F6",
    DRAFT: "#9CA3AF",
  };

  const color = colors[status] || "#9CA3AF";

  // Add diagonal watermark text
  doc.save();
  doc.opacity(0.15);
  doc.rotate(45, { origin: [300, 400] });
  doc.fontSize(60).font("Helvetica-Bold").fillColor(color).text(status, 100, 300);
  doc.restore();
}

/**
 * Generate Ticket PDF with Arabic/RTL support
 */
export async function generateTicketPdfPhase2(
  data: any,
  options: PdfGeneratorOptions = {}
): Promise<{ success: boolean; buffer?: Buffer; pdfId?: string; token?: string; error?: string }> {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Header with branding
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1B2B5E")
      .text("ROYAL VOYAGE", 50, 50);

    if (options.includeArabic) {
      addArabicText(doc, "رويال فويج", 500, 50, { fontSize: 24 });
    }

    doc.fontSize(10).fillColor("#666666").text("تذكرة الرحلة", 50, 85);

    // Ticket details
    doc.fontSize(12).fillColor("#000000");
    doc.text(`Ticket Number: ${data.ticketNumber}`, 50, 120);
    doc.text(`PNR: ${data.pnr}`, 50, 140);
    doc.text(`Passenger: ${data.passengerName}`, 50, 160);
    doc.text(`Airline: ${data.airline}`, 50, 180);
    doc.text(`Flight: ${data.flightNumber}`, 50, 200);
    doc.text(`Route: ${data.route}`, 50, 220);
    doc.text(`Departure: ${data.departure} - ${data.departureTime}`, 50, 240);
    doc.text(`Arrival: ${data.arrival} - ${data.arrivalTime}`, 50, 260);
    if (data.baggage) {
      doc.text(`Baggage: ${data.baggage}`, 50, 280);
    }

    // Pricing
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text(`Fare: ${data.currency} ${data.fare}`, 50, 320);
    doc.text(`Taxes: ${data.currency} ${data.taxes}`, 50, 340);
    doc.text(`Total: ${data.currency} ${data.total}`, 50, 360);

    // QR Code
    if (options.includeQrCode) {
      const qrData = `${data.ticketNumber}|${data.pnr}|${data.bookingId}`;
      await addQrCode(doc, qrData, 400, 120, 80);
    }

    // Watermark
    if (options.watermarkStatus) {
      addWatermark(doc, options.watermarkStatus);
    }

    // Footer
    doc.fontSize(9).fillColor("#999999");
    doc.text("ROYAL VOYAGE", 50, 750);
    doc.text("Phone: +22233700000 | Email: suporte@royalvoyage.online", 50, 765);
    doc.text("Website: royalvoyage.online", 50, 780);

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", async () => {
        const buffer = Buffer.concat(buffers);

        if (options.storeInStorage) {
          const pdfId = PdfStorageManager.storePdf(
            buffer,
            "ticket",
            data.bookingId,
            `ticket_${data.ticketNumber}.pdf`
          );
          const token = PdfStorageManager.generateDownloadToken(
            pdfId,
            data.bookingId
          );

          pdfLogger.logGenerated("ticket", data.bookingId, {
            ticketNumber: data.ticketNumber,
            pdfId,
          });

          resolve({ success: true, buffer, pdfId, token });
        } else {
          pdfLogger.logGenerated("ticket", data.bookingId, {
            ticketNumber: data.ticketNumber,
          });
          resolve({ success: true, buffer });
        }
      });
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    pdfLogger.logFailed("ticket", data.bookingId, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Generate Payment Receipt PDF with watermark
 */
export async function generatePaymentReceiptPdfPhase2(
  data: any,
  options: PdfGeneratorOptions = {}
): Promise<{ success: boolean; buffer?: Buffer; pdfId?: string; token?: string; error?: string }> {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1B2B5E")
      .text("ROYAL VOYAGE", 50, 50);

    doc.fontSize(14).fillColor("#C9A84C").text("PAYMENT RECEIPT", 50, 85);

    // Receipt details
    doc.fontSize(11).fillColor("#000000");
    doc.text(`Receipt ID: ${data.paymentId}`, 50, 130);
    doc.text(`Booking ID: ${data.bookingId}`, 50, 150);
    doc.text(`Date: ${data.date}`, 50, 170);
    doc.text(`Customer: ${data.customerName}`, 50, 190);
    doc.text(`Email: ${data.customerEmail}`, 50, 210);

    // Amount
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Amount: ${data.currency} ${data.amount}`, 50, 250);
    doc.text(`Payment Method: ${data.method}`, 50, 270);
    doc.text(`Status: ${data.status.toUpperCase()}`, 50, 290);

    // Watermark
    if (options.watermarkStatus) {
      addWatermark(doc, options.watermarkStatus);
    }

    // Footer
    doc.fontSize(9).fillColor("#999999");
    doc.text("ROYAL VOYAGE", 50, 750);
    doc.text("Phone: +22233700000 | Email: suporte@royalvoyage.online", 50, 765);

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", async () => {
        const buffer = Buffer.concat(buffers);

        if (options.storeInStorage) {
          const pdfId = PdfStorageManager.storePdf(
            buffer,
            "receipt",
            data.bookingId,
            `receipt_${data.paymentId}.pdf`
          );
          const token = PdfStorageManager.generateDownloadToken(
            pdfId,
            data.bookingId
          );

          pdfLogger.logGenerated("receipt", data.bookingId, { paymentId: data.paymentId, pdfId });

          resolve({ success: true, buffer, pdfId, token });
        } else {
          pdfLogger.logGenerated("receipt", data.bookingId, { paymentId: data.paymentId });
          resolve({ success: true, buffer });
        }
      });
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    pdfLogger.logFailed("receipt", data.bookingId, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Generate Invoice PDF with watermark
 */
export async function generateInvoicePdfPhase2(
  data: any,
  options: PdfGeneratorOptions = {}
): Promise<{ success: boolean; buffer?: Buffer; pdfId?: string; token?: string; error?: string }> {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1B2B5E")
      .text("ROYAL VOYAGE", 50, 50);

    doc.fontSize(14).fillColor("#C9A84C").text("INVOICE", 50, 85);

    // Invoice details
    doc.fontSize(11).fillColor("#000000");
    doc.text(`Invoice ID: ${data.invoiceId}`, 50, 130);
    doc.text(`Booking ID: ${data.bookingId}`, 50, 150);
    doc.text(`Agency: ${data.agencyName}`, 50, 170);
    doc.text(`Date: ${data.date}`, 50, 190);

    // Items
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Description", 50, 230);
    doc.text("Amount", 450, 230);

    doc.fontSize(10).font("Helvetica");
    let y = 250;
    for (const item of data.items) {
      doc.text(item.description, 50, y);
      doc.text(`${data.currency} ${item.amount}`, 450, y);
      y += 20;
    }

    // Totals
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text(`Subtotal: ${data.currency} ${data.subtotal}`, 50, y + 20);
    doc.text(`Tax: ${data.currency} ${data.tax}`, 50, y + 40);
    doc.text(`Total: ${data.currency} ${data.total}`, 50, y + 60);

    // Watermark
    if (options.watermarkStatus) {
      addWatermark(doc, options.watermarkStatus);
    }

    // Footer
    doc.fontSize(9).fillColor("#999999");
    doc.text("ROYAL VOYAGE", 50, 750);
    doc.text("Phone: +22233700000 | Email: suporte@royalvoyage.online", 50, 765);

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", async () => {
        const buffer = Buffer.concat(buffers);

        if (options.storeInStorage) {
          const pdfId = PdfStorageManager.storePdf(
            buffer,
            "invoice",
            data.bookingId,
            `invoice_${data.invoiceId}.pdf`
          );
          const token = PdfStorageManager.generateDownloadToken(
            pdfId,
            data.bookingId
          );

          pdfLogger.logGenerated("invoice", data.bookingId, { invoiceId: data.invoiceId, pdfId });

          resolve({ success: true, buffer, pdfId, token });
        } else {
          pdfLogger.logGenerated("invoice", data.bookingId, { invoiceId: data.invoiceId });
          resolve({ success: true, buffer });
        }
      });
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    pdfLogger.logFailed("invoice", data.bookingId, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Generate Settlement Report PDF with QR code
 */
export async function generateSettlementReportPdfPhase2(
  data: any,
  options: PdfGeneratorOptions = {}
): Promise<{ success: boolean; buffer?: Buffer; pdfId?: string; token?: string; error?: string }> {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1B2B5E")
      .text("ROYAL VOYAGE", 50, 50);

    doc.fontSize(14).fillColor("#C9A84C").text("SETTLEMENT REPORT", 50, 85);

    // Report details
    doc.fontSize(11).fillColor("#000000");
    doc.text(`Report ID: ${data.reportId}`, 50, 130);
    doc.text(`Agency: ${data.agencyName}`, 50, 150);
    doc.text(`Period: ${data.period}`, 50, 170);

    // Financial summary
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("FINANCIAL SUMMARY", 50, 210);

    doc.fontSize(10).font("Helvetica");
    doc.text(`Sales: ${data.currency} ${data.sales}`, 50, 235);
    doc.text(`Commission: ${data.currency} ${data.commission}`, 50, 255);
    doc.text(`Markup: ${data.currency} ${data.markup}`, 50, 275);
    doc.text(`Wallet Balance: ${data.currency} ${data.walletBalance}`, 50, 295);
    doc.text(`Credit Used: ${data.currency} ${data.creditUsed}`, 50, 315);

    // Settlement amounts
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("SETTLEMENT AMOUNTS", 50, 355);

    doc.fontSize(10).font("Helvetica");
    doc.text(
      `Amount Due to Royal Voyage: ${data.currency} ${data.amountDueToRoyalVoyage}`,
      50,
      380
    );
    doc.text(
      `Amount Due to Agency: ${data.currency} ${data.amountDueToAgency}`,
      50,
      400
    );

    // QR Code
    if (options.includeQrCode) {
      const qrData = `${data.reportId}|${data.agencyName}|${data.period}`;
      await addQrCode(doc, qrData, 350, 130, 100);
    }

    // Watermark
    if (options.watermarkStatus) {
      addWatermark(doc, options.watermarkStatus);
    }

    // Footer
    doc.fontSize(9).fillColor("#999999");
    doc.text("ROYAL VOYAGE", 50, 750);
    doc.text("Phone: +22233700000 | Email: suporte@royalvoyage.online", 50, 765);

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", async () => {
        const buffer = Buffer.concat(buffers);

        if (options.storeInStorage) {
          const pdfId = PdfStorageManager.storePdf(
            buffer,
            "settlement",
            data.reportId,
            `settlement_${data.reportId}.pdf`
          );
          const token = PdfStorageManager.generateDownloadToken(
            pdfId,
            data.reportId
          );

          pdfLogger.logGenerated("settlement", data.reportId, { reportId: data.reportId, pdfId });

          resolve({ success: true, buffer, pdfId, token });
        } else {
          pdfLogger.logGenerated("settlement", data.reportId, { reportId: data.reportId });
          resolve({ success: true, buffer });
        }
      });
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    pdfLogger.logFailed("settlement", data.reportId, errorMsg);
    return { success: false, error: errorMsg };
  }
}
