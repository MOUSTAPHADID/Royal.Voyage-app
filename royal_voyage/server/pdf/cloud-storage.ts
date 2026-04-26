/**
 * Cloud Storage Adapter
 * Skeleton for S3/R2/Supabase with safe fallback to local storage
 */

import {
  getCloudStorageConfig,
  isCloudStorageConfigured,
  logCloudStorageInit,
} from "./cloud-config";

/**
 * Cloud Storage Interface
 * Placeholder for future cloud implementations
 */
export interface ICloudStorage {
  /**
   * Upload PDF to cloud storage
   * Returns: public URL or signed URL
   */
  uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string>;

  /**
   * Download PDF from cloud storage
   */
  downloadPdf(key: string): Promise<Buffer | null>;

  /**
   * Delete PDF from cloud storage
   */
  deletePdf(key: string): Promise<boolean>;

  /**
   * Get storage provider name
   */
  getProviderName(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Local Storage Adapter (Fallback)
 */
class LocalStorageAdapter implements ICloudStorage {
  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    // Local storage returns a reference URL
    // In production, this would be served by the app
    return `/api/pdf/local/${key}`;
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    // Placeholder - actual implementation in storage.ts
    return null;
  }

  async deletePdf(key: string): Promise<boolean> {
    return true;
  }

  getProviderName(): string {
    return "local";
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * S3/R2 Cloud Storage Adapter (Skeleton)
 * Ready for implementation
 */
class S3CloudStorageAdapter implements ICloudStorage {
  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    // TODO: Implement S3 upload
    // - Use AWS SDK
    // - Create signed URL
    // - Return public URL
    console.warn("[S3CloudStorage] Not yet implemented - using fallback");
    return `/api/pdf/local/${key}`;
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    // TODO: Implement S3 download
    console.warn("[S3CloudStorage] Not yet implemented");
    return null;
  }

  async deletePdf(key: string): Promise<boolean> {
    // TODO: Implement S3 delete
    console.warn("[S3CloudStorage] Not yet implemented");
    return true;
  }

  getProviderName(): string {
    return "s3";
  }

  async isAvailable(): Promise<boolean> {
    // Check if S3 credentials are available
    return !!(
      process.env.PDF_S3_ACCESS_KEY_ID &&
      process.env.PDF_S3_SECRET_ACCESS_KEY &&
      process.env.PDF_STORAGE_BUCKET
    );
  }
}

/**
 * Cloudflare R2 Cloud Storage Adapter (Skeleton)
 * Ready for implementation
 */
class R2CloudStorageAdapter implements ICloudStorage {
  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    // TODO: Implement R2 upload (S3-compatible)
    // - Use AWS SDK with R2 endpoint
    // - Create signed URL
    // - Return public URL
    console.warn("[R2CloudStorage] Not yet implemented - using fallback");
    return `/api/pdf/local/${key}`;
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    // TODO: Implement R2 download
    console.warn("[R2CloudStorage] Not yet implemented");
    return null;
  }

  async deletePdf(key: string): Promise<boolean> {
    // TODO: Implement R2 delete
    console.warn("[R2CloudStorage] Not yet implemented");
    return true;
  }

  getProviderName(): string {
    return "r2";
  }

  async isAvailable(): Promise<boolean> {
    // Check if R2 credentials are available
    return !!(
      process.env.PDF_S3_ACCESS_KEY_ID &&
      process.env.PDF_S3_SECRET_ACCESS_KEY &&
      process.env.PDF_STORAGE_ENDPOINT &&
      process.env.PDF_STORAGE_BUCKET
    );
  }
}

/**
 * Supabase Cloud Storage Adapter (Skeleton)
 * Ready for implementation
 */
class SupabaseCloudStorageAdapter implements ICloudStorage {
  async uploadPdf(
    key: string,
    buffer: Buffer,
    metadata?: Record<string, any>
  ): Promise<string> {
    // TODO: Implement Supabase Storage upload
    // - Use Supabase client
    // - Create signed URL
    // - Return public URL
    console.warn("[SupabaseCloudStorage] Not yet implemented - using fallback");
    return `/api/pdf/local/${key}`;
  }

  async downloadPdf(key: string): Promise<Buffer | null> {
    // TODO: Implement Supabase Storage download
    console.warn("[SupabaseCloudStorage] Not yet implemented");
    return null;
  }

  async deletePdf(key: string): Promise<boolean> {
    // TODO: Implement Supabase Storage delete
    console.warn("[SupabaseCloudStorage] Not yet implemented");
    return true;
  }

  getProviderName(): string {
    return "supabase";
  }

  async isAvailable(): Promise<boolean> {
    // Check if Supabase credentials are available
    return !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.PDF_STORAGE_BUCKET
    );
  }
}

/**
 * Cloud Storage Factory
 */
export class CloudStorageFactory {
  private static instance: ICloudStorage | null = null;

  static async getInstance(): Promise<ICloudStorage> {
    if (this.instance) {
      return this.instance;
    }

    logCloudStorageInit();

    const config = getCloudStorageConfig();

    // If cloud storage is not configured, use local fallback
    if (!isCloudStorageConfigured()) {
      this.instance = new LocalStorageAdapter();
      return this.instance;
    }

    // Create appropriate adapter based on provider
    let adapter: ICloudStorage;

    switch (config.provider) {
      case "s3":
        adapter = new S3CloudStorageAdapter();
        break;
      case "r2":
        adapter = new R2CloudStorageAdapter();
        break;
      case "supabase":
        adapter = new SupabaseCloudStorageAdapter();
        break;
      default:
        adapter = new LocalStorageAdapter();
    }

    // Check if adapter is available
    const available = await adapter.isAvailable();
    if (!available) {
      console.warn(
        `[CloudStorage] ${adapter.getProviderName()} not available - falling back to local`
      );
      this.instance = new LocalStorageAdapter();
    } else {
      this.instance = adapter;
    }

    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

/**
 * Get cloud storage adapter
 */
export async function getCloudStorage(): Promise<ICloudStorage> {
  return CloudStorageFactory.getInstance();
}
