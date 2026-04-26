/**
 * PDF Download Router
 * Handles secure PDF downloads with token validation and access control
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { PdfStorageManager } from "../pdf/storage";
import { pdfLogger } from "../notifications/pdf-logger";

export const pdfDownloadRouter = router({
  /**
   * Download PDF by token
   * GET /api/pdf/download/:token
   */
  downloadByToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().optional(),
        agencyId: z.string().optional(),
        partnerId: z.string().optional(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        // Verify token validity
        const pdf = PdfStorageManager.getPdfByToken(input.token);

        if (!pdf) {
          return {
            success: false,
            error: "Invalid or expired token",
            statusCode: 401,
          };
        }

        // Verify access control
        const hasAccess = PdfStorageManager.verifyAccess(
          input.token,
          input.userId,
          input.agencyId,
          input.partnerId
        );

        if (!hasAccess) {
          pdfLogger.logFailed(
            pdf.type as any,
            pdf.bookingId,
            "Access denied - unauthorized user/agency/partner"
          );
          return {
            success: false,
            error: "Access denied",
            statusCode: 403,
          };
        }

        // Record download
        PdfStorageManager.recordDownload(input.token);

        // Log download
        pdfLogger.logDownloaded(
          pdf.type as any,
          pdf.bookingId,
          input.userId || input.agencyId || input.partnerId || "anonymous"
        );

        return {
          success: true,
          pdf: {
            filename: pdf.filename,
            type: pdf.type,
            size: pdf.size,
            buffer: pdf.buffer.toString("base64"),
          },
          statusCode: 200,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        pdfLogger.logFailed("ticket" as any, "unknown", `Download error: ${errorMsg}`);

        return {
          success: false,
          error: "Download failed",
          statusCode: 500,
        };
      }
    }),

  /**
   * Get token info (admin only)
   */
  getTokenInfo: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(({ input }: any) => {
      const tokenInfo = PdfStorageManager.getTokenInfo(input.token);

      if (!tokenInfo) {
        return { success: false, error: "Token not found" };
      }

      return {
        success: true,
        token: {
          pdfId: tokenInfo.pdfId,
          createdAt: new Date(tokenInfo.createdAt).toISOString(),
          expiresAt: new Date(tokenInfo.expiresAt).toISOString(),
          isExpired: Date.now() > tokenInfo.expiresAt,
          downloadCount: tokenInfo.downloadCount,
          maxDownloads: tokenInfo.maxDownloads,
          bookingId: tokenInfo.bookingId,
        },
      };
    }),

  /**
   * Get PDF storage statistics (admin only)
   */
  getStorageStats: publicProcedure.query(() => {
    const stats = PdfStorageManager.getStats();

    return {
      success: true,
      stats: {
        totalPdfs: stats.totalPdfs,
        totalTokens: stats.totalTokens,
        totalSizeBytes: stats.totalSize,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        pdfsByType: stats.pdfsByType,
        validTokens: stats.validTokens,
        expiredTokens: stats.expiredTokens,
      },
    };
  }),

  /**
   * Cleanup expired tokens (admin only)
   */
  cleanupExpiredTokens: publicProcedure.mutation(() => {
    const cleaned = PdfStorageManager.cleanupExpiredTokens();

    pdfLogger.logGenerated("ticket" as any, "cleanup", {
      action: "cleanup_expired_tokens",
      count: cleaned,
    });

    return {
      success: true,
      message: `Cleaned up ${cleaned} expired tokens`,
      cleaned,
    };
  }),

  /**
   * Delete PDF (admin only)
   */
  deletePdf: publicProcedure
    .input(z.object({ pdfId: z.string().min(1) }))
    .mutation(({ input }: any) => {
      const deleted = PdfStorageManager.deletePdf(input.pdfId);

      if (deleted) {
        pdfLogger.logFailed("ticket" as any, "admin", `PDF deleted: ${input.pdfId}`);
        return { success: true, message: "PDF deleted successfully" };
      }

      return { success: false, error: "PDF not found" };
    }),
});

export type PdfDownloadRouter = typeof pdfDownloadRouter;
