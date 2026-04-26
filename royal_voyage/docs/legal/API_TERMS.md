# Royal Voyage API Terms

**Effective Date**: April 25, 2026

## 1. API Access

By using Royal Voyage's API, you agree to these terms. API access is provided on an "as-is" basis.

## 2. Authentication

All API requests must include a valid API key in the Authorization header:
```
Authorization: Bearer YOUR_API_KEY
```

API keys are personal and must not be shared. You are responsible for all activity using your API key.

## 3. Rate Limits

- **Standard**: 10,000 requests per hour
- **Burst**: 100 requests per minute
- Rate limit information is included in response headers
- Exceeding limits may result in temporary blocking

## 4. API Stability

Royal Voyage maintains API stability but does not guarantee 100% uptime. Planned maintenance is announced 7 days in advance.

## 5. API Changes

Royal Voyage may modify, deprecate, or remove API endpoints. Deprecation notices are provided 90 days in advance.

## 6. Errors & Debugging

API errors include descriptive messages and error codes. Consult documentation for error handling.

## 7. Compliance

API usage must comply with all applicable laws and regulations, including IATA rules for ticketing.

---

**Version**: 1.0
