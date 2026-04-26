/**
 * S3/R2 Cloud Storage Provider
 * Supports Amazon S3 and Cloudflare R2 (S3-compatible)
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CloudStorageProvider } from "../types";

export class S3CloudStorageProvider implements CloudStorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;
  private providerName: "s3" | "r2";

  constructor(providerName: "s3" | "r2" = "s3") {
    this.providerName = providerName;
    this.bucket = process.env.PDF_STORAGE_BUCKET || "";

    // Validate bucket
    if (!this.bucket) {
      throw new Error("PDF_STORAGE_BUCKET is required for S3/R2 storage");
    }

    // Validate credentials
    const accessKeyId = process.env.PDF_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.PDF_S3_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("PDF_S3_ACCESS_KEY_ID and PDF_S3_SECRET_ACCESS_KEY are required");
    }

    // Get public base URL
    this.publicBaseUrl = process.env.PDF_STORAGE_PUBLIC_BASE_URL || "";

    // Configure S3 client
    const config: any = {
      region: process.env.PDF_STORAGE_REGION || "us-east-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    // For R2, use custom endpoint
    if (providerName === "r2") {
      const endpoint = process.env.PDF_STORAGE_ENDPOINT;
      if (!endpoint) {
        throw new Error("PDF_STORAGE_ENDPOINT is required for R2 storage");
      }
      config.endpoint = endpoint;
      config.forcePathStyle = true;
    }

    this.client = new S3Client(config);
  }

  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
        Metadata: metadata ? this.sanitizeMetadata(metadata) : undefined,
      });

      await this.client.send(command);

      // Return public URL if configured, otherwise return signed URL
      if (this.publicBaseUrl) {
        return `${this.publicBaseUrl}/${key}`;
      }

      // Generate signed URL (24 hour expiration)
      return await this.generateSignedUrl(key, 24 * 60 * 60);
    } catch (error) {
      throw new Error(`Failed to upload PDF to ${this.providerName}: ${error}`);
    }
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        return null;
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body as any;

      for await (const chunk of reader) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      // Return null if file not found
      if (error.name === "NoSuchKey") {
        return null;
      }
      throw new Error(`Failed to download PDF from ${this.providerName}: ${error}`);
    }
  }

  async deletePdf(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete PDF from ${this.providerName}: ${error}`);
    }
  }

  async generateSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: expirationSeconds,
      });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  getProviderName(): string {
    return this.providerName;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test connection by listing objects
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: ".test",
      });

      // We expect this to fail (file doesn't exist), but it proves connectivity
      try {
        await this.client.send(command);
      } catch (error: any) {
        // NoSuchKey is expected - means bucket is accessible
        if (error.name === "NoSuchKey") {
          return true;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`[S3CloudStorage] Connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * Sanitize metadata to S3 requirements
   * S3 metadata values must be strings
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "string") {
        sanitized[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        sanitized[key] = String(value);
      } else if (value !== null && value !== undefined) {
        sanitized[key] = JSON.stringify(value);
      }
    }

    return sanitized;
  }
}
