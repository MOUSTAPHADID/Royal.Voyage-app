/**
 * Amadeus Flight Provider Implementation
 */

import { IFlightProvider, FlightSearchParams, FlightSearchResult, FlightPriceResult, FlightOffer } from "../flight-provider";
// @ts-ignore
import Amadeus from "amadeus";

const isProd = !!(process.env.AMADEUS_PROD_CLIENT_ID && process.env.AMADEUS_PROD_CLIENT_SECRET);

const amadeus = new Amadeus({
  clientId: isProd
    ? process.env.AMADEUS_PROD_CLIENT_ID!
    : process.env.AMADEUS_CLIENT_ID!,
  clientSecret: isProd
    ? process.env.AMADEUS_PROD_CLIENT_SECRET!
    : process.env.AMADEUS_CLIENT_SECRET!,
  hostname: isProd ? "production" : "test",
});

export const amadeusProvider: IFlightProvider = {
  name: "Amadeus",

  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults.toString(),
      children: params.children?.toString(),
      infants: params.infants?.toString(),
      travelClass: params.travelClass,
      nonStop: params.nonStop ? "true" : undefined,
      maxPrice: params.maxPrice?.toString(),
      currencyCode: params.currencyCode,
    });

    return {
      data: response.data || [],
      dictionaries: response.dictionaries,
    };
  },

  async priceFlightOffer(offerId: string, offer: FlightOffer): Promise<FlightPriceResult> {
    const response = await amadeus.shopping.flightOffers.pricing.post({
      data: {
        type: "flight-offers-pricing",
        flightOffers: [offer],
      },
    });

    return {
      data: response.data.flightOffers?.[0] || offer,
      type: response.data.type || "flight-offers-pricing",
    };
  },

  async searchLocations(query: string): Promise<Array<{ iataCode: string; name: string }>> {
    const response = await amadeus.referenceData.locations.get({
      keyword: query,
      subType: "AIRPORT,CITY",
    });

    return (response.data || []).map((location: any) => ({
      iataCode: location.iataCode,
      name: location.name,
    }));
  },
};
