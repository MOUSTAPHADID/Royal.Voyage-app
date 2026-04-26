/**
 * PDF Storage Engine
 * Manages PDF storage, retrieval, and access control
 * Local skeleton - can be extended to S3 later
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface PdfStorageConfig {
  storagePath: string;
  tokenExpiration: number; // milliseconds
  maxDownloads?: number;
}

export interface PdfToken {
  token: string;
  pdfId: string;
  createdAt: number;
  expiresAt: number;
  maxDownloads?: number;
  downloadCount: number;
  userId?: string;
  agencyId?: string;
  partnerId?: string;
  bookingId: string;
}

export interface StoredPdf {
  pdfId: string;
  filename: string;
  type: "ticket" | "receipt" | "invoice" | "settlement";
  bookingId: string;
  createdAt: number;
  size: number;
  buffer: Buffer;
}

/**
 * PDF Storage Manager
 */
export class PdfStorageManager {
  private static config: PdfStorageConfig = {
    storagePath: process.env.PDF_STORAGE_PATH || "/tmp/royal_voyage_pdfs",
    tokenExpiration: parseInt(process.env.PDF_TOKEN_EXPIRATION || "3600000"), // 1 hour default
    maxDownloads: 5,
  };

  private static tokens: Map<string, PdfToken> = new Map();
  private static pdfs: Map<string, StoredPdf> = new Map();

  /**
   * Initialize storage directory
   */
  static initialize(): void {
    if (!fs.existsSync(this.config.storagePath)) {
      fs.mkdirSync(this.config.storagePath, { recursive: true });
    }
  }

  /**
   * Store PDF and return storage ID
   */
  static storePdf(
    buffer: Buffer,
    pdfType: "ticket" | "receipt" | "invoice" | "settlement",
    bookingId: string,
    filename?: string
  ): string {
    this.initialize();

    const pdfId = this.generateId();
    const finalFilename = filename || `${pdfType}_${pdfId}.pdf`;
    const filepath = path.join(this.config.storagePath, finalFilename);

    // Store in memory (can be extended to file system or S3)
    this.pdfs.set(pdfId, {
      pdfId,
      filename: finalFilename,
      type: pdfType,
      bookingId,
      createdAt: Date.now(),
      size: buffer.length,
      buffer,
    });

    // Also save to file system for persistence
    try {
      fs.writeFileSync(filepath, buffer);
    } catch (error) {
      console.warn(`[PDF Storage] Failed to save PDF to file: ${error}`);
    }

    return pdfId;
  }

  /**
   * Generate download token for PDF
   */
  static generateDownloadToken(
    pdfId: string,
    bookingId: string,
    userId?: string,
    agencyId?: string,
    partnerId?: string
  ): string {
    const token = this.generateSecureToken();
    const now = Date.now();

    this.tokens.set(token, {
      token,
      pdfId,
      createdAt: now,
      expiresAt: now + this.config.tokenExpiration,
      maxDownloads: this.config.maxDownloads,
      downloadCount: 0,
      userId,
      agencyId,
      partnerId,
      bookingId,
    });

    return token;
  }

  /**
   * Validate and retrieve PDF by token
   */
  static getPdfByToken(token: string): StoredPdf | null {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return null;
    }

    // Check expiration
    if (Date.now() > tokenData.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    // Check download limit
    if (
      tokenData.maxDownloads &&
      tokenData.downloadCount >= tokenData.maxDownloads
    ) {
      return null;
    }

    const pdf = this.pdfs.get(tokenData.pdfId);
    if (!pdf) {
      return null;
    }

    return pdf;
  }

  /**
   * Record download and increment counter
   */
  static recordDownload(token: string): boolean {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return false;
    }

    tokenData.downloadCount++;
    return true;
  }

  /**
   * Verify access control
   */
  static verifyAccess(
    token: string,
    userId?: string,
    agencyId?: string,
    partnerId?: string
  ): boolean {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return false;
    }

    // Check user access
    if (userId && tokenData.userId && tokenData.userId !== userId) {
      return false;
    }

    // Check agency access
    if (agencyId && tokenData.agencyId && tokenData.agencyId !== agencyId) {
      return false;
    }

    // Check partner access
    if (partnerId && tokenData.partnerId && tokenData.partnerId !== partnerId) {
      return false;
    }

    return true;
  }

  /**
   * Get PDF by ID (admin only)
   */
  static getPdfById(pdfId: string): StoredPdf | null {
    return this.pdfs.get(pdfId) || null;
  }

  /**
   * Get token info (admin only)
   */
  static getTokenInfo(token: string): PdfToken | null {
    return this.tokens.get(token) || null;
  }

  /**
   * Get storage statistics
   */
  static getStats() {
    return {
      totalPdfs: this.pdfs.size,
      totalTokens: this.tokens.size,
      totalSize: Array.from(this.pdfs.values()).reduce(
        (sum, pdf) => sum + pdf.size,
        0
      ),
      pdfsByType: {
        ticket: Array.from(this.pdfs.values()).filter((p) => p.type === "ticket")
          .length,
        receipt: Array.from(this.pdfs.values()).filter((p) => p.type === "receipt")
          .length,
        invoice: Array.from(this.pdfs.values()).filter((p) => p.type === "invoice")
          .length,
        settlement: Array.from(this.pdfs.values()).filter(
          (p) => p.type === "settlement"
        ).length,
      },
      validTokens: Array.from(this.tokens.values()).filter(
        (t) => Date.now() <= t.expiresAt
      ).length,
      expiredTokens: Array.from(this.tokens.values()).filter(
        (t) => Date.now() > t.expiresAt
      ).length,
    };
  }

  /**
   * Clean up expired tokens
   */
  static cleanupExpiredTokens(): number {
    let count = 0;
    const now = Date.now();

    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(token);
        count++;
      }
    }

    return count;
  }

  /**
   * Delete PDF (admin only)
   */
  static deletePdf(pdfId: string): boolean {
    const pdf = this.pdfs.get(pdfId);
    if (!pdf) {
      return false;
    }

    this.pdfs.delete(pdfId);

    // Try to delete file
    try {
      const filepath = path.join(this.config.storagePath, pdf.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.warn(`[PDF Storage] Failed to delete PDF file: ${error}`);
    }

    return true;
  }

  /**
   * Generate secure random ID
   */
  private static generateId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Generate secure token
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}

// Initialize on module load
PdfStorageManager.initialize();
