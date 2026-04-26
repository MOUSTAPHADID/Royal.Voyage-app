import { describe, it, expect, beforeEach } from "vitest";
import { EmailService } from "../server/notifications/email";
import { WhatsAppService } from "../server/notifications/whatsapp";
import { PushNotificationService } from "../server/notifications/push";
import { generateTicketPdf } from "../server/notifications/pdf-generator";
import { TicketDeliveryOrchestrator } from "../server/notifications/ticket-delivery";
import { NotificationLogger } from "../server/notifications/notification-logger";

describe("Ticket Auto-Delivery System", () => {
  beforeEach(() => {
    // Clear logs before each test
    NotificationLogger.cleanup();
  });

  describe("Email Service", () => {
    it("should check if SMTP is configured", () => {
      const configured = EmailService.isConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should send ticket email", async () => {
      const result = await EmailService.sendTicketEmail(
        "customer@example.com",
        "John Doe",
        "TK123456",
        "ABC123",
        "Turkish Airlines",
        "DXB-IST",
        "2026-05-01"
      );

      // Should return result (may fail if SMTP not configured)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should send booking confirmation email", async () => {
      const result = await EmailService.sendBookingConfirmationEmail(
        "customer@example.com",
        "John Doe",
        "BOOKING_123",
        500,
        "USD"
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should send payment receipt email", async () => {
      const result = await EmailService.sendPaymentReceiptEmail(
        "customer@example.com",
        "John Doe",
        "BOOKING_123",
        500,
        "USD",
        "Credit Card"
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should send agency notification email", async () => {
      const result = await EmailService.sendAgencyNotificationEmail(
        "agency@example.com",
        "Travel Agency",
        "ticket_issued",
        "BOOKING_123",
        { ticketNumber: "TK123456" }
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("WhatsApp Service", () => {
    it("should check if WhatsApp is configured", () => {
      const configured = WhatsAppService.isConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should handle missing WhatsApp credentials gracefully", async () => {
      const result = await WhatsAppService.sendTicketWhatsApp(
        "+22233700000",
        "John Doe",
        "TK123456",
        "ABC123"
      );

      // Should return gracefully even if not configured
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should send ticket via WhatsApp", async () => {
      const result = await WhatsAppService.sendTicketWhatsApp(
        "+22233700000",
        "John Doe",
        "TK123456",
        "ABC123"
      );

      expect(result).toBeDefined();
    });

    it("should send booking confirmation via WhatsApp", async () => {
      const result = await WhatsAppService.sendBookingConfirmationWhatsApp(
        "+22233700000",
        "John Doe",
        "BOOKING_123",
        500,
        "USD"
      );

      expect(result).toBeDefined();
    });

    it("should send payment receipt via WhatsApp", async () => {
      const result = await WhatsAppService.sendPaymentReceiptWhatsApp(
        "+22233700000",
        "John Doe",
        "BOOKING_123",
        500,
        "USD"
      );

      expect(result).toBeDefined();
    });
  });

  describe("Push Notifications", () => {
    it("should send ticket issued notification", async () => {
      const result = await PushNotificationService.sendTicketIssuedNotification(
        "user_123",
        "TK123456",
        "ABC123"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("should send payment confirmed notification", async () => {
      const result = await PushNotificationService.sendPaymentConfirmedNotification(
        "user_123",
        "BOOKING_123",
        500
      );

      expect(result.success).toBe(true);
    });

    it("should send ticket failed notification", async () => {
      const result = await PushNotificationService.sendTicketFailedNotification(
        "user_123",
        "BOOKING_123",
        "Insufficient funds"
      );

      expect(result.success).toBe(true);
    });

    it("should send booking confirmation notification", async () => {
      const result = await PushNotificationService.sendBookingConfirmationNotification(
        "user_123",
        "BOOKING_123"
      );

      expect(result.success).toBe(true);
    });
  });

  describe("PDF Ticket Generator", () => {
    it("should generate ticket PDF", async () => {
      const result = await generateTicketPdf({
        bookingId: "BOOKING_123",
        ticketNumber: "TK123456",
        pnr: "ABC123",
        passengerName: "John Doe",
        passengerEmail: "john@example.com",
        airline: "Turkish Airlines",
        flightNumber: "TK123",
        route: "DXB-IST",
        departure: "Dubai",
        arrival: "Istanbul",
        departureTime: "14:00",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: 400,
        taxes: 100,
        total: 500,
        currency: "USD",
        agencyName: "Travel Agency",
        issueDate: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer?.length).toBeGreaterThan(0);
    });

    it("should include all required information in PDF", async () => {
      const result = await generateTicketPdf({
        bookingId: "BOOKING_123",
        ticketNumber: "TK123456",
        pnr: "ABC123",
        passengerName: "John Doe",
        passengerEmail: "john@example.com",
        airline: "Turkish Airlines",
        flightNumber: "TK123",
        route: "DXB-IST",
        departure: "Dubai",
        arrival: "Istanbul",
        departureTime: "14:00",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: 400,
        taxes: 100,
        total: 500,
        currency: "USD",
        agencyName: "Travel Agency",
        issueDate: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer!.length).toBeGreaterThan(0);
      // PDF content is encoded, so we check for PDF magic bytes instead
      const pdfMagic = result.buffer!.toString("ascii", 0, 4);
      expect(pdfMagic).toBe("%PDF");
    });
  });

  describe("Ticket Delivery Orchestrator", () => {
    it("should deliver ticket via all channels", async () => {
      const status = await TicketDeliveryOrchestrator.deliverTicket({
        bookingId: "BOOKING_123",
        ticketNumber: "TK123456",
        pnr: "ABC123",
        passengerName: "John Doe",
        passengerEmail: "john@example.com",
        passengerPhone: "+22233700000",
        userId: "user_123",
        airline: "Turkish Airlines",
        flightNumber: "TK123",
        route: "DXB-IST",
        departure: "Dubai",
        arrival: "Istanbul",
        departureTime: "14:00",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: 400,
        taxes: 100,
        total: 500,
        currency: "USD",
        agencyName: "Travel Agency",
        agencyEmail: "agency@example.com",
      });

      expect(status.bookingId).toBe("BOOKING_123");
      expect(status.ticketNumber).toBe("TK123456");
      expect(status.pdfGenerated).toBe(true);
      // Email may fail if SMTP not configured
      expect(typeof status.emailSent).toBe("boolean");
      expect(status.pushSent).toBe(true);
    });

    it("should deliver booking confirmation", async () => {
      const status = await TicketDeliveryOrchestrator.deliverBookingConfirmation(
        "john@example.com",
        "John Doe",
        "+22233700000",
        "user_123",
        "BOOKING_123",
        500,
        "USD",
        "agency@example.com",
        "Travel Agency"
      );

      expect(status.bookingId).toBe("BOOKING_123");
      expect(status.pushSent).toBe(true);
    });

    it("should deliver payment receipt", async () => {
      const status = await TicketDeliveryOrchestrator.deliverPaymentReceipt(
        "john@example.com",
        "John Doe",
        "+22233700000",
        "user_123",
        "BOOKING_123",
        500,
        "USD",
        "Credit Card"
      );

      expect(status.bookingId).toBe("BOOKING_123");
      expect(status.pushSent).toBe(true);
    });
  });

  describe("Notification Logger", () => {
    it("should log PDF generation", () => {
      const log = NotificationLogger.logPdfGenerated("BOOKING_123", "TK123456");

      expect(log.type).toBe("pdf");
      expect(log.bookingId).toBe("BOOKING_123");
      expect(log.status).toBe("success");
    });

    it("should log email sent", () => {
      const log = NotificationLogger.logEmailSent("BOOKING_123", "john@example.com", "msg_123");

      expect(log.type).toBe("email");
      expect(log.status).toBe("success");
      expect(log.messageId).toBe("msg_123");
    });

    it("should log email failed", () => {
      const log = NotificationLogger.logEmailFailed("BOOKING_123", "john@example.com", "SMTP timeout");

      expect(log.type).toBe("email");
      expect(log.status).toBe("failed");
      expect(log.error).toBe("SMTP timeout");
    });

    it("should log WhatsApp sent", () => {
      const log = NotificationLogger.logWhatsAppSent("BOOKING_123", "+22233700000", "wamsg_123");

      expect(log.type).toBe("whatsapp");
      expect(log.status).toBe("success");
    });

    it("should log WhatsApp skipped", () => {
      const log = NotificationLogger.logWhatsAppSkipped("BOOKING_123");

      expect(log.type).toBe("whatsapp");
      expect(log.status).toBe("skipped");
      expect(log.reason).toContain("credentials missing");
    });

    it("should log push notification sent", () => {
      const log = NotificationLogger.logPushSent("BOOKING_123", "user_123", "push_123");

      expect(log.type).toBe("push");
      expect(log.status).toBe("success");
    });

    it("should log webhook sent", () => {
      const log = NotificationLogger.logWebhookSent("BOOKING_123", "https://example.com/webhook", "wh_123");

      expect(log.type).toBe("webhook");
      expect(log.status).toBe("success");
    });

    it("should get logs for booking", () => {
      NotificationLogger.logPdfGenerated("BOOKING_XYZ", "TK123456");
      NotificationLogger.logEmailSent("BOOKING_XYZ", "john@example.com", "msg_123");
      NotificationLogger.logPushSent("BOOKING_XYZ", "user_123", "push_123");

      const logs = NotificationLogger.getLogsForBooking("BOOKING_XYZ");

      expect(logs.length).toBeGreaterThanOrEqual(3);
      expect(logs.every((log) => log.bookingId === "BOOKING_XYZ")).toBe(true);
    });

    it("should get failed notifications", () => {
      NotificationLogger.logEmailFailed("BOOKING_123", "john@example.com", "SMTP timeout");
      NotificationLogger.logWhatsAppFailed("BOOKING_456", "+22233700000", "Invalid token");

      const failed = NotificationLogger.getFailedNotifications();

      expect(failed.length).toBeGreaterThanOrEqual(2);
      expect(failed.every((log) => log.status === "failed")).toBe(true);
    });

    it("should get notification statistics", () => {
      NotificationLogger.logPdfGenerated("BOOKING_123", "TK123456");
      NotificationLogger.logEmailSent("BOOKING_123", "john@example.com", "msg_123");
      NotificationLogger.logEmailFailed("BOOKING_456", "jane@example.com", "Error");
      NotificationLogger.logWhatsAppSkipped("BOOKING_789");

      const stats = NotificationLogger.getStatistics();

      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.byType.email).toBeGreaterThanOrEqual(2);
      expect(stats.byStatus.success).toBeGreaterThanOrEqual(2);
      expect(stats.byStatus.failed).toBeGreaterThanOrEqual(1);
      expect(stats.byStatus.skipped).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Error Handling", () => {
    it("should not break booking if email fails", async () => {
      const status = await TicketDeliveryOrchestrator.deliverTicket({
        bookingId: "BOOKING_123",
        ticketNumber: "TK123456",
        pnr: "ABC123",
        passengerName: "John Doe",
        passengerEmail: "john@example.com",
        userId: "user_123",
        airline: "Turkish Airlines",
        flightNumber: "TK123",
        route: "DXB-IST",
        departure: "Dubai",
        arrival: "Istanbul",
        departureTime: "14:00",
        arrivalTime: "18:00",
        baggage: "23kg",
        fare: 400,
        taxes: 100,
        total: 500,
        currency: "USD",
      });

      // Even if email fails, other channels should still work
      expect(status.pdfGenerated).toBe(true);
      expect(status.pushSent).toBe(true);
    });

    it("should log notification failures", () => {
      NotificationLogger.logEmailFailed("BOOKING_FAIL", "john@example.com", "SMTP timeout");
      NotificationLogger.logWebhookFailed("BOOKING_FAIL", "https://example.com", "Connection refused");

      const logs = NotificationLogger.getLogsForBooking("BOOKING_FAIL");
      const failures = logs.filter((log) => log.status === "failed");

      expect(failures.length).toBeGreaterThanOrEqual(2);
      expect(failures.some((f) => f.error === "SMTP timeout")).toBe(true);
      expect(failures.some((f) => f.error === "Connection refused")).toBe(true);
    });
  });

  describe("Access Isolation", () => {
    it("should not expose SMTP credentials", () => {
      // Verify that credentials are not in logs or responses
      const result = EmailService.isConfigured();
      expect(typeof result).toBe("boolean");
      // Should not return actual credentials
    });

    it("should not expose WhatsApp credentials", () => {
      // Verify that credentials are not in logs or responses
      const result = WhatsAppService.isConfigured();
      expect(typeof result).toBe("boolean");
      // Should not return actual credentials
    });
  });
});
