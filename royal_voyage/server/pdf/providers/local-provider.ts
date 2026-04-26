/**
 * Local Storage Adapter
 * Fallback for when cloud storage is not available
 */

import * as fs from "fs/promises";
import * as path from "path";
import { CloudStorageProvider } from "../types";

const LOCAL_STORAGE_DIR = process.env.PDF_LOCAL_STORAGE_DIR || "/tmp/royal_voyage_pdfs";

export class LocalStorageAdapter implements CloudStorageProvider {
  constructor() {
    // Ensure storage directory exists
    this.ensureStorageDir().catch((error) => {
      console.error(`[LocalStorage] Failed to create storage directory: ${error}`);
    });
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
    } catch (error) {
      console.error(`[LocalStorage] Failed to create directory: ${error}`);
    }
  }

  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const filePath = path.join(LOCAL_STORAGE_DIR, key);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, buffer);

      // Return local reference URL
      return `/api/pdf/local/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload PDF to local storage: ${error}`);
    }
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(LOCAL_STORAGE_DIR, key);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return null;
      }

      // Read file
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to download PDF from local storage: ${error}`);
    }
  }

  async deletePdf(key: string): Promise<boolean> {
    try {
      const filePath = path.join(LOCAL_STORAGE_DIR, key);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return true; // Already deleted
      }

      // Delete file
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete PDF from local storage: ${error}`);
    }
  }

  async generateSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    // Local storage doesn't support signed URLs
    // Return a reference URL that requires token validation
    return `/api/pdf/local/${key}`;
  }

  getProviderName(): string {
    return "local";
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureStorageDir();
      return true;
    } catch (error) {
      console.error(`[LocalStorage] Not available: ${error}`);
      return false;
    }
  }
}
