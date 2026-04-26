/**
 * Ticket Delivery Orchestrator
 * Coordinates all notification channels for ticket delivery
 */

import { EmailService } from "./email";
import { WhatsAppService } from "./whatsapp";
import { PushNotificationService } from "./push";
import { generateTicketPdf, TicketPdfData } from "./pdf-generator";
import { pdfLogger } from "./pdf-logger";

export interface TicketDeliveryRequest {
  bookingId: string;
  ticketNumber: string;
  pnr: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  userId: string;
  airline: string;
  flightNumber: string;
  route: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  baggage?: string;
  fare: number;
  taxes: number;
  total: number;
  currency: string;
  agencyName?: string;
  agencyEmail?: string;
  agencyPhone?: string;
}

export interface DeliveryStatus {
  bookingId: string;
  ticketNumber: string;
  pdfGenerated: boolean;
  emailSent: boolean;
  emailError?: string;
  whatsappSent: boolean;
  whatsappError?: string;
  pushSent: boolean;
  pushError?: string;
  webhookSent: boolean;
  webhookError?: string;
  timestamp: string;
}

/**
 * Ticket Delivery Orchestrator
 */
export class TicketDeliveryOrchestrator {
  /**
   * Deliver ticket via all channels
   */
  static async deliverTicket(request: TicketDeliveryRequest): Promise<DeliveryStatus> {
    const status: DeliveryStatus = {
      bookingId: request.bookingId,
      ticketNumber: request.ticketNumber,
      pdfGenerated: false,
      emailSent: false,
      whatsappSent: false,
      pushSent: false,
      webhookSent: false,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`[TicketDelivery] Starting delivery for ticket ${request.ticketNumber}`);

      // Step 1: Generate PDF
      const pdfData: TicketPdfData = {
        bookingId: request.bookingId,
        ticketNumber: request.ticketNumber,
        pnr: request.pnr,
        passengerName: request.passengerName,
        passengerEmail: request.passengerEmail,
        airline: request.airline,
        flightNumber: request.flightNumber,
        route: request.route,
        departure: request.departure,
        arrival: request.arrival,
        departureTime: request.departureTime,
        arrivalTime: request.arrivalTime,
        baggage: request.baggage,
        fare: request.fare,
        taxes: request.taxes,
        total: request.total,
        currency: request.currency,
        agencyName: request.agencyName,
        issueDate: new Date().toISOString(),
      };

      const pdfResult = await generateTicketPdf(pdfData);
      status.pdfGenerated = pdfResult.success;

      if (pdfResult.success) {
        pdfLogger.logGenerated("ticket", request.bookingId, { ticketNumber: request.ticketNumber });
      } else {
        pdfLogger.logFailed("ticket", request.bookingId, pdfResult.error || "Unknown error");
        console.warn(`[TicketDelivery] PDF generation failed: ${pdfResult.error}`);
        status.emailError = "PDF generation failed";
      }

      // Step 2: Send email
      const emailResult = await EmailService.sendTicketEmail(
        request.passengerEmail,
        request.passengerName,
        request.ticketNumber,
        request.pnr,
        request.airline,
        request.route,
        request.departure,
        pdfResult.buffer
      );

      status.emailSent = emailResult.success;
      if (!emailResult.success) {
        status.emailError = emailResult.error;
        console.warn(`[TicketDelivery] Email send failed: ${emailResult.error}`);
      } else {
        console.log(`[TicketDelivery] Email sent successfully (${emailResult.messageId})`);
      }

      // Step 3: Send WhatsApp (if phone available)
      if (request.passengerPhone) {
        const whatsappResult = await WhatsAppService.sendTicketWhatsApp(
          request.passengerPhone,
          request.passengerName,
          request.ticketNumber,
          request.pnr
        );

        status.whatsappSent = whatsappResult.success;
        if (!whatsappResult.success) {
          status.whatsappError = whatsappResult.error;
          console.warn(`[TicketDelivery] WhatsApp send failed: ${whatsappResult.error}`);
        } else {
          console.log(`[TicketDelivery] WhatsApp sent successfully (${whatsappResult.messageId})`);
        }
      }

      // Step 4: Send push notification
      const pushResult = await PushNotificationService.sendTicketIssuedNotification(
        request.userId,
        request.ticketNumber,
        request.pnr
      );

      status.pushSent = pushResult.success;
      if (!pushResult.success) {
        status.pushError = pushResult.error;
        console.warn(`[TicketDelivery] Push notification failed: ${pushResult.error}`);
      } else {
        console.log(`[TicketDelivery] Push notification sent successfully (${pushResult.messageId})`);
      }

      // Step 5: Send agency notification (if applicable)
      if (request.agencyEmail) {
        const agencyEmailResult = await EmailService.sendAgencyNotificationEmail(
          request.agencyEmail,
          request.agencyName || "Agency",
          "ticket_issued",
          request.bookingId,
          {
            ticketNumber: request.ticketNumber,
            pnr: request.pnr,
            passengerName: request.passengerName,
          }
        );

        if (!agencyEmailResult.success) {
          console.warn(`[TicketDelivery] Agency email send failed: ${agencyEmailResult.error}`);
        } else {
          console.log(`[TicketDelivery] Agency email sent successfully`);
        }
      }

      console.log(`[TicketDelivery] Delivery completed for ticket ${request.ticketNumber}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[TicketDelivery] Delivery failed: ${errorMessage}`);
    }

    return status;
  }

  /**
   * Deliver booking confirmation
   */
  static async deliverBookingConfirmation(
    customerEmail: string,
    customerName: string,
    customerPhone: string | undefined,
    userId: string,
    bookingId: string,
    totalPrice: number,
    currency: string,
    agencyEmail?: string,
    agencyName?: string
  ): Promise<DeliveryStatus> {
    const status: DeliveryStatus = {
      bookingId,
      ticketNumber: "N/A",
      pdfGenerated: false,
      emailSent: false,
      whatsappSent: false,
      pushSent: false,
      webhookSent: false,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`[BookingConfirmation] Starting delivery for booking ${bookingId}`);

      // Send email
      const emailResult = await EmailService.sendBookingConfirmationEmail(
        customerEmail,
        customerName,
        bookingId,
        totalPrice,
        currency
      );

      status.emailSent = emailResult.success;

      // Send WhatsApp
      if (customerPhone) {
        const whatsappResult = await WhatsAppService.sendBookingConfirmationWhatsApp(
          customerPhone,
          customerName,
          bookingId,
          totalPrice,
          currency
        );

        status.whatsappSent = whatsappResult.success;
      }

      // Send push notification
      const pushResult = await PushNotificationService.sendBookingConfirmationNotification(
        userId,
        bookingId
      );

      status.pushSent = pushResult.success;

      // Send agency notification
      if (agencyEmail) {
        await EmailService.sendAgencyNotificationEmail(
          agencyEmail,
          agencyName || "Agency",
          "booking_created",
          bookingId,
          {
            customerName,
            totalPrice,
            currency,
          }
        );
      }

      console.log(`[BookingConfirmation] Delivery completed for booking ${bookingId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[BookingConfirmation] Delivery failed: ${errorMessage}`);
    }

    return status;
  }

  /**
   * Deliver payment receipt
   */
  static async deliverPaymentReceipt(
    customerEmail: string,
    customerName: string,
    customerPhone: string | undefined,
    userId: string,
    bookingId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<DeliveryStatus> {
    const status: DeliveryStatus = {
      bookingId,
      ticketNumber: "N/A",
      pdfGenerated: false,
      emailSent: false,
      whatsappSent: false,
      pushSent: false,
      webhookSent: false,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`[PaymentReceipt] Starting delivery for booking ${bookingId}`);

      // Send email
      const emailResult = await EmailService.sendPaymentReceiptEmail(
        customerEmail,
        customerName,
        bookingId,
        amount,
        currency,
        paymentMethod
      );

      status.emailSent = emailResult.success;

      // Send WhatsApp
      if (customerPhone) {
        const whatsappResult = await WhatsAppService.sendPaymentReceiptWhatsApp(
          customerPhone,
          customerName,
          bookingId,
          amount,
          currency
        );

        status.whatsappSent = whatsappResult.success;
      }

      // Send push notification
      const pushResult = await PushNotificationService.sendPaymentConfirmedNotification(
        userId,
        bookingId,
        amount
      );

      status.pushSent = pushResult.success;

      console.log(`[PaymentReceipt] Delivery completed for booking ${bookingId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[PaymentReceipt] Delivery failed: ${errorMessage}`);
    }

    return status;
  }
}
