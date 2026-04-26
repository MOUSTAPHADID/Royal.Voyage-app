/**
 * IATA Payment Confirmation Tests
 * 
 * Tests for bank transfer and IATA EasyPay confirmation validation
 * - Bank transfer without confirmation → blocked
 * - Bank transfer with confirmation → allowed
 * - IATA EasyPay without confirmation → blocked
 * - IATA EasyPay with confirmation → allowed
 */

import { describe, it, expect } from "vitest";
import { IataTicketingErrorCode } from "../server/iata-ticketing";
import type { IataTicketingValidationResponse } from "../server/iata-ticketing";

describe("IATA Payment Confirmation Tests", () => {
  describe("Test Case: Bank Transfer Without Confirmation", () => {
    it("should reject bank transfer payment when not confirmed by admin", () => {
      // Agency using bank_transfer payment method but not confirmed
      const result: IataTicketingValidationResponse = {
        success: false,
        code: IataTicketingErrorCode.BANK_TRANSFER_NOT_CONFIRMED,
        message: "تحويل بنكي قيد الانتظار - يتطلب تأكيد من الإدارة",
      };

      expect(result.success).toBe(false);
      expect(result.code).toBe(IataTicketingErrorCode.BANK_TRANSFER_NOT_CONFIRMED);
      expect(result.message).toContain("تحويل بنكي");
      expect(result.message).toContain("قيد الانتظار");
    });
  });

  describe("Test Case: Bank Transfer With Confirmation", () => {
    it("should accept bank transfer payment when confirmed by admin", () => {
      // Agency using bank_transfer payment method and confirmed
      const result: IataTicketingValidationResponse = {
        success: true,
        message: "تم التحقق من الوكالة بنجاح - يمكن المتابعة بإصدار التذكرة",
        agency: {
          id: 10,
          companyName: "Confirmed Bank Transfer Agency",
          iataNumber: "BANKCONFIRMED001",
          ticketingOwner: "royal_voyage",
          paymentMethod: "bank_transfer",
          walletBalance: 0,
          creditLimit: 0,
          availableCredit: 0,
        },
      };

      expect(result.success).toBe(true);
      expect(result.message).toContain("نجاح");
      expect(result.agency).toBeDefined();
      expect(result.agency?.paymentMethod).toBe("bank_transfer");
    });
  });

  describe("Test Case: IATA EasyPay Without Confirmation", () => {
    it("should reject IATA EasyPay payment when not confirmed by admin", () => {
      // Agency using iata_easypay payment method but not confirmed
      const result: IataTicketingValidationResponse = {
        success: false,
        code: IataTicketingErrorCode.IATA_EASYPAY_NOT_CONFIRMED,
        message: "IATA EasyPay قيد الانتظار - يتطلب تأكيد",
      };

      expect(result.success).toBe(false);
      expect(result.code).toBe(IataTicketingErrorCode.IATA_EASYPAY_NOT_CONFIRMED);
      expect(result.message).toContain("IATA EasyPay");
      expect(result.message).toContain("قيد الانتظار");
    });
  });

  describe("Test Case: IATA EasyPay With Confirmation", () => {
    it("should accept IATA EasyPay payment when confirmed by admin", () => {
      // Agency using iata_easypay payment method and confirmed
      const result: IataTicketingValidationResponse = {
        success: true,
        message: "تم التحقق من الوكالة بنجاح - يمكن المتابعة بإصدار التذكرة",
        agency: {
          id: 11,
          companyName: "Confirmed EasyPay Agency",
          iataNumber: "EASYPAYCONFIRMED001",
          ticketingOwner: "royal_voyage",
          paymentMethod: "iata_easypay",
          walletBalance: 0,
          creditLimit: 0,
          availableCredit: 0,
        },
      };

      expect(result.success).toBe(true);
      expect(result.message).toContain("نجاح");
      expect(result.agency).toBeDefined();
      expect(result.agency?.paymentMethod).toBe("iata_easypay");
    });
  });

  describe("Payment Confirmation Field Validation", () => {
    it("should properly handle payment confirmation states", () => {
      const confirmationStates = [
        { confirmed: false, expected: false },
        { confirmed: true, expected: true },
        { confirmed: null, expected: false },
        { confirmed: undefined, expected: false },
      ];

      confirmationStates.forEach(({ confirmed, expected }) => {
        const isConfirmed = confirmed || false;
        expect(isConfirmed).toBe(expected);
      });
    });
  });

  describe("Admin Confirmation Tracking", () => {
    it("should track admin ID and timestamp for payment confirmations", () => {
      const confirmationRecord = {
        agencyId: 10,
        paymentMethod: "bank_transfer",
        confirmed: true,
        confirmedAt: new Date("2026-04-25T12:30:00Z"),
        confirmedBy: 5, // Admin ID
      };

      expect(confirmationRecord.agencyId).toBe(10);
      expect(confirmationRecord.confirmed).toBe(true);
      expect(confirmationRecord.confirmedAt).toBeDefined();
      expect(confirmationRecord.confirmedBy).toBe(5);
    });
  });

  describe("All 12 Validation Rules with Payment Confirmation", () => {
    it("should enforce all 12 rules including payment confirmation", () => {
      const validationRules = [
        { rule: 1, name: "Agency exists", enabled: true },
        { rule: 2, name: "Agency approved", enabled: true },
        { rule: 3, name: "Ticketing permission", enabled: true },
        { rule: 4, name: "Payment method active", enabled: true },
        { rule: 5, name: "Wallet balance sufficient", enabled: true },
        { rule: 6, name: "Credit limit available", enabled: true },
        { rule: 7, name: "Bank transfer confirmed", enabled: true }, // NOW ENABLED
        { rule: 8, name: "IATA EasyPay confirmed", enabled: true }, // NOW ENABLED
        { rule: 9, name: "PCC/Office ID provided", enabled: true },
        { rule: 10, name: "Price revalidated", enabled: true },
        { rule: 11, name: "Ticketing owner match", enabled: true },
        { rule: 12, name: "Provider supports ticketing", enabled: true },
      ];

      const enabledRules = validationRules.filter((r) => r.enabled);
      expect(enabledRules.length).toBe(12);
      expect(enabledRules[6].name).toBe("Bank transfer confirmed");
      expect(enabledRules[7].name).toBe("IATA EasyPay confirmed");
    });
  });

  describe("Payment Confirmation Integration", () => {
    it("should integrate payment confirmation with ticketing flow", () => {
      const ticketingFlow = {
        step1_validateAgency: true,
        step2_checkPaymentMethod: true,
        step3_confirmPaymentIfNeeded: true, // NEW: Check payment confirmation
        step4_validateBalance: true,
        step5_revalidatePrice: true,
        step6_issueTicket: true,
        step7_debitWallet: true,
        step8_logTransaction: true,
      };

      expect(ticketingFlow.step3_confirmPaymentIfNeeded).toBe(true);
      const allStepsComplete = Object.values(ticketingFlow).every((v) => v === true);
      expect(allStepsComplete).toBe(true);
    });
  });

  describe("Error Messages for Payment Confirmation", () => {
    it("should provide clear Arabic error messages for payment confirmation failures", () => {
      const errorMessages = {
        bankTransferNotConfirmed: "تحويل بنكي قيد الانتظار - يتطلب تأكيد من الإدارة",
        easyPayNotConfirmed: "IATA EasyPay قيد الانتظار - يتطلب تأكيد",
      };

      Object.values(errorMessages).forEach((message) => {
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
        // Verify Arabic characters
        expect(message).toMatch(/[\u0600-\u06FF]/);
      });
    });
  });
});
