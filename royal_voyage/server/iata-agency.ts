/**
 * IATA Agency Management Backend
 * Handles agency registration, approval, ticketing permissions, and wallet management
 */

import { getDb } from "./db";
import { iataAgencies, agencyActivityLogs, walletTransactions, agencyBookings } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── Get Agency by ID ────────────────────────────────────────────────────────
export async function getAgencyById(agencyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(iataAgencies).where(eq(iataAgencies.id, agencyId));
  return result.length > 0 ? result[0] : null;
}

// ─── Get All Agencies (with filters) ────────────────────────────────────────
export async function getAgencies(filters?: { status?: string; country?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query: any = db.select().from(iataAgencies);

  if (filters?.status) {
    query = query.where(eq(iataAgencies.status, filters.status as any));
  }

  if (filters?.country) {
    query = query.where(eq(iataAgencies.country, filters.country));
  }

  return query.orderBy(desc(iataAgencies.createdAt));
}

// ─── Create Agency ──────────────────────────────────────────────────────────
export async function createIataAgency(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(iataAgencies).values({
    companyName: data.companyName,
    iataNumber: data.iataNumber || `TEMP-${Date.now()}`,
    commercialRegistrationNumber: data.commercialRegistrationNumber,
    taxNumber: data.taxNumber,
    responsiblePersonName: data.responsiblePersonName,
    jobTitle: data.jobTitle,
    email: data.email,
    phone: data.phone,
    country: data.country,
    city: data.city,
    bookingProvider: data.bookingProvider || "amadeus",
    pccOfficeId: data.pccOfficeId,
    ticketingPermission: data.ticketingPermission || "booking_only",
    ticketingOwner: data.ticketingOwner || "royal_voyage",
    paymentMethod: data.paymentMethod || "wallet",
    creditLimit: data.creditLimit || "0.00",
    usedCredit: "0.00",
    markupType: data.markupType || "percentage",
    markupValue: data.markupValue || "0.00",
    commissionType: data.commissionType || "percentage",
    commissionValue: data.commissionValue || "0.00",
    status: "pending_review",
    walletBalance: "0.00",
  });

  const agencyId = (result as any)[0].insertId;

  // Log creation
  await logAgencyActivity(
    agencyId,
    "admin_note",
    `Agency created: ${data.companyName}`,
    undefined,
    undefined
  );

  return agencyId;
}

// ─── Approve Agency ─────────────────────────────────────────────────────────
export async function approveAgency(agencyId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(iataAgencies)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedBy,
    })
    .where(eq(iataAgencies.id, agencyId));

  await logAgencyActivity(agencyId, "status_change", "Agency approved", undefined, approvedBy);
}

// ─── Reject Agency ──────────────────────────────────────────────────────────
export async function rejectAgency(agencyId: number, reason: string, rejectedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(iataAgencies)
    .set({
      status: "rejected",
    })
    .where(eq(iataAgencies.id, agencyId));

  await logAgencyActivity(agencyId, "status_change", `Agency rejected: ${reason}`, undefined, rejectedBy);
}

// ─── Suspend Agency ─────────────────────────────────────────────────────────
export async function suspendAgency(agencyId: number, reason: string, suspendedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(iataAgencies)
    .set({
      status: "suspended",
    })
    .where(eq(iataAgencies.id, agencyId));

  await logAgencyActivity(agencyId, "status_change", `Agency suspended: ${reason}`, undefined, suspendedBy);
}

// ─── Log Activity ────────────────────────────────────────────────────────────
export async function logAgencyActivity(
  agencyId: number,
  actionType: string,
  description: string,
  amount?: number,
  createdBy?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(agencyActivityLogs).values({
    agencyId,
    actionType: actionType as any,
    description,
    amount: amount ? String(amount) : undefined,
    createdBy,
  });
}

// ─── Add Wallet Transaction ──────────────────────────────────────────────────
export async function addWalletTransaction(
  agencyId: number,
  type: string,
  amount: number,
  currency: string,
  description: string,
  referenceId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current balance
  const agency = await getAgencyById(agencyId);
  if (!agency) throw new Error("Agency not found");

  const currentBalance = Number(agency.walletBalance) || 0;
  const newBalance = type === "deposit" || type === "refund" ? currentBalance + amount : currentBalance - amount;

  // Add transaction
  await db.insert(walletTransactions).values({
    agencyId,
    type: type as any,
    amount: String(amount),
    currency,
    description,
    referenceId,
    balanceAfter: String(newBalance),
  });

  // Update agency balance
  await db
    .update(iataAgencies)
    .set({
      walletBalance: String(newBalance),
    })
    .where(eq(iataAgencies.id, agencyId));

  // Log activity
  await logAgencyActivity(agencyId, "wallet_transaction", `${type}: ${amount} ${currency}`, amount);

  return newBalance;
}

// ─── Get Activity Logs ──────────────────────────────────────────────────────
export async function getAgencyActivityLogs(agencyId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agencyActivityLogs)
    .where(eq(agencyActivityLogs.agencyId, agencyId))
    .orderBy(desc(agencyActivityLogs.createdAt))
    .limit(limit);
}

// ─── Get Wallet Transactions ────────────────────────────────────────────────
export async function getAgencyWalletTransactions(agencyId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.agencyId, agencyId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit);
}

// ─── Calculate Markup ───────────────────────────────────────────────────────
export function calculateMarkup(basePrice: number, agency: any): number {
  if (agency.markupType === "fixed") {
    return Number(agency.markupValue) || 0;
  }
  return (basePrice * (Number(agency.markupValue) || 0)) / 100;
}

// ─── Calculate Commission ──────────────────────────────────────────────────
export function calculateCommission(basePrice: number, agency: any): number {
  if (agency.commissionType === "fixed") {
    return Number(agency.commissionValue) || 0;
  }
  return (basePrice * (Number(agency.commissionValue) || 0)) / 100;
}

// ─── Check Ticketing Permission ────────────────────────────────────────────
export async function canAgencyTicket(agencyId: number): Promise<{ allowed: boolean; reason?: string }> {
  const agency = await getAgencyById(agencyId);
  if (!agency) {
    return { allowed: false, reason: "Agency not found" };
  }

  if (agency.status !== "approved") {
    return { allowed: false, reason: "Agency cannot issue tickets (not approved)" };
  }

  if (agency.ticketingPermission === "search_only") {
    return { allowed: false, reason: "Agency cannot issue tickets (search only)" };
  }

  if (agency.ticketingPermission === "booking_only") {
    return { allowed: false, reason: "Agency cannot issue tickets (booking only)" };
  }

  // Check payment method and balance
  if (agency.paymentMethod === "wallet") {
    if (Number(agency.walletBalance) <= 0) {
      return { allowed: false, reason: "Insufficient wallet balance" };
    }
  } else if (agency.paymentMethod === "credit_limit") {
    const availableCredit = Number(agency.creditLimit) - Number(agency.usedCredit);
    if (availableCredit <= 0) {
      return { allowed: false, reason: "Insufficient credit limit" };
    }
  }

  return { allowed: true };
}

// ─── Get Available Credit ──────────────────────────────────────────────────
export async function getAvailableCredit(agencyId: number): Promise<number> {
  const agency = await getAgencyById(agencyId);
  if (!agency) return 0;
  return Number(agency.creditLimit) - Number(agency.usedCredit);
}
