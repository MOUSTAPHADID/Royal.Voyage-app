/**
 * Flight Provider Abstraction Layer
 * 
 * Supports multiple flight search providers (Amadeus, TPConnects, etc.)
 * Allows seamless switching between providers without changing client code.
 */

import { z } from "zod";

// ─── Type Definitions ────────────────────────────────────────────────────────

export const FlightOfferSchema = z.object({
  id: z.string(),
  source: z.string(),
  instantTicketingRequired: z.boolean().optional(),
  nonHomogeneous: z.boolean().optional(),
  oneWay: z.boolean().optional(),
  lastTicketingDate: z.string().optional(),
  numberOfBookableSeats: z.number().optional(),
  itineraries: z.array(z.object({
    duration: z.string(),
    segments: z.array(z.object({
      departure: z.object({
        iataCode: z.string(),
        terminal: z.string().optional(),
        at: z.string(),
      }),
      arrival: z.object({
        iataCode: z.string(),
        terminal: z.string().optional(),
        at: z.string(),
      }),
      carrierCode: z.string(),
      number: z.string(),
      aircraft: z.object({
        code: z.string(),
      }).optional(),
      operating: z.object({
        carrierCode: z.string(),
      }).optional(),
      stops: z.number().optional(),
      class: z.string().optional(),
    })),
  })),
  price: z.object({
    currency: z.string(),
    total: z.string(),
    base: z.string(),
    fee: z.string().optional(),
    grandTotal: z.string(),
  }),
  pricingOptions: z.object({
    fareType: z.array(z.string()).optional(),
    includedCheckedBagsOnly: z.boolean().optional(),
  }).optional(),
  validatingAirlineCodes: z.array(z.string()).optional(),
  travelerPricings: z.array(z.object({
    travelerId: z.string(),
    fareOption: z.string(),
    travelerType: z.string(),
    price: z.object({
      currency: z.string(),
      total: z.string(),
      base: z.string(),
    }).optional(),
    fareDetailsBySegment: z.array(z.object({
      segmentId: z.string(),
      cabin: z.string().optional(),
      fareBasis: z.string().optional(),
      class: z.string().optional(),
      includedCheckedBags: z.object({
        weight: z.number().optional(),
        weightUnit: z.string().optional(),
      }).optional(),
    })).optional(),
  })).optional(),
});

export type FlightOffer = z.infer<typeof FlightOfferSchema>;

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStop?: boolean;
  maxPrice?: number;
  currencyCode?: string;
}

export interface FlightSearchResult {
  data: FlightOffer[];
  dictionaries?: {
    locations?: Record<string, any>;
    aircraft?: Record<string, any>;
    airlines?: Record<string, any>;
    currencies?: Record<string, any>;
  };
}

export interface FlightPriceResult {
  data: FlightOffer;
  type: string;
}

// ─── Provider Interface ──────────────────────────────────────────────────────

export interface IFlightProvider {
  name: string;
  searchFlights(params: FlightSearchParams): Promise<FlightSearchResult>;
  priceFlightOffer(offerId: string, offer: FlightOffer): Promise<FlightPriceResult>;
  searchLocations(query: string): Promise<Array<{ iataCode: string; name: string }>>;
}

// ─── Provider Factory ────────────────────────────────────────────────────────

export type ProviderType = "amadeus" | "tpconnects";

export function getFlightProvider(providerType: ProviderType): IFlightProvider {
  switch (providerType) {
    case "amadeus":
      return require("./providers/amadeus-provider").amadeusProvider;
    case "tpconnects":
      return require("./providers/tpconnects-provider").tpconnectsProvider;
    default:
      throw new Error(`Unknown flight provider: ${providerType}`);
  }
}

// ─── Default Provider ───────────────────────────────────────────────────────

const DEFAULT_PROVIDER: ProviderType = "amadeus";

export function getDefaultFlightProvider(): IFlightProvider {
  return getFlightProvider(DEFAULT_PROVIDER);
}
