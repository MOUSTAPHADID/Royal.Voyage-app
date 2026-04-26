/**
 * Cloud Storage Configuration
 * Skeleton for S3/R2/Supabase integration
 * Secrets are NOT stored here - loaded from environment only
 */

export type CloudStorageProvider = "local" | "s3" | "r2" | "supabase";

export interface CloudStorageConfig {
  enabled: boolean;
  provider: CloudStorageProvider;
  bucket?: string;
  region?: string;
  endpoint?: string;
}

/**
 * Get cloud storage configuration from environment
 * Secrets are NOT logged or exposed
 */
export function getCloudStorageConfig(): CloudStorageConfig {
  const provider = (process.env.PDF_STORAGE_PROVIDER || "local") as CloudStorageProvider;
  const enabled = provider !== "local" && !!process.env.PDF_STORAGE_ENABLED;

  return {
    enabled,
    provider,
    bucket: process.env.PDF_STORAGE_BUCKET,
    region: process.env.PDF_STORAGE_REGION || "us-east-1",
    endpoint: process.env.PDF_STORAGE_ENDPOINT,
  };
}

/**
 * Check if cloud storage is properly configured
 */
export function isCloudStorageConfigured(): boolean {
  const config = getCloudStorageConfig();

  if (!config.enabled || config.provider === "local") {
    return false;
  }

  // Check for required credentials in environment
  const hasS3Credentials =
    !!process.env.PDF_S3_ACCESS_KEY_ID &&
    !!process.env.PDF_S3_SECRET_ACCESS_KEY;

  const hasSupabaseCredentials =
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  switch (config.provider) {
    case "s3":
    case "r2":
      return hasS3Credentials && !!config.bucket;
    case "supabase":
      return hasSupabaseCredentials && !!config.bucket;
    default:
      return false;
  }
}

/**
 * Get cloud storage status message
 */
export function getCloudStorageStatus(): string {
  const config = getCloudStorageConfig();

  if (!config.enabled || config.provider === "local") {
    return "Cloud storage disabled - using local fallback";
  }

  if (!isCloudStorageConfigured()) {
    return `Cloud storage (${config.provider}) not configured - using local fallback`;
  }

  return `Cloud storage enabled: ${config.provider} (bucket: ${config.bucket})`;
}

/**
 * Log cloud storage initialization (without exposing secrets)
 */
export function logCloudStorageInit(): void {
  console.log(`[CloudStorage] ${getCloudStorageStatus()}`);
}
