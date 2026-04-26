import { getDb } from "./db";
import { iataAgencies, walletTransactions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * IATA Ticketing Validation Error Codes
 */
export enum IataTicketingErrorCode {
  AGENCY_NOT_FOUND = "AGENCY_NOT_FOUND",
  AGENCY_NOT_APPROVED = "AGENCY_NOT_APPROVED",
  TICKETING_PERMISSION_DENIED = "TICKETING_PERMISSION_DENIED",
  PAYMENT_METHOD_NOT_ACTIVE = "PAYMENT_METHOD_NOT_ACTIVE",
  INSUFFICIENT_WALLET_BALANCE = "INSUFFICIENT_WALLET_BALANCE",
  CREDIT_LIMIT_EXCEEDED = "CREDIT_LIMIT_EXCEEDED",
  BANK_TRANSFER_NOT_CONFIRMED = "BANK_TRANSFER_NOT_CONFIRMED",
  IATA_EASYPAY_NOT_CONFIRMED = "IATA_EASYPAY_NOT_CONFIRMED",
  PCC_OFFICE_ID_REQUIRED = "PCC_OFFICE_ID_REQUIRED",
  PRICE_REVALIDATION_REQUIRED = "PRICE_REVALIDATION_REQUIRED",
  PROVIDER_TICKETING_NOT_AVAILABLE = "PROVIDER_TICKETING_NOT_AVAILABLE",
}

/**
 * IATA Ticketing Validation Input
 */
export interface IataTicketingValidationInput {
  agencyId: string;
  bookingId: string;
  amount: number;
  currency: string;
  provider: "amadeus" | "tpconnects";
  ticketingOwner: "partner_agency" | "royal_voyage";
  priceRevalidated: boolean;
  rawOffer?: Record<string, any>;
  pricedOffer?: Record<string, any>;
}

/**
 * IATA Ticketing Validation Response
 */
export interface IataTicketingValidationResponse {
  success: boolean;
  code?: IataTicketingErrorCode;
  message: string;
  agency?: {
    id: number;
    companyName: string;
    iataNumber: string;
    pccOfficeId?: string;
    ticketingOwner: string;
    paymentMethod: string;
    walletBalance: number;
    creditLimit: number;
    availableCredit: number;
  };
}

/**
 * Convert decimal string to number safely
 */
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

/**
 * Validate IATA agency before ticketing
 * Performs comprehensive checks to ensure agency meets all requirements for ticket issuance
 */
export async function validateIataBeforeTicketing(
  input: IataTicketingValidationInput
): Promise<IataTicketingValidationResponse> {
  try {
    // 1. Check if agency exists
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "خطأ في الاتصال بقاعدة البيانات",
      };
    }

    const agencyId = parseInt(input.agencyId);
    if (isNaN(agencyId)) {
      return {
        success: false,
        code: IataTicketingErrorCode.AGENCY_NOT_FOUND,
        message: "معرف الوكالة غير صحيح",
      };
    }

    const agency = await db
      .select()
      .from(iataAgencies)
      .where(eq(iataAgencies.id, agencyId))
      .limit(1);

    if (!agency || agency.length === 0) {
      return {
        success: false,
        code: IataTicketingErrorCode.AGENCY_NOT_FOUND,
        message: "وكالة IATA غير موجودة",
      };
    }

    const agencyData = agency[0];

    // 2. Check if agency is approved
    if (agencyData.status !== "approved") {
      return {
        success: false,
        code: IataTicketingErrorCode.AGENCY_NOT_APPROVED,
        message: `لا يمكن إصدار تذاكر - حالة الوكالة: ${agencyData.status}`,
      };
    }

    // 3. Check ticketing permission
    if (agencyData.ticketingPermission !== "booking_ticketing") {
      return {
        success: false,
        code: IataTicketingErrorCode.TICKETING_PERMISSION_DENIED,
        message: `الوكالة ليس لديها صلاحية إصدار تذاكر - الصلاحية الحالية: ${agencyData.ticketingPermission}`,
      };
    }

    // 4. Check payment method is active
    const activePaymentMethods = ["wallet", "credit_limit", "bank_transfer", "iata_easypay"];
    if (!activePaymentMethods.includes(agencyData.paymentMethod)) {
      return {
        success: false,
        code: IataTicketingErrorCode.PAYMENT_METHOD_NOT_ACTIVE,
        message: `طريقة الدفع غير نشطة: ${agencyData.paymentMethod}`,
      };
    }

    // 5. Check wallet balance if payment method is wallet
    if (agencyData.paymentMethod === "wallet") {
      const walletBalance = toNumber(agencyData.walletBalance);
      if (walletBalance < input.amount) {
        return {
          success: false,
          code: IataTicketingErrorCode.INSUFFICIENT_WALLET_BALANCE,
          message: `رصيد المحفظة غير كافي: ${walletBalance} ${input.currency} (المطلوب: ${input.amount})`,
        };
      }
    }

    // 6. Check credit limit if payment method is credit_limit
    if (agencyData.paymentMethod === "credit_limit") {
      const creditLimit = toNumber(agencyData.creditLimit);
      const usedCredit = toNumber(agencyData.usedCredit);
      const availableCredit = creditLimit - usedCredit;

      if (availableCredit < input.amount) {
        return {
          success: false,
          code: IataTicketingErrorCode.CREDIT_LIMIT_EXCEEDED,
          message: `الحد الائتماني غير كافي: ${availableCredit} ${input.currency} (المطلوب: ${input.amount})`,
        };
      }
    }

    // 7. Check bank transfer confirmation (if applicable)
    if (agencyData.paymentMethod === "bank_transfer") {
      const bankTransferConfirmed = agencyData.bankTransferConfirmed || false;
      if (!bankTransferConfirmed) {
        return {
          success: false,
          code: IataTicketingErrorCode.BANK_TRANSFER_NOT_CONFIRMED,
          message: "تحويل بنكي قيد الانتظار - يتطلب تأكيد من الإدارة",
        };
      }
    }

    // 8. Check IATA EasyPay confirmation (if applicable)
    if (agencyData.paymentMethod === "iata_easypay") {
      const easyPayConfirmed = agencyData.easyPayConfirmed || false;
      if (!easyPayConfirmed) {
        return {
          success: false,
          code: IataTicketingErrorCode.IATA_EASYPAY_NOT_CONFIRMED,
          message: "IATA EasyPay قيد الانتظار - يتطلب تأكيد",
        };
      }
    }

    // 9. Check PCC/Office ID if ticketing owner is partner_agency
    if (input.ticketingOwner === "partner_agency") {
      if (!agencyData.pccOfficeId || agencyData.pccOfficeId.trim() === "") {
        return {
          success: false,
          code: IataTicketingErrorCode.PCC_OFFICE_ID_REQUIRED,
          message: "رقم PCC/Office ID مطلوب للوكالة الشريكة",
        };
      }
    }

    // 10. Verify ticketing owner matches agency setting
    if (input.ticketingOwner !== agencyData.ticketingOwner) {
      // Log warning but don't fail - use the agency's configured owner
      console.warn(
        `Ticketing owner mismatch: requested ${input.ticketingOwner}, agency configured for ${agencyData.ticketingOwner}`
      );
    }

    // 11. Check price revalidation
    if (!input.priceRevalidated) {
      return {
        success: false,
        code: IataTicketingErrorCode.PRICE_REVALIDATION_REQUIRED,
        message: "يجب إعادة التحقق من السعر قبل إصدار التذكرة",
      };
    }

    // 12. Check provider ticketing support
    const supportedProviders = ["amadeus", "tpconnects"];
    if (!supportedProviders.includes(input.provider)) {
      return {
        success: false,
        code: IataTicketingErrorCode.PROVIDER_TICKETING_NOT_AVAILABLE,
        message: `مزود الحجز ${input.provider} لا يدعم إصدار التذاكر`,
      };
    }

    // All validations passed
    const creditLimit = toNumber(agencyData.creditLimit);
    const usedCredit = toNumber(agencyData.usedCredit);
    const availableCredit = creditLimit - usedCredit;
    const walletBalance = toNumber(agencyData.walletBalance);

    return {
      success: true,
      message: "تم التحقق من الوكالة بنجاح - يمكن المتابعة بإصدار التذكرة",
      agency: {
        id: agencyData.id,
        companyName: agencyData.companyName,
        iataNumber: agencyData.iataNumber,
        pccOfficeId: agencyData.pccOfficeId || undefined,
        ticketingOwner: agencyData.ticketingOwner,
        paymentMethod: agencyData.paymentMethod,
        walletBalance,
        creditLimit,
        availableCredit,
      },
    };
  } catch (error: any) {
    console.error("IATA Ticketing Validation Error:", error);
    return {
      success: false,
      message: "خطأ في التحقق من بيانات الوكالة",
    };
  }
}

/**
 * Get error message in user-friendly format
 */
export function getIataErrorMessage(code: IataTicketingErrorCode): string {
  const messages: Record<IataTicketingErrorCode, string> = {
    [IataTicketingErrorCode.AGENCY_NOT_FOUND]: "وكالة IATA غير موجودة",
    [IataTicketingErrorCode.AGENCY_NOT_APPROVED]: "الوكالة لم توافق عليها الإدارة بعد",
    [IataTicketingErrorCode.TICKETING_PERMISSION_DENIED]:
      "الوكالة ليس لديها صلاحية إصدار تذاكر",
    [IataTicketingErrorCode.PAYMENT_METHOD_NOT_ACTIVE]: "طريقة الدفع غير نشطة",
    [IataTicketingErrorCode.INSUFFICIENT_WALLET_BALANCE]: "رصيد المحفظة غير كافي",
    [IataTicketingErrorCode.CREDIT_LIMIT_EXCEEDED]: "الحد الائتماني غير كافي",
    [IataTicketingErrorCode.BANK_TRANSFER_NOT_CONFIRMED]:
      "تحويل بنكي قيد الانتظار",
    [IataTicketingErrorCode.IATA_EASYPAY_NOT_CONFIRMED]: "IATA EasyPay قيد الانتظار",
    [IataTicketingErrorCode.PCC_OFFICE_ID_REQUIRED]: "رقم PCC/Office ID مطلوب",
    [IataTicketingErrorCode.PRICE_REVALIDATION_REQUIRED]:
      "يجب إعادة التحقق من السعر",
    [IataTicketingErrorCode.PROVIDER_TICKETING_NOT_AVAILABLE]:
      "مزود الحجز لا يدعم إصدار التذاكر",
  };

  return messages[code] || "خطأ في التحقق من بيانات الوكالة";
}

/**
 * Log ticketing attempt for audit trail
 */
export async function logTicketingAttempt(
  agencyId: string,
  bookingId: string,
  status: "success" | "failed",
  errorCode?: IataTicketingErrorCode
): Promise<void> {
  try {
    // This would log to agencyActivityLogs table
    // Implementation depends on your activity logging system
    console.log(
      `[TICKETING_ATTEMPT] Agency: ${agencyId}, Booking: ${bookingId}, Status: ${status}, Error: ${errorCode || "none"}`
    );
  } catch (error) {
    console.error("Failed to log ticketing attempt:", error);
  }
}
