/**
 * Notification Logger
 * Tracks all notification delivery attempts and failures
 */

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: "email" | "whatsapp" | "push" | "webhook" | "pdf";
  bookingId: string;
  recipient: string;
  status: "success" | "failed" | "pending" | "skipped";
  reason?: string;
  messageId?: string;
  error?: string;
  retryCount: number;
  nextRetry?: string;
}

/**
 * Notification Logger
 */
export class NotificationLogger {
  private static logs: NotificationLog[] = [];

  /**
   * Log notification event
   */
  static logNotification(
    type: "email" | "whatsapp" | "push" | "webhook" | "pdf",
    bookingId: string,
    recipient: string,
    status: "success" | "failed" | "pending" | "skipped",
    options?: {
      reason?: string;
      messageId?: string;
      error?: string;
      retryCount?: number;
      nextRetry?: string;
    }
  ): NotificationLog {
    const log: NotificationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      type,
      bookingId,
      recipient,
      status,
      reason: options?.reason,
      messageId: options?.messageId,
      error: options?.error,
      retryCount: options?.retryCount || 0,
      nextRetry: options?.nextRetry,
    };

    this.logs.push(log);

    // Log to console
    const statusEmoji = status === "success" ? "✅" : status === "failed" ? "❌" : status === "pending" ? "⏳" : "⏭️";
    console.log(`${statusEmoji} [Notification] ${type.toUpperCase()} for booking ${bookingId}`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Status: ${status}`);
    if (options?.error) {
      console.log(`   Error: ${options.error}`);
    }

    return log;
  }

  /**
   * Log PDF generation
   */
  static logPdfGenerated(bookingId: string, ticketNumber: string): NotificationLog {
    return this.logNotification("pdf", bookingId, ticketNumber, "success", {
      reason: "PDF generated successfully",
    });
  }

  /**
   * Log email sent
   */
  static logEmailSent(bookingId: string, email: string, messageId: string): NotificationLog {
    return this.logNotification("email", bookingId, email, "success", {
      messageId,
      reason: "Email sent successfully",
    });
  }

  /**
   * Log email failed
   */
  static logEmailFailed(bookingId: string, email: string, error: string): NotificationLog {
    return this.logNotification("email", bookingId, email, "failed", {
      error,
      reason: "Email send failed",
    });
  }

  /**
   * Log WhatsApp sent
   */
  static logWhatsAppSent(bookingId: string, phone: string, messageId: string): NotificationLog {
    return this.logNotification("whatsapp", bookingId, phone, "success", {
      messageId,
      reason: "WhatsApp sent successfully",
    });
  }

  /**
   * Log WhatsApp failed
   */
  static logWhatsAppFailed(bookingId: string, phone: string, error: string): NotificationLog {
    return this.logNotification("whatsapp", bookingId, phone, "failed", {
      error,
      reason: "WhatsApp send failed",
    });
  }

  /**
   * Log WhatsApp skipped
   */
  static logWhatsAppSkipped(bookingId: string): NotificationLog {
    return this.logNotification("whatsapp", bookingId, "N/A", "skipped", {
      reason: "WhatsApp credentials missing",
    });
  }

  /**
   * Log push notification sent
   */
  static logPushSent(bookingId: string, userId: string, messageId: string): NotificationLog {
    return this.logNotification("push", bookingId, userId, "success", {
      messageId,
      reason: "Push notification sent successfully",
    });
  }

  /**
   * Log push notification failed
   */
  static logPushFailed(bookingId: string, userId: string, error: string): NotificationLog {
    return this.logNotification("push", bookingId, userId, "failed", {
      error,
      reason: "Push notification failed",
    });
  }

  /**
   * Log webhook sent
   */
  static logWebhookSent(bookingId: string, webhookUrl: string, messageId: string): NotificationLog {
    return this.logNotification("webhook", bookingId, webhookUrl, "success", {
      messageId,
      reason: "Webhook sent successfully",
    });
  }

  /**
   * Log webhook failed
   */
  static logWebhookFailed(bookingId: string, webhookUrl: string, error: string): NotificationLog {
    return this.logNotification("webhook", bookingId, webhookUrl, "failed", {
      error,
      reason: "Webhook send failed",
    });
  }

  /**
   * Get logs for booking
   */
  static getLogsForBooking(bookingId: string): NotificationLog[] {
    return this.logs.filter((log) => log.bookingId === bookingId);
  }

  /**
   * Get failed notifications
   */
  static getFailedNotifications(limit: number = 100): NotificationLog[] {
    return this.logs.filter((log) => log.status === "failed").slice(-limit);
  }

  /**
   * Get notification statistics
   */
  static getStatistics() {
    const stats = {
      total: this.logs.length,
      byType: {
        email: 0,
        whatsapp: 0,
        push: 0,
        webhook: 0,
        pdf: 0,
      },
      byStatus: {
        success: 0,
        failed: 0,
        pending: 0,
        skipped: 0,
      },
    };

    for (const log of this.logs) {
      stats.byType[log.type]++;
      stats.byStatus[log.status]++;
    }

    return stats;
  }

  /**
   * Clear old logs (keep last 1000)
   */
  static cleanup(): void {
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
}
