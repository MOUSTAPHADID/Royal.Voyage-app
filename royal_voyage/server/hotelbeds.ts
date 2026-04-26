import crypto from "crypto";
import axios from "axios";

/**
 * Hotelbeds API Integration
 * Handles authentication, connection testing, and hotel searches
 * Credentials stored in environment variables only
 */

interface HotelbedsConfig {
  apiKey: string;
  secret: string;
  baseUrl: string;
}

interface HotelbedsSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
}

interface HotelbedsHotel {
  id: number;
  name: string;
  destination: string;
  rating?: number;
  price?: number;
  currency?: string;
}

/**
 * Get Hotelbeds configuration from environment variables
 */
function getConfig(): HotelbedsConfig | null {
  const apiKey = process.env.HOTELBEDS_API_KEY;
  const secret = process.env.HOTELBEDS_SECRET;
  const baseUrl = process.env.HOTELBEDS_BASE_URL || "https://api.test.hotelbeds.com";

  if (!apiKey || !secret) {
    console.warn("[Hotelbeds] API credentials missing");
    return null;
  }

  return { apiKey, secret, baseUrl };
}

/**
 * Generate Hotelbeds API signature
 * Signature = SHA256(apiKey + secret + timestamp)
 */
function generateSignature(apiKey: string, secret: string, timestamp: number): string {
  const message = `${apiKey}${secret}${timestamp}`;
  return crypto.createHash("sha256").update(message).digest("hex");
}

/**
 * Test connection to Hotelbeds API
 * Makes a simple availability check request
 */
export async function testHotelbedsConnection(): Promise<{
  success: boolean;
  provider: string;
  environment: string;
  message?: string;
  error?: string;
  statusCode?: number;
}> {
  const config = getConfig();

  if (!config) {
    console.warn("[Hotelbeds] Test failed: credentials missing");
    return {
      success: false,
      provider: "hotelbeds",
      environment: "sandbox",
      error: "Hotelbeds API credentials are missing",
    };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(config.apiKey, config.secret, timestamp);

    console.log("[Hotelbeds] Testing connection to:", config.baseUrl);
    console.log("[Hotelbeds] Test request timestamp:", timestamp);

    // Test with a simple availability check
    const response = await axios.get(`${config.baseUrl}/hotel-api/1.0/hotels`, {
      headers: {
        "X-Signature": signature,
        "X-Timestamp": String(timestamp),
        "Api-Key": config.apiKey,
        Accept: "application/json",
      },
      params: {
        fields: "all",
        language: "en",
      },
      timeout: 10000,
    });

    console.log("[Hotelbeds] Connection successful, status:", response.status);

    return {
      success: true,
      provider: "hotelbeds",
      environment: "sandbox",
      message: "Hotelbeds connection successful",
    };
  } catch (error: any) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";

    console.error("[Hotelbeds] Connection failed");
    console.error("[Hotelbeds] Status code:", statusCode);
    console.error("[Hotelbeds] Error message:", errorMessage);

    return {
      success: false,
      provider: "hotelbeds",
      environment: "sandbox",
      error: errorMessage,
      statusCode,
    };
  }
}

/**
 * Search hotels on Hotelbeds API
 * Sends real API request (no mock data)
 */
export async function searchHotelbedsHotels(
  params: HotelbedsSearchParams
): Promise<HotelbedsHotel[]> {
  const config = getConfig();

  if (!config) {
    console.error("[Hotelbeds] Search failed: credentials missing");
    throw new Error("Hotelbeds API credentials are missing");
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(config.apiKey, config.secret, timestamp);

    console.log("[Hotelbeds] Searching hotels");
    console.log("[Hotelbeds] Destination:", params.destination);
    console.log("[Hotelbeds] Check-in:", params.checkIn);
    console.log("[Hotelbeds] Check-out:", params.checkOut);
    console.log("[Hotelbeds] Guests:", params.guests);

    const response = await axios.post(
      `${config.baseUrl}/hotel-api/1.0/hotels`,
      {
        stay: {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        },
        occupancies: [
          {
            rooms: params.rooms || 1,
            adults: params.guests,
            children: 0,
          },
        ],
        destination: {
          code: params.destination,
        },
        language: "en",
        currency: "USD",
      },
      {
        headers: {
          "X-Signature": signature,
          "X-Timestamp": String(timestamp),
          "Api-Key": config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("[Hotelbeds] Search successful, hotels found:", response.data?.hotels?.length || 0);

    // Transform Hotelbeds response to our format
    const hotels: HotelbedsHotel[] = (response.data?.hotels || []).map((h: any) => ({
      id: h.code,
      name: h.name,
      destination: params.destination,
      rating: h.categoryCode ? parseInt(h.categoryCode) : undefined,
      price: h.minRate,
      currency: "USD",
    }));

    return hotels;
  } catch (error: any) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";

    console.error("[Hotelbeds] Search failed");
    console.error("[Hotelbeds] Status code:", statusCode);
    console.error("[Hotelbeds] Error message:", errorMessage);

    throw new Error(`Hotelbeds search failed: ${errorMessage}`);
  }
}

/**
 * Get hotel details from Hotelbeds
 */
export async function getHotelbedsHotelDetails(hotelCode: number): Promise<any> {
  const config = getConfig();

  if (!config) {
    throw new Error("Hotelbeds API credentials are missing");
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(config.apiKey, config.secret, timestamp);

    const response = await axios.get(
      `${config.baseUrl}/hotel-api/1.0/hotels/${hotelCode}`,
      {
        headers: {
          "X-Signature": signature,
          "X-Timestamp": String(timestamp),
          "Api-Key": config.apiKey,
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[Hotelbeds] Get hotel details failed:", error.message);
    throw error;
  }
}

/**
 * Check Hotelbeds availability
 */
export async function checkHotelbedsAvailability(
  hotelCode: number,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<boolean> {
  const config = getConfig();

  if (!config) {
    throw new Error("Hotelbeds API credentials are missing");
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(config.apiKey, config.secret, timestamp);

    const response = await axios.post(
      `${config.baseUrl}/hotel-api/1.0/checkrates`,
      {
        hotel: hotelCode,
        stay: {
          checkIn,
          checkOut,
        },
        occupancies: [
          {
            rooms: 1,
            adults: guests,
            children: 0,
          },
        ],
        language: "en",
        currency: "USD",
      },
      {
        headers: {
          "X-Signature": signature,
          "X-Timestamp": String(timestamp),
          "Api-Key": config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error("[Hotelbeds] Availability check failed:", error.message);
    return false;
  }
}
