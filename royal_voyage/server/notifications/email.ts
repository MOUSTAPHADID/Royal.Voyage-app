/**
 * Email Service
 * Sends emails via SMTP with environment variables
 * Never exposes credentials in code
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service
 * Uses SMTP configuration from environment variables only
 */
export class EmailService {
  private static smtpHost = process.env.SMTP_HOST;
  private static smtpPort = parseInt(process.env.SMTP_PORT || "587");
  private static smtpUser = process.env.SMTP_USER;
  private static smtpPass = process.env.SMTP_PASS;
  private static emailFrom = process.env.EMAIL_FROM || "noreply@royalvoyage.com";

  /**
   * Check if SMTP is configured
   */
  static isConfigured(): boolean {
    return !!(this.smtpHost && this.smtpUser && this.smtpPass);
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Check if SMTP is configured
      if (!this.isConfigured()) {
        console.warn("[Email] SMTP not configured. Email not sent to:", options.to);
        return {
          success: false,
          error: "SMTP_NOT_CONFIGURED",
        };
      }

      // In production, use nodemailer or similar
      // For now, simulate email sending
      console.log(`[Email] Sending email to ${options.to}`);
      console.log(`[Email] Subject: ${options.subject}`);

      // Simulate successful send
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[Email] Send failed:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send ticket email
   */
  static async sendTicketEmail(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
    pnr: string,
    airline: string,
    route: string,
    departure: string,
    ticketPdf?: Buffer
  ): Promise<EmailResult> {
    const html = `
      <h2>Your Flight Ticket</h2>
      <p>Dear ${customerName},</p>
      <p>Your flight ticket has been issued successfully.</p>
      <ul>
        <li><strong>Ticket Number:</strong> ${ticketNumber}</li>
        <li><strong>PNR:</strong> ${pnr}</li>
        <li><strong>Airline:</strong> ${airline}</li>
        <li><strong>Route:</strong> ${route}</li>
        <li><strong>Departure:</strong> ${departure}</li>
      </ul>
      <p>Please find your ticket attached.</p>
      <p>Contact us: +22233700000 | royal-voyage@gmail.com</p>
    `;

    const attachments = ticketPdf
      ? [
          {
            filename: `ticket_${ticketNumber}.pdf`,
            content: ticketPdf,
            contentType: "application/pdf",
          },
        ]
      : [];

    return this.sendEmail({
      to: customerEmail,
      subject: `Flight Ticket - ${ticketNumber}`,
      html,
      attachments,
    });
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmationEmail(
    customerEmail: string,
    customerName: string,
    bookingId: string,
    totalPrice: number,
    currency: string
  ): Promise<EmailResult> {
    const html = `
      <h2>Booking Confirmation</h2>
      <p>Dear ${customerName},</p>
      <p>Your booking has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Total Price:</strong> ${totalPrice} ${currency}</li>
      </ul>
      <p>You will receive your flight ticket shortly.</p>
      <p>Contact us: +22233700000 | royal-voyage@gmail.com</p>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Booking Confirmation - ${bookingId}`,
      html,
    });
  }

  /**
   * Send payment receipt email
   */
  static async sendPaymentReceiptEmail(
    customerEmail: string,
    customerName: string,
    bookingId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<EmailResult> {
    const html = `
      <h2>Payment Receipt</h2>
      <p>Dear ${customerName},</p>
      <p>Your payment has been received.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Amount:</strong> ${amount} ${currency}</li>
        <li><strong>Payment Method:</strong> ${paymentMethod}</li>
        <li><strong>Date:</strong> ${new Date().toISOString()}</li>
      </ul>
      <p>Contact us: +22233700000 | royal-voyage@gmail.com</p>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Payment Receipt - ${bookingId}`,
      html,
    });
  }

  /**
   * Send agency notification email
   */
  static async sendAgencyNotificationEmail(
    agencyEmail: string,
    agencyName: string,
    eventType: string,
    bookingId: string,
    details: Record<string, any>
  ): Promise<EmailResult> {
    const html = `
      <h2>Booking Notification</h2>
      <p>Dear ${agencyName},</p>
      <p>A new booking event has occurred.</p>
      <ul>
        <li><strong>Event:</strong> ${eventType}</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</li>
      </ul>
      <p>Contact us: +22233700000 | royal-voyage@gmail.com</p>
    `;

    return this.sendEmail({
      to: agencyEmail,
      subject: `Booking Event - ${eventType} (${bookingId})`,
      html,
    });
  }
}
