export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogCategory =
  | "api"
  | "amadeus"
  | "hotelbeds"
  | "payment"
  | "rate_limit"
  | "ticketing"
  | "iata_validation"
  | "webhook"
  | "settlement"
  | "auth";

export interface LogEntry {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  entityId?: string;
  entityType?: "partner" | "agency" | "admin";
}

// In-memory store for logs (in production, use database)
const logEntries: LogEntry[] = [];

/**
 * Monitoring and Logging System
 * Logs all API errors, integrations, and system events
 */
export class Logger {
  private static sentryDsn = process.env.SENTRY_DSN;

  /**
   * Log a message
   */
  static log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: Record<string, any>,
    userId?: string,
    entityId?: string,
    entityType?: "partner" | "agency" | "admin"
  ): void {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      level,
      category,
      message,
      details,
      timestamp: new Date(),
      userId,
      entityId,
      entityType,
    };

    // Log to console
    const logFn =
      level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logFn(`[${category.toUpperCase()}] ${message}`, details || "");

    // Store in memory
    logEntries.push(logEntry);

    // Keep only last 1000 logs
    if (logEntries.length > 1000) {
      logEntries.shift();
    }

    // Send to Sentry if error and DSN is configured
    if (level === "error" && this.sentryDsn) {
      this.sendToSentry(message, details);
    }
  }

  /**
   * Log API error
   */
  static logApiError(
    message: string,
    statusCode: number,
    details?: Record<string, any>,
    userId?: string
  ): void {
    this.log("error", "api", message, { statusCode, ...details }, userId);
  }

  /**
   * Log Amadeus error
   */
  static logAmadeusError(message: string, details?: Record<string, any>, userId?: string): void {
    this.log("error", "amadeus", message, details, userId);
  }

  /**
   * Log Hotelbeds error
   */
  static logHotelbdsError(message: string, details?: Record<string, any>, userId?: string): void {
    this.log("error", "hotelbeds", message, details, userId);
  }

  /**
   * Log payment error
   */
  static logPaymentError(message: string, details?: Record<string, any>, userId?: string): void {
    this.log("error", "payment", message, details, userId);
  }

  /**
   * Log rate limit error
   */
  static logRateLimitError(
    message: string,
    details?: Record<string, any>,
    userId?: string
  ): void {
    this.log("warn", "rate_limit", message, details, userId);
  }

  /**
   * Log failed ticketing attempt
   */
  static logTicketingError(
    message: string,
    details?: Record<string, any>,
    userId?: string,
    entityId?: string
  ): void {
    this.log("error", "ticketing", message, details, userId, entityId, "agency");
  }

  /**
   * Log IATA validation block
   */
  static logIataValidationBlock(
    message: string,
    details?: Record<string, any>,
    agencyId?: string
  ): void {
    this.log("warn", "iata_validation", message, details, undefined, agencyId, "agency");
  }

  /**
   * Log webhook failure
   */
  static logWebhookFailure(
    message: string,
    details?: Record<string, any>,
    partnerId?: string
  ): void {
    this.log("error", "webhook", message, details, undefined, partnerId, "partner");
  }

  /**
   * Log settlement event
   */
  static logSettlementEvent(
    message: string,
    details?: Record<string, any>,
    partnerId?: string
  ): void {
    this.log("info", "settlement", message, details, undefined, partnerId, "partner");
  }

  /**
   * Log authentication event
   */
  static logAuthEvent(message: string, details?: Record<string, any>, userId?: string): void {
    this.log("info", "auth", message, details, userId);
  }

  /**
   * Send error to Sentry
   */
  private static sendToSentry(message: string, details?: Record<string, any>): void {
    if (!this.sentryDsn) return;

    try {
      // In production, use Sentry SDK
      console.log("[Sentry] Error captured:", message);
    } catch (error) {
      console.error("Failed to send to Sentry:", error);
    }
  }

  /**
   * Get recent logs
   */
  static getRecentLogs(category?: LogCategory, limit: number = 100): LogEntry[] {
    let logs = logEntries;

    if (category) {
      logs = logs.filter((l) => l.category === category);
    }

    return logs.slice(-limit);
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {
      api_errors: 0,
      amadeus_errors: 0,
      hotelbeds_errors: 0,
      payment_errors: 0,
      rate_limit_errors: 0,
      ticketing_errors: 0,
      iata_validation_blocks: 0,
      webhook_failures: 0,
    };

    for (const log of logEntries) {
      if (log.level === "error" || log.level === "warn") {
        const key = `${log.category}_${log.level === "warn" ? "blocks" : "errors"}`;
        stats[key] = (stats[key] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Clear logs (for testing)
   */
  static clearLogs(): void {
    logEntries.length = 0;
  }
}
