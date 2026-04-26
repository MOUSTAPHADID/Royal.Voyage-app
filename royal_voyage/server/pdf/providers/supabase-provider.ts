/**
 * Supabase Storage Provider
 * Uses Supabase Storage API for PDF storage
 */

import { createClient } from "@supabase/supabase-js";
import { CloudStorageProvider } from "../types";

export class SupabaseCloudStorageProvider implements CloudStorageProvider {
  private supabase: any;
  private bucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = process.env.PDF_STORAGE_BUCKET || "royal-voyage-pdfs";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(key, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Generate signed URL (24 hour expiration)
      return await this.generateSignedUrl(key, 24 * 60 * 60);
    } catch (error) {
      throw new Error(`Failed to upload PDF to Supabase: ${error}`);
    }
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .download(key);

      if (error) {
        // Return null if file not found
        if (error.statusCode === 404) {
          return null;
        }
        throw error;
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`Failed to download PDF from Supabase: ${error}`);
    }
  }

  async deletePdf(key: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([key]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete PDF from Supabase: ${error}`);
    }
  }

  async generateSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(key, expirationSeconds);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  getProviderName(): string {
    return "supabase";
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test connection by listing objects
      const { error } = await this.supabase.storage.from(this.bucket).list("", {
        limit: 1,
      });

      if (error) {
        console.error(`[SupabaseStorage] Connection test failed: ${error}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[SupabaseStorage] Connection test failed: ${error}`);
      return false;
    }
  }
}
