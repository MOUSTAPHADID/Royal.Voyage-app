import crypto from "crypto";

export type WebhookEventType =
  | "booking_created"
  | "price_changed"
  | "ticket_issued"
  | "ticket_failed"
  | "refund_requested"
  | "refund_completed"
  | "payment_pending"
  | "payment_confirmed";

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  url: string;
  payload: WebhookPayload;
  signature: string;
  status: "pending" | "success" | "failed";
  attempts: number;
  lastAttemptAt: Date;
  nextRetryAt?: Date;
  responseStatus?: number;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT_MS = 10 * 1000; // 10 seconds

// In-memory store for webhook deliveries (in production, use database)
const deliveryLogs: Map<string, WebhookDelivery> = new Map();

/**
 * Webhook Delivery Engine
 * Handles sending webhooks with HMAC signatures, retry logic, and logging
 */
export class WebhookEngine {
  /**
   * Generate HMAC-SHA256 signature for webhook payload
   */
  static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Send webhook to URL with HMAC signature
   */
  static async sendWebhook(
    url: string,
    payload: WebhookPayload,
    secret: string,
    timeout: number = REQUEST_TIMEOUT_MS
  ): Promise<{ status: number; body: string; error?: string }> {
    try {
      const payloadString = JSON.stringify(payload);
      const signature = this.generateSignature(payloadString, secret);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Timestamp": payload.timestamp,
          "X-Webhook-Event": payload.event,
        },
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      return {
        status: response.status,
        body,
      };
    } catch (error) {
      return {
        status: 0,
        body: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Queue webhook for delivery
   */
  static async queueWebhook(
    url: string,
    secret: string,
    eventType: WebhookEventType,
    data: Record<string, any>
  ): Promise<string> {
    const deliveryId = `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send webhook immediately
    await this.deliverWebhook(deliveryId, url, payload, secret);

    return deliveryId;
  }

  /**
   * Deliver webhook with retry logic
   */
  static async deliverWebhook(
    deliveryId: string,
    url: string,
    payload: WebhookPayload,
    secret: string,
    attempt: number = 1
  ): Promise<void> {
    try {
      // Send webhook
      const result = await this.sendWebhook(url, payload, secret);

      const isSuccess = result.status >= 200 && result.status < 300;

      // Create delivery log entry
      const delivery: WebhookDelivery = {
        id: deliveryId,
        url,
        payload,
        signature: this.generateSignature(JSON.stringify(payload), secret),
        status: isSuccess ? "success" : attempt >= MAX_RETRIES ? "failed" : "pending",
        attempts: attempt,
        lastAttemptAt: new Date(),
        responseStatus: result.status,
        error: result.error,
      };

      // Schedule retry if needed
      if (!isSuccess && attempt < MAX_RETRIES) {
        delivery.nextRetryAt = new Date(Date.now() + RETRY_DELAY_MS);
        console.log(
          `[Webhook] Delivery ${deliveryId} scheduled for retry (attempt ${attempt + 1})`
        );

        // Schedule retry
        setTimeout(() => {
          this.deliverWebhook(deliveryId, url, payload, secret, attempt + 1).catch((error) => {
            console.error("[Webhook] Retry error:", error);
          });
        }, RETRY_DELAY_MS);
      } else if (isSuccess) {
        console.log(`[Webhook] Delivery ${deliveryId} succeeded (status: ${result.status})`);
      } else {
        console.error(
          `[Webhook] Delivery ${deliveryId} failed after ${attempt} attempts: ${result.error}`
        );
      }

      // Store delivery log
      deliveryLogs.set(deliveryId, delivery);
    } catch (error) {
      console.error("[Webhook] Delivery error:", error);
    }
  }

  /**
   * Get webhook delivery logs
   */
  static getDeliveryLogs(limit: number = 50): WebhookDelivery[] {
    const logs = Array.from(deliveryLogs.values());
    return logs.slice(-limit);
  }

  /**
   * Get delivery log by ID
   */
  static getDeliveryLog(deliveryId: string): WebhookDelivery | undefined {
    return deliveryLogs.get(deliveryId);
  }

  /**
   * Get delivery statistics
   */
  static getDeliveryStats(): {
    total: number;
    success: number;
    failed: number;
    pending: number;
  } {
    const logs = Array.from(deliveryLogs.values());
    return {
      total: logs.length,
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      pending: logs.filter((l) => l.status === "pending").length,
    };
  }
}
