/**
 * PDF Logging System
 * Tracks all PDF generation, delivery, and access events
 */

export type PDFEventType = "generated" | "failed" | "sent" | "downloaded" | "viewed";
export type PDFType = "ticket" | "receipt" | "invoice" | "settlement";

export interface PDFLog {
  id: string;
  type: PDFEventType;
  pdfType: PDFType;
  bookingId?: string;
  agencyId?: string;
  userId?: string;
  timestamp: Date;
  status: "success" | "failed";
  error?: string;
  metadata?: Record<string, any>;
}

class PDFLogger {
  private logs: PDFLog[] = [];

  /**
   * Log PDF generation
   */
  logGenerated(pdfType: PDFType, bookingId: string, metadata?: Record<string, any>): void {
    const log: PDFLog = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "generated",
      pdfType,
      bookingId,
      timestamp: new Date(),
      status: "success",
      metadata,
    };
    this.logs.push(log);
    console.log(`✅ [PDF] ${pdfType} PDF generated for booking ${bookingId}`);
  }

  /**
   * Log PDF generation failure
   */
  logFailed(pdfType: PDFType, bookingId: string, error: string, metadata?: Record<string, any>): void {
    const log: PDFLog = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "failed",
      pdfType,
      bookingId,
      timestamp: new Date(),
      status: "failed",
      error,
      metadata,
    };
    this.logs.push(log);
    console.error(`❌ [PDF] ${pdfType} PDF generation failed for booking ${bookingId}: ${error}`);
  }

  /**
   * Log PDF delivery
   */
  logSent(pdfType: PDFType, bookingId: string, channel: string, recipient: string, metadata?: Record<string, any>): void {
    const log: PDFLog = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "sent",
      pdfType,
      bookingId,
      timestamp: new Date(),
      status: "success",
      metadata: {
        channel,
        recipient,
        ...metadata,
      },
    };
    this.logs.push(log);
    console.log(`✅ [PDF] ${pdfType} PDF sent via ${channel} to ${recipient}`);
  }

  /**
   * Log PDF download
   */
  logDownloaded(pdfType: PDFType, bookingId: string, userId: string, metadata?: Record<string, any>): void {
    const log: PDFLog = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "downloaded",
      pdfType,
      bookingId,
      userId,
      timestamp: new Date(),
      status: "success",
      metadata,
    };
    this.logs.push(log);
    console.log(`✅ [PDF] ${pdfType} PDF downloaded by user ${userId}`);
  }

  /**
   * Log PDF view
   */
  logViewed(pdfType: PDFType, bookingId: string, userId: string, metadata?: Record<string, any>): void {
    const log: PDFLog = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "viewed",
      pdfType,
      bookingId,
      userId,
      timestamp: new Date(),
      status: "success",
      metadata,
    };
    this.logs.push(log);
    console.log(`✅ [PDF] ${pdfType} PDF viewed by user ${userId}`);
  }

  /**
   * Get all logs
   */
  getAllLogs(): PDFLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: PDFEventType): PDFLog[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Get logs by PDF type
   */
  getLogsByPdfType(pdfType: PDFType): PDFLog[] {
    return this.logs.filter((log) => log.pdfType === pdfType);
  }

  /**
   * Get logs by booking ID
   */
  getLogsByBookingId(bookingId: string): PDFLog[] {
    return this.logs.filter((log) => log.bookingId === bookingId);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<PDFType, number>;
    recentErrors: PDFLog[];
  } {
    const failedLogs = this.logs.filter((log) => log.status === "failed");
    const errorsByType: Record<PDFType, number> = {
      ticket: 0,
      receipt: 0,
      invoice: 0,
      settlement: 0,
    };

    failedLogs.forEach((log) => {
      errorsByType[log.pdfType]++;
    });

    return {
      totalErrors: failedLogs.length,
      errorsByType,
      recentErrors: failedLogs.slice(-10),
    };
  }

  /**
   * Clear logs (for testing)
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const pdfLogger = new PDFLogger();
