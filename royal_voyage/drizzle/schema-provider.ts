/**
 * Provider Platform Schema
 * 
 * Tables for Partner Developer Portal, Webhooks, Settlement, and Agency Portal
 * Isolated from core booking system to prevent breaking changes
 */

import { mysqlTable, mysqlEnum, varchar, int, text, timestamp, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ─── Partner API Keys (مفاتيح API للشركاء) ──────────────────────────────────
export const partnerApiKeys = mysqlTable("partner_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  /** Partner/Agency ID */
  partnerId: int("partnerId").notNull(),
  /** API key name (for display) */
  keyName: varchar("keyName", { length: 255 }).notNull(),
  /** Hashed API key (never store plaintext) */
  keyHash: varchar("keyHash", { length: 255 }).notNull(),
  /** Last 4 characters for identification */
  keyPreview: varchar("keyPreview", { length: 4 }).notNull(),
  /** Status: active, disabled, revoked */
  status: mysqlEnum("status", ["active", "disabled", "revoked"]).default("active").notNull(),
  /** Last used timestamp */
  lastUsedAt: timestamp("lastUsedAt"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Expiration timestamp (optional) */
  expiresAt: timestamp("expiresAt"),
});

export type PartnerApiKey = typeof partnerApiKeys.$inferSelect;
export type InsertPartnerApiKey = typeof partnerApiKeys.$inferInsert;

// ─── Partner Webhooks (Webhooks للشركاء) ───────────────────────────────────
export const partnerWebhooks = mysqlTable("partner_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  /** Partner/Agency ID */
  partnerId: int("partnerId").notNull(),
  /** Webhook URL */
  webhookUrl: varchar("webhookUrl", { length: 1024 }).notNull(),
  /** Webhook secret (for signature verification) */
  webhookSecret: varchar("webhookSecret", { length: 255 }).notNull(),
  /** Status: active, disabled */
  status: mysqlEnum("status", ["active", "disabled"]).default("active").notNull(),
  /** Events to subscribe to (JSON array) */
  events: json("events").$type<string[]>().default(["booking_created", "ticket_issued", "payment_confirmed"]),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerWebhook = typeof partnerWebhooks.$inferSelect;
export type InsertPartnerWebhook = typeof partnerWebhooks.$inferInsert;

// ─── Webhook Delivery Logs (سجل تسليم Webhooks) ──────────────────────────────
export const webhookDeliveryLogs = mysqlTable("webhook_delivery_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** Webhook ID */
  webhookId: int("webhookId").notNull(),
  /** Event type */
  eventType: varchar("eventType", { length: 100 }).notNull(),
  /** Event data (JSON) */
  eventData: json("eventData"),
  /** HTTP status code */
  statusCode: int("statusCode"),
  /** Response body */
  responseBody: text("responseBody"),
  /** Retry count */
  retryCount: int("retryCount").default(0),
  /** Status: pending, success, failed */
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  /** Delivery timestamp */
  deliveredAt: timestamp("deliveredAt"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;

// ─── Settlement Reports (تقارير التسوية) ──────────────────────────────────
export const settlementReports = mysqlTable("settlement_reports", {
  id: int("id").autoincrement().primaryKey(),
  /** Partner/Agency ID */
  partnerId: int("partnerId").notNull(),
  /** Report period start date */
  periodStart: timestamp("periodStart").notNull(),
  /** Report period end date */
  periodEnd: timestamp("periodEnd").notNull(),
  /** Total bookings */
  totalBookings: int("totalBookings").default(0),
  /** Total sales amount */
  totalSales: decimal("totalSales", { precision: 14, scale: 2 }).default("0.00"),
  /** Total commissions earned */
  totalCommissions: decimal("totalCommissions", { precision: 14, scale: 2 }).default("0.00"),
  /** Total markup collected */
  totalMarkup: decimal("totalMarkup", { precision: 14, scale: 2 }).default("0.00"),
  /** Wallet balance at period end */
  walletBalance: decimal("walletBalance", { precision: 14, scale: 2 }).default("0.00"),
  /** Credit used */
  creditUsed: decimal("creditUsed", { precision: 14, scale: 2 }).default("0.00"),
  /** Amount due to Royal Voyage */
  amountDueToRoyalVoyage: decimal("amountDueToRoyalVoyage", { precision: 14, scale: 2 }).default("0.00"),
  /** Amount due to partner */
  amountDueToPartner: decimal("amountDueToPartner", { precision: 14, scale: 2 }).default("0.00"),
  /** Status: draft, finalized, paid */
  status: mysqlEnum("status", ["draft", "finalized", "paid"]).default("draft").notNull(),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SettlementReport = typeof settlementReports.$inferSelect;
export type InsertSettlementReport = typeof settlementReports.$inferInsert;

// ─── API Usage Logs (سجل استخدام API) ────────────────────────────────────
export const apiUsageLogs = mysqlTable("api_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** Partner/Agency ID */
  partnerId: int("partnerId").notNull(),
  /** API endpoint called */
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  /** HTTP method */
  method: varchar("method", { length: 10 }).notNull(),
  /** HTTP status code */
  statusCode: int("statusCode"),
  /** Response time in ms */
  responseTimeMs: int("responseTimeMs"),
  /** Error message (if any) */
  errorMessage: text("errorMessage"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = typeof apiUsageLogs.$inferInsert;

// ─── Monitoring Logs (سجلات المراقبة) ──────────────────────────────────────
export const monitoringLogs = mysqlTable("monitoring_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** Log type: api_error, amadeus_error, hotelbeds_error, payment_error, rate_limit, ticketing_failed, iata_block */
  logType: varchar("logType", { length: 50 }).notNull(),
  /** Severity: info, warning, error, critical */
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  /** Related partner/agency ID (optional) */
  partnerId: int("partnerId"),
  /** Error message */
  message: text("message").notNull(),
  /** Error details (JSON) */
  details: json("details"),
  /** Stack trace (if applicable) */
  stackTrace: text("stackTrace"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitoringLog = typeof monitoringLogs.$inferSelect;
export type InsertMonitoringLog = typeof monitoringLogs.$inferInsert;

// ─── Agency Portal Sessions (جلسات بوابة الوكالة) ───────────────────────────
export const agencyPortalSessions = mysqlTable("agency_portal_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Agency ID */
  agencyId: int("agencyId").notNull(),
  /** Session token */
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  /** User IP address */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** User agent */
  userAgent: text("userAgent"),
  /** Last activity timestamp */
  lastActivityAt: timestamp("lastActivityAt").defaultNow().onUpdateNow(),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Expiration timestamp */
  expiresAt: timestamp("expiresAt"),
});

export type AgencyPortalSession = typeof agencyPortalSessions.$inferSelect;
export type InsertAgencyPortalSession = typeof agencyPortalSessions.$inferInsert;

// ─── Partner Portal Sessions (جلسات بوابة الشريك) ──────────────────────────
export const partnerPortalSessions = mysqlTable("partner_portal_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Partner ID */
  partnerId: int("partnerId").notNull(),
  /** Session token */
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  /** User IP address */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** User agent */
  userAgent: text("userAgent"),
  /** Last activity timestamp */
  lastActivityAt: timestamp("lastActivityAt").defaultNow().onUpdateNow(),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Expiration timestamp */
  expiresAt: timestamp("expiresAt"),
});

export type PartnerPortalSession = typeof partnerPortalSessions.$inferSelect;
export type InsertPartnerPortalSession = typeof partnerPortalSessions.$inferInsert;
