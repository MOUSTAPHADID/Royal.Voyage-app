/**
 * Partner API - REST Layer for Third-Party Integrations
 * 
 * Provides a secure REST API for external partners to search and book flights
 * without exposing internal credentials (Amadeus, Stripe, etc.).
 * 
 * Features:
 * - API Key authentication
 * - Rate limiting per partner
 * - No credential exposure
 * - Flight provider abstraction
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getFlightProvider } from "./flight-provider";
import type { IFlightProvider, FlightSearchParams } from "./flight-provider";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PartnerContext {
  partnerId: string;
  apiKey: string;
  provider: IFlightProvider;
  rateLimitRemaining: number;
}

interface AuthenticatedRequest extends Request {
  partner?: PartnerContext;
  headers: Record<string, any>;
  body: Record<string, any>;
}

// ─── Validation Schemas ─────────────────────────────────────────────────────

const SearchFlightsSchema = z.object({
  origin: z.string().length(3, "Origin must be 3-letter IATA code"),
  destination: z.string().length(3, "Destination must be 3-letter IATA code"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8).optional(),
  infants: z.number().int().min(0).max(4).optional(),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
  nonStop: z.boolean().optional(),
  maxPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

const PriceFlightSchema = z.object({
  offerId: z.string(),
  offer: z.record(z.string(), z.any()),
});

const SearchLocationsSchema = z.object({
  query: z.string().min(1).max(100),
});

// ─── Rate Limiting ──────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(partnerId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(partnerId) as { count: number; resetTime: number } | undefined;

  if (!record || now > record.resetTime) {
    rateLimitMap.set(partnerId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function getRateLimitRemaining(partnerId: string): number {
  const record = rateLimitMap.get(partnerId);
  if (!record || Date.now() > record.resetTime) {
    return RATE_LIMIT_MAX;
  }
  return Math.max(0, RATE_LIMIT_MAX - record.count);
}

// ─── Authentication Middleware ──────────────────────────────────────────────

function authenticatePartner(req: AuthenticatedRequest, res: Response, next: NextFunction): any {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  // TODO: Validate API key against database
  // For now, accept any non-empty key
  const partnerId = apiKey.split("-")[0] || "unknown";

  if (!checkRateLimit(partnerId)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  req.partner = {
    partnerId,
    apiKey,
    provider: getFlightProvider("amadeus"),
    rateLimitRemaining: getRateLimitRemaining(partnerId),
  };

  res.setHeader("X-RateLimit-Remaining", req.partner.rateLimitRemaining);
  next();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

export const partnerRouter = Router() as any;

// Apply authentication to all routes
partnerRouter.use(authenticatePartner);

/**
 * POST /api/partner/search-flights
 * Search for flights
 */
partnerRouter.post("/search-flights", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const body = SearchFlightsSchema.parse(req.body);

    if (!req.partner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const params: FlightSearchParams = {
      originLocationCode: body.origin,
      destinationLocationCode: body.destination,
      departureDate: body.departureDate,
      returnDate: body.returnDate,
      adults: body.adults,
      children: body.children,
      infants: body.infants,
      travelClass: body.cabinClass,
      nonStop: body.nonStop,
      maxPrice: body.maxPrice,
      currencyCode: body.currency,
    };

    const result = await req.partner.provider.searchFlights(params);

    res.json({
      success: true,
      data: result.data,
      dictionaries: result.dictionaries,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.issues });
    }
    console.error("Search flights error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/partner/price-flight
 * Price a specific flight offer
 */
partnerRouter.post("/price-flight", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const body = PriceFlightSchema.parse(req.body);

    if (!req.partner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await req.partner.provider.priceFlightOffer(body.offerId, body.offer as any);

    res.json({
      success: true,
      data: result.data,
      type: result.type,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.issues });
    }
    console.error("Price flight error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/partner/search-locations
 * Search for airport/city locations
 */
partnerRouter.post("/search-locations", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const body = SearchLocationsSchema.parse(req.body);

    if (!req.partner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const locations = await req.partner.provider.searchLocations(body.query);

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: error.issues });
    }
    console.error("Search locations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/partner/health
 * Health check endpoint
 */
partnerRouter.get("/health", (req: AuthenticatedRequest, res: Response): any => {
  res.json({
    status: "ok",
    partnerId: req.partner?.partnerId,
    rateLimitRemaining: req.partner?.rateLimitRemaining,
  });
});
