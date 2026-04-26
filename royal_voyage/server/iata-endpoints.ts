/**
 * IATA Agency Management REST Endpoints
 * Mounted in server/_core/index.ts
 */

import { Router, type Request, type Response } from "express";
import {
  getAgencyById,
  getAgencies,
  createIataAgency,
  approveAgency,
  rejectAgency,
  suspendAgency,
  getAgencyActivityLogs,
  getAgencyWalletTransactions,
  addWalletTransaction,
  canAgencyTicket,
  getAvailableCredit,
} from "./iata-agency";

export const iataRouter = Router();

// ─── GET /api/iata/agencies ────────────────────────────────────────────────
iataRouter.get("/agencies", async (req: Request, res: Response) => {
  try {
    const { status, country } = req.query;
    const agencies = await getAgencies({
      status: status as string | undefined,
      country: country as string | undefined,
    });
    res.json({ success: true, data: agencies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/iata/agencies/:id ────────────────────────────────────────────
iataRouter.get("/agencies/:id", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const agency = await getAgencyById(agencyId);
    if (!agency) {
      return res.status(404).json({ success: false, error: "Agency not found" });
    }
    res.json({ success: true, data: agency });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/iata/agencies ──────────────────────────────────────────────
iataRouter.post("/agencies", async (req: Request, res: Response) => {
  try {
    const agencyId = await createIataAgency(req.body);
    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      agencyId,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── POST /api/iata/agencies/:id/approve ──────────────────────────────────
iataRouter.post("/agencies/:id/approve", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ success: false, error: "approvedBy is required" });
    }

    await approveAgency(agencyId, approvedBy);
    res.json({ success: true, message: "Agency approved successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/iata/agencies/:id/reject ───────────────────────────────────
iataRouter.post("/agencies/:id/reject", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { reason, rejectedBy } = req.body;

    if (!reason || !rejectedBy) {
      return res.status(400).json({ success: false, error: "reason and rejectedBy are required" });
    }

    await rejectAgency(agencyId, reason, rejectedBy);
    res.json({ success: true, message: "Agency rejected successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/iata/agencies/:id/suspend ──────────────────────────────────
iataRouter.post("/agencies/:id/suspend", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { reason, suspendedBy } = req.body;

    if (!reason || !suspendedBy) {
      return res.status(400).json({ success: false, error: "reason and suspendedBy are required" });
    }

    await suspendAgency(agencyId, reason, suspendedBy);
    res.json({ success: true, message: "Agency suspended successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/iata/agencies/:id/logs ───────────────────────────────────────
iataRouter.get("/agencies/:id/logs", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { limit } = req.query;
    const logs = await getAgencyActivityLogs(agencyId, parseInt(limit as string) || 50);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/iata/agencies/:id/wallet ─────────────────────────────────────
iataRouter.get("/agencies/:id/wallet", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { limit } = req.query;
    const transactions = await getAgencyWalletTransactions(agencyId, parseInt(limit as string) || 50);
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/iata/agencies/:id/wallet/deposit ────────────────────────────
iataRouter.post("/agencies/:id/wallet/deposit", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const { amount, currency, description, referenceId } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ success: false, error: "amount and currency are required" });
    }

    const newBalance = await addWalletTransaction(
      agencyId,
      "deposit",
      amount,
      currency,
      description || "Wallet deposit",
      referenceId
    );

    res.json({
      success: true,
      message: "Deposit successful",
      newBalance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/iata/agencies/:id/ticketing-permission ──────────────────────
iataRouter.get("/agencies/:id/ticketing-permission", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const result = await canAgencyTicket(agencyId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/iata/agencies/:id/available-credit ───────────────────────────
iataRouter.get("/agencies/:id/available-credit", async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);
    const availableCredit = await getAvailableCredit(agencyId);
    res.json({ success: true, data: { availableCredit } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
