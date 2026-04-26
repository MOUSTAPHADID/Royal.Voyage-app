/**
 * TPConnects Flight Provider Implementation (Skeleton)
 * 
 * This is a placeholder implementation for future TPConnects integration.
 * Currently delegates to Amadeus.
 */

import { IFlightProvider, FlightSearchParams, FlightSearchResult, FlightPriceResult, FlightOffer } from "../flight-provider";
import { amadeusProvider } from "./amadeus-provider";

export const tpconnectsProvider: IFlightProvider = {
  name: "TPConnects",

  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    // TODO: Implement TPConnects API call
    // For now, delegate to Amadeus
    console.warn("TPConnects provider not yet implemented, using Amadeus as fallback");
    return amadeusProvider.searchFlights(params);
  },

  async priceFlightOffer(offerId: string, offer: FlightOffer): Promise<FlightPriceResult> {
    // TODO: Implement TPConnects pricing
    console.warn("TPConnects pricing not yet implemented, using Amadeus as fallback");
    return amadeusProvider.priceFlightOffer(offerId, offer);
  },

  async searchLocations(query: string): Promise<Array<{ iataCode: string; name: string }>> {
    // TODO: Implement TPConnects location search
    console.warn("TPConnects location search not yet implemented, using Amadeus as fallback");
    return amadeusProvider.searchLocations(query);
  },
};
