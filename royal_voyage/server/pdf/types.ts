/**
 * Cloud Storage Provider Interface
 */

export interface CloudStorageProvider {
  /**
   * Upload PDF to cloud storage
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
   * Generate signed URL for temporary access
   */
  generateSignedUrl(key: string, expirationSeconds?: number): Promise<string>;

  /**
   * Get provider name
   */
  getProviderName(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;
}
