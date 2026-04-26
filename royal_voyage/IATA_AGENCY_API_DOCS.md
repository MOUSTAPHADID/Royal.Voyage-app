# IATA Agency Management API Documentation

## Overview

The IATA Agency Management system allows Royal Voyage to manage travel agencies with IATA numbers, TPConnects integration, ticketing permissions, payment methods, and comprehensive activity logging.

## Database Schema

### Tables

#### `iata_agencies`
Stores agency information with IATA numbers, credentials, payment settings, and status.

**Key Fields:**
- `id` - Primary key
- `companyName` - Agency name
- `iataNumber` - IATA number (unique)
- `commercialRegistrationNumber` - Business registration
- `taxNumber` - Tax ID
- `responsiblePersonName` - Contact person
- `email` - Contact email
- `phone` - Contact phone
- `country` - Country of operation
- `bookingProvider` - "amadeus" or "tpconnects"
- `pccOfficeId` - PCC for Amadeus
- `ticketingPermission` - "search_only", "booking_only", or "booking_ticketing"
- `ticketingOwner` - "royal_voyage" or "partner_agency"
- `paymentMethod` - "wallet", "credit_limit", "bank_transfer", "iata_easypay", "royal_voyage_settlement"
- `creditLimit` - Credit limit (decimal)
- `usedCredit` - Used credit (decimal)
- `markupType` - "fixed" or "percentage"
- `markupValue` - Markup amount
- `commissionType` - "fixed" or "percentage"
- `commissionValue` - Commission amount
- `status` - "pending", "approved", "rejected", "suspended"
- `walletBalance` - Current wallet balance (decimal)
- `createdAt` - Creation timestamp
- `approvedAt` - Approval timestamp
- `approvedBy` - Admin ID who approved

#### `agency_activity_logs`
Tracks all agency actions for audit trail.

**Key Fields:**
- `id` - Primary key
- `agencyId` - Reference to agency
- `actionType` - "search", "booking", "ticketing", "payment", "wallet_transaction", "refund", "cancellation", "status_change", "settings_update", "admin_note"
- `description` - Action description
- `amount` - Transaction amount (optional)
- `currency` - Currency code (optional)
- `provider` - API provider used (optional)
- `referenceId` - External reference ID (optional)
- `createdBy` - Admin ID (optional)
- `createdAt` - Timestamp

#### `wallet_transactions`
Tracks wallet deposits, withdrawals, charges, and refunds.

**Key Fields:**
- `id` - Primary key
- `agencyId` - Reference to agency
- `type` - "deposit", "withdrawal", "charge", "refund", "commission"
- `amount` - Transaction amount (decimal)
- `currency` - Currency code
- `description` - Transaction description
- `referenceId` - External reference ID
- `balanceAfter` - Balance after transaction (decimal)
- `createdAt` - Timestamp

#### `agency_bookings`
Stores bookings made by agencies.

**Key Fields:**
- `id` - Primary key
- `agencyId` - Reference to agency
- `bookingReference` - Unique booking reference
- `provider` - "amadeus", "hotelbeds", etc.
- `providerBookingId` - Provider's booking ID
- `passengerName` - Passenger name
- `routeSummary` - Route summary
- `basePrice` - Base price (decimal)
- `markup` - Markup amount (decimal)
- `commission` - Commission amount (decimal)
- `totalPrice` - Total price (decimal)
- `currency` - Currency code
- `status` - "pending", "confirmed", "ticketed", "cancelled", "refunded"
- `ticketNumber` - Ticket number (optional)
- `ticketingStatus` - "pending", "issued", "cancelled"
- `paymentStatus` - "pending", "paid", "refunded"
- `createdAt` - Creation timestamp

## REST API Endpoints

### Get All Agencies

```http
GET /api/iata/agencies?status=approved&country=Egypt
```

**Query Parameters:**
- `status` (optional) - Filter by status: "pending", "approved", "rejected", "suspended"
- `country` (optional) - Filter by country

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "companyName": "Travel Agency ABC",
      "iataNumber": "12345678",
      "status": "approved",
      "walletBalance": "5000.00",
      "createdAt": "2026-04-25T10:00:00Z"
    }
  ]
}
```

### Get Agency by ID

```http
GET /api/iata/agencies/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "companyName": "Travel Agency ABC",
    "iataNumber": "12345678",
    "responsiblePersonName": "John Doe",
    "email": "john@agency.com",
    "phone": "+20123456789",
    "country": "Egypt",
    "bookingProvider": "amadeus",
    "ticketingPermission": "booking_ticketing",
    "paymentMethod": "wallet",
    "walletBalance": "5000.00",
    "markupType": "percentage",
    "markupValue": "5.00",
    "commissionType": "percentage",
    "commissionValue": "2.50",
    "status": "approved",
    "createdAt": "2026-04-25T10:00:00Z"
  }
}
```

### Create Agency

```http
POST /api/iata/agencies
Content-Type: application/json

{
  "companyName": "Travel Agency ABC",
  "commercialRegistrationNumber": "REG123456",
  "taxNumber": "TAX123456",
  "responsiblePersonName": "John Doe",
  "jobTitle": "Owner",
  "email": "john@agency.com",
  "phone": "+20123456789",
  "country": "Egypt",
  "city": "Cairo",
  "bookingProvider": "amadeus",
  "ticketingPermission": "booking_ticketing",
  "paymentMethod": "wallet",
  "markupType": "percentage",
  "markupValue": "5.00",
  "commissionType": "percentage",
  "commissionValue": "2.50"
}
```

**Response:**
```json
{
  "success": true,
  "agencyId": 1
}
```

### Approve Agency

```http
POST /api/iata/agencies/:id/approve
Content-Type: application/json

{
  "approvedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agency approved"
}
```

### Reject Agency

```http
POST /api/iata/agencies/:id/reject
Content-Type: application/json

{
  "reason": "Missing required documents",
  "rejectedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agency rejected"
}
```

### Suspend Agency

```http
POST /api/iata/agencies/:id/suspend
Content-Type: application/json

{
  "reason": "Payment overdue",
  "suspendedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agency suspended"
}
```

### Get Agency Activity Logs

```http
GET /api/iata/agencies/:id/logs?limit=50
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of logs to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agencyId": 1,
      "actionType": "booking",
      "description": "Flight booking CAI-LHR",
      "amount": "500.00",
      "currency": "USD",
      "provider": "amadeus",
      "createdAt": "2026-04-25T10:00:00Z"
    }
  ]
}
```

### Get Wallet Transactions

```http
GET /api/iata/agencies/:id/wallet?limit=50
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of transactions to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agencyId": 1,
      "type": "deposit",
      "amount": "1000.00",
      "currency": "USD",
      "description": "Wallet deposit",
      "balanceAfter": "6000.00",
      "createdAt": "2026-04-25T10:00:00Z"
    }
  ]
}
```

### Add Wallet Transaction

```http
POST /api/iata/agencies/:id/wallet/transaction
Content-Type: application/json

{
  "type": "deposit",
  "amount": 1000,
  "currency": "USD",
  "description": "Wallet deposit",
  "referenceId": "DEPOSIT123"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 6000.00
}
```

## Backend Functions

### `createIataAgency(data: InsertIataAgency)`
Creates a new IATA agency and logs the creation.

### `getAgencyById(agencyId: number)`
Retrieves agency details by ID.

### `getAgencies(filters?: { status?: string; country?: string })`
Retrieves all agencies with optional filters.

### `approveAgency(agencyId: number, approvedBy: number)`
Approves an agency and logs the action.

### `rejectAgency(agencyId: number, reason: string, rejectedBy: number)`
Rejects an agency with a reason and logs the action.

### `suspendAgency(agencyId: number, reason: string, suspendedBy: number)`
Suspends an agency with a reason and logs the action.

### `logAgencyActivity(agencyId: number, actionType: string, description: string, amount?: number, createdBy?: number)`
Logs an agency activity for audit trail.

### `addWalletTransaction(agencyId: number, type: string, amount: number, currency: string, description: string, referenceId?: string)`
Adds a wallet transaction and updates agency balance.

### `getAgencyActivityLogs(agencyId: number, limit = 50)`
Retrieves activity logs for an agency.

### `getAgencyWalletTransactions(agencyId: number, limit = 50)`
Retrieves wallet transactions for an agency.

### `calculateMarkup(basePrice: number, agency: any): number`
Calculates markup based on agency settings.

### `calculateCommission(basePrice: number, agency: any): number`
Calculates commission based on agency settings.

### `canAgencyTicket(agencyId: number): Promise<{ allowed: boolean; reason?: string }>`
Checks if agency can issue tickets based on status, permissions, and balance.

### `getAvailableCredit(agencyId: number): Promise<number>`
Retrieves available credit for an agency.

## Integration with Flight Booking

When an agency books a flight through Amadeus:

1. **Search** - Agency searches for flights (logged as "search" action)
2. **Booking** - Agency confirms booking (logged as "booking" action)
3. **Ticketing** - Check `canAgencyTicket()` before issuing ticket
4. **Payment** - Charge agency wallet or credit limit
5. **Logging** - Log all actions with amounts and references

## Payment Methods

### Wallet
- Agency has a prepaid wallet balance
- Each booking charges the wallet
- Admin can deposit funds via `addWalletTransaction()`

### Credit Limit
- Agency has a credit limit with used/available tracking
- Each booking charges the used credit
- Admin must approve payment before ticketing

### Bank Transfer
- Agency pays via bank transfer
- Admin must confirm payment before ticketing

### IATA EasyPay
- Agency uses IATA's payment system
- Integrated with IATA billing

### Royal Voyage Settlement
- Royal Voyage handles payment settlement
- Agency pays Royal Voyage directly

## Error Handling

All endpoints return error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `404` - Not found
- `500` - Server error

## Audit Trail

Every action is logged in `agency_activity_logs`:
- Agency creation
- Status changes (approve, reject, suspend)
- Bookings
- Ticketing
- Payments
- Wallet transactions
- Settings updates

This ensures complete accountability and compliance tracking.

## Security Notes

- All endpoints should be protected with admin authentication
- Sensitive data (API keys, secrets) are never logged
- Activity logs include admin IDs for accountability
- Wallet transactions are immutable once created
- Status changes are tracked with timestamps and admin IDs
