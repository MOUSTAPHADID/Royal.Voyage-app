# Partner API Documentation

The Partner API provides a secure REST interface for third-party integrations to search and book flights without exposing sensitive credentials (Amadeus API keys, Stripe secrets, etc.).

## Overview

- **Base URL**: `https://api.royalvoyage.online/api/partner` (or local: `http://localhost:3000/api/partner`)
- **Authentication**: API Key via `X-API-Key` header
- **Rate Limiting**: 100 requests per minute per API key
- **Response Format**: JSON

## Authentication

All requests must include the `X-API-Key` header:

```bash
curl -H "X-API-Key: partner-key-12345" \
  https://api.royalvoyage.online/api/partner/health
```

### Rate Limiting

Each response includes the `X-RateLimit-Remaining` header indicating remaining requests in the current window:

```
X-RateLimit-Remaining: 87
```

If you exceed 100 requests per minute, you'll receive a `429 Too Many Requests` response.

## Endpoints

### 1. Search Flights

**Endpoint**: `POST /api/partner/search-flights`

Search for available flights based on origin, destination, dates, and passenger count.

**Request Body**:

```json
{
  "origin": "CDG",
  "destination": "LAX",
  "departureDate": "2024-06-15",
  "returnDate": "2024-06-22",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "cabinClass": "ECONOMY",
  "nonStop": false,
  "maxPrice": 1500,
  "currency": "EUR"
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | Yes | 3-letter IATA code (e.g., "CDG") |
| `destination` | string | Yes | 3-letter IATA code (e.g., "LAX") |
| `departureDate` | string | Yes | Date in YYYY-MM-DD format |
| `returnDate` | string | No | Return date for round-trip flights |
| `adults` | number | Yes | 1-9 adults |
| `children` | number | No | 0-8 children (default: 0) |
| `infants` | number | No | 0-4 infants (default: 0) |
| `cabinClass` | string | No | One of: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST |
| `nonStop` | boolean | No | Filter for non-stop flights only |
| `maxPrice` | number | No | Maximum price in the specified currency |
| `currency` | string | No | 3-letter currency code (e.g., "EUR") |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "source": "GDS",
      "instantTicketingRequired": false,
      "nonHomogeneous": false,
      "oneWay": false,
      "lastTicketingDate": "2024-06-13",
      "numberOfBookableSeats": 9,
      "itineraries": [
        {
          "duration": "PT10H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "CDG",
                "at": "2024-06-15T10:30:00"
              },
              "arrival": {
                "iataCode": "LAX",
                "at": "2024-06-15T14:00:00"
              },
              "carrierCode": "AF",
              "number": "100",
              "aircraft": {
                "code": "777"
              },
              "stops": 0
            }
          ]
        }
      ],
      "price": {
        "currency": "EUR",
        "total": "850.00",
        "base": "750.00",
        "fee": "0.00",
        "grandTotal": "850.00"
      }
    }
  ],
  "dictionaries": {
    "locations": {},
    "aircraft": {},
    "airlines": {},
    "currencies": {}
  }
}
```

### 2. Price Flight Offer

**Endpoint**: `POST /api/partner/price-flight`

Revalidate the price of a specific flight offer before booking.

**Request Body**:

```json
{
  "offerId": "1",
  "offer": {
    "id": "1",
    "source": "GDS",
    "instantTicketingRequired": false,
    "price": {
      "currency": "EUR",
      "total": "850.00",
      "base": "750.00",
      "fee": "0.00",
      "grandTotal": "850.00"
    }
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "source": "GDS",
    "price": {
      "currency": "EUR",
      "total": "850.00",
      "base": "750.00",
      "fee": "0.00",
      "grandTotal": "850.00"
    }
  },
  "type": "flight-offers-pricing"
}
```

### 3. Search Locations

**Endpoint**: `POST /api/partner/search-locations`

Search for airports and cities by name or code.

**Request Body**:

```json
{
  "query": "Paris"
}
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "iataCode": "CDG",
      "name": "Paris Charles de Gaulle"
    },
    {
      "iataCode": "ORY",
      "name": "Paris Orly"
    }
  ]
}
```

### 4. Health Check

**Endpoint**: `GET /api/partner/health`

Check the API status and your rate limit.

**Response**:

```json
{
  "status": "ok",
  "partnerId": "partner-key-12345",
  "rateLimitRemaining": 87
}
```

## Error Handling

### Missing API Key

**Status**: 401 Unauthorized

```json
{
  "error": "Missing API key"
}
```

### Invalid Request

**Status**: 400 Bad Request

```json
{
  "error": "Invalid request",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "path": ["adults"],
      "message": "Number must be greater than or equal to 1"
    }
  ]
}
```

### Rate Limit Exceeded

**Status**: 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded"
}
```

### Server Error

**Status**: 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Integration Examples

### cURL

```bash
# Search flights
curl -X POST https://api.royalvoyage.online/api/partner/search-flights \
  -H "X-API-Key: partner-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CDG",
    "destination": "LAX",
    "departureDate": "2024-06-15",
    "adults": 2,
    "cabinClass": "ECONOMY"
  }'
```

### JavaScript/Node.js

```javascript
const apiKey = "partner-key-12345";
const baseUrl = "https://api.royalvoyage.online/api/partner";

async function searchFlights(params) {
  const response = await fetch(`${baseUrl}/search-flights`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Usage
const flights = await searchFlights({
  origin: "CDG",
  destination: "LAX",
  departureDate: "2024-06-15",
  adults: 2,
  cabinClass: "ECONOMY",
});

console.log(flights.data);
```

### Python

```python
import requests

API_KEY = "partner-key-12345"
BASE_URL = "https://api.royalvoyage.online/api/partner"

def search_flights(params):
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    }
    response = requests.post(
        f"{BASE_URL}/search-flights",
        json=params,
        headers=headers,
    )
    response.raise_for_status()
    return response.json()

# Usage
flights = search_flights({
    "origin": "CDG",
    "destination": "LAX",
    "departureDate": "2024-06-15",
    "adults": 2,
    "cabinClass": "ECONOMY",
})

print(flights["data"])
```

## Security Notes

1. **API Keys**: Keep your API key secret. Do not commit it to version control.
2. **HTTPS**: Always use HTTPS in production. HTTP is only for local development.
3. **Credentials**: The Partner API does not expose Amadeus credentials, Stripe secrets, or any other sensitive data.
4. **Rate Limiting**: Implement exponential backoff when you receive 429 responses.
5. **Data Validation**: Validate all user input before sending to the Partner API.

## Support

For issues or questions, contact: support@royalvoyage.online

## Changelog

### v1.0.0 (2024-06-01)

- Initial release
- Search flights endpoint
- Price flight endpoint
- Search locations endpoint
- Health check endpoint
- API key authentication
- Rate limiting (100 req/min per key)
