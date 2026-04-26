/**
 * Cloud Storage Factory
 * Creates appropriate storage provider based on configuration
 */

import { getCloudStorageConfig, isCloudStorageConfigured, logCloudStorageInit } from "./cloud-config";
import { CloudStorageProvider } from "./types";
import { S3CloudStorageProvider } from "./providers/s3-provider";
import { SupabaseCloudStorageProvider } from "./providers/supabase-provider";
import { LocalStorageAdapter } from "./providers/local-provider";

export class CloudStorageFactory {
  private static instance: CloudStorageProvider | null = null;

  static async getInstance(): Promise<CloudStorageProvider> {
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

    // Create appropriate provider based on configuration
    let provider: CloudStorageProvider;

    try {
      switch (config.provider) {
        case "s3":
          provider = new S3CloudStorageProvider("s3");
          break;
        case "r2":
          provider = new S3CloudStorageProvider("r2");
          break;
        case "supabase":
          provider = new SupabaseCloudStorageProvider();
          break;
        default:
          provider = new LocalStorageAdapter();
      }

      // Check if provider is available
      const available = await provider.isAvailable();
      if (!available) {
        console.warn(
          `[CloudStorage] ${provider.getProviderName()} not available - checking fallback`
        );

        // Check if local fallback is allowed
        if (process.env.PDF_STORAGE_ALLOW_LOCAL_FALLBACK === "true") {
          console.warn("[CloudStorage] Using local fallback");
          this.instance = new LocalStorageAdapter();
        } else {
          console.error(
            `[CloudStorage] ${provider.getProviderName()} not available and local fallback not allowed`
          );
          throw new Error(
            `Cloud storage provider ${config.provider} is not available and local fallback is disabled`
          );
        }
      } else {
        this.instance = provider;
        console.log(`[CloudStorage] ${provider.getProviderName()} provider initialized successfully`);
      }
    } catch (error) {
      console.error(`[CloudStorage] Failed to initialize provider: ${error}`);

      // Check if local fallback is allowed
      if (process.env.PDF_STORAGE_ALLOW_LOCAL_FALLBACK === "true") {
        console.warn("[CloudStorage] Using local fallback due to error");
        this.instance = new LocalStorageAdapter();
      } else {
        throw error;
      }
    }

    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

/**
 * Get cloud storage provider
 */
export async function getCloudStorage(): Promise<CloudStorageProvider> {
  return CloudStorageFactory.getInstance();
}
