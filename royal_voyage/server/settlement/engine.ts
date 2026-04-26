export interface SettlementReport {
  id: string;
  partnerId: string;
  month: string;
  totalSales: number;
  bookingsCount: number;
  commissions: number;
  markup: number;
  walletBalance: number;
  creditUsed: number;
  amountDueToRoyalVoyage: number;
  amountDueToPartner: number;
  status: "draft" | "finalized" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for settlement reports (in production, use database)
const settlementReports: Map<string, SettlementReport> = new Map();

/**
 * Settlement Automation Engine
 * Generates settlement reports automatically (daily, weekly, monthly)
 */
export class SettlementEngine {
  /**
   * Generate settlement report for a partner
   */
  static generateSettlementReport(
    partnerId: string,
    month: string // Format: YYYY-MM
  ): SettlementReport {
    const reportId = `settlement_${partnerId}_${month}`;

    // Mock data - in production, this would come from actual booking records
    const totalSales = Math.random() * 50000 + 10000;
    const bookingsCount = Math.floor(Math.random() * 100 + 10);
    const commissionRate = 0.05; // 5% commission
    const commissions = totalSales * commissionRate;
    const markup = totalSales * 0.02; // 2% markup
    const walletBalance = Math.random() * 20000 + 5000;
    const creditUsed = Math.random() * 10000 + 1000;

    const amountDueToRoyalVoyage = commissions + markup;
    const amountDueToPartner = totalSales - amountDueToRoyalVoyage;

    const now = new Date();
    const report: SettlementReport = {
      id: reportId,
      partnerId,
      month,
      totalSales,
      bookingsCount,
      commissions,
      markup,
      walletBalance,
      creditUsed,
      amountDueToRoyalVoyage,
      amountDueToPartner,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    settlementReports.set(reportId, report);
    console.log(`[Settlement] Report generated for ${partnerId} (${month})`);

    return report;
  }

  /**
   * Generate settlement reports for all partners
   */
  static generateAllSettlementReports(month: string): SettlementReport[] {
    // In production, get all unique partners from database
    const partnerIds = ["partner_1", "partner_2", "partner_3"];

    const reports = partnerIds.map((partnerId) =>
      this.generateSettlementReport(partnerId, month)
    );

    console.log(`[Settlement] Generated ${reports.length} reports for month ${month}`);
    return reports;
  }

  /**
   * Get settlement report
   */
  static getSettlementReport(reportId: string): SettlementReport | undefined {
    return settlementReports.get(reportId);
  }

  /**
   * List settlement reports for a partner
   */
  static listSettlementReports(partnerId: string): SettlementReport[] {
    const reports = Array.from(settlementReports.values()).filter(
      (r) => r.partnerId === partnerId
    );
    return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Finalize settlement report
   */
  static finalizeSettlement(reportId: string): SettlementReport | undefined {
    const report = settlementReports.get(reportId);
    if (report) {
      report.status = "finalized";
      report.updatedAt = new Date();
      console.log(`[Settlement] Report ${reportId} finalized`);
    }
    return report;
  }

  /**
   * Mark settlement as paid
   */
  static markSettlementAsPaid(reportId: string): SettlementReport | undefined {
    const report = settlementReports.get(reportId);
    if (report) {
      report.status = "paid";
      report.updatedAt = new Date();
      console.log(`[Settlement] Report ${reportId} marked as paid`);
    }
    return report;
  }

  /**
   * Export settlement report as CSV
   */
  static exportSettlementAsCSV(reportId: string): string {
    const report = settlementReports.get(reportId);
    if (!report) {
      throw new Error("Settlement report not found");
    }

    // Create CSV header
    const csvHeader = [
      "Settlement Report",
      `Partner ID: ${report.partnerId}`,
      `Month: ${report.month}`,
      `Status: ${report.status}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Metric,Value",
    ].join("\n");

    // Create CSV data rows
    const csvData = [
      `Total Sales,$${report.totalSales.toFixed(2)}`,
      `Bookings Count,${report.bookingsCount}`,
      `Commissions,$${report.commissions.toFixed(2)}`,
      `Markup,$${report.markup.toFixed(2)}`,
      `Wallet Balance,$${report.walletBalance.toFixed(2)}`,
      `Credit Used,$${report.creditUsed.toFixed(2)}`,
      `Amount Due to Royal Voyage,$${report.amountDueToRoyalVoyage.toFixed(2)}`,
      `Amount Due to Partner,$${report.amountDueToPartner.toFixed(2)}`,
    ].join("\n");

    return `${csvHeader}\n${csvData}`;
  }

  /**
   * Schedule daily settlement generation
   */
  static scheduleDailySettlements(): void {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    this.generateAllSettlementReports(month);
  }

  /**
   * Schedule weekly settlement generation
   */
  static scheduleWeeklySettlements(): void {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    this.generateAllSettlementReports(month);
  }

  /**
   * Schedule monthly settlement generation
   */
  static scheduleMonthlySettlements(): void {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    this.generateAllSettlementReports(month);
  }
}
