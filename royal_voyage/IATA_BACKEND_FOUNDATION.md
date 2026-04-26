# IATA Agency Management - Backend Foundation

**Status**: ✅ Backend Foundation Complete  
**TypeScript**: 0 Errors  
**Date**: April 25, 2026

## Overview

IATA agency management system provides a complete backend foundation for managing travel agencies with IATA numbers, ticketing permissions, wallet management, and activity logging.

## Database Schema

### 1. iataAgencies Table
Stores agency information, credentials, and settings.

**Key Fields**:
- `iataNumber` - Unique IATA number
- `companyName` - Agency name
- `ticketingPermission` - search_only, booking_only, or booking_ticketing
- `ticketingOwner` - royal_voyage or partner_agency
- `paymentMethod` - wallet, credit_limit, bank_transfer, iata_easypay, royal_voyage_settlement
- `status` - pending_review, more_documents_required, approved, rejected, suspended
- `walletBalance` - Current wallet balance
- `creditLimit` - Available credit limit
- `markupType` & `markupValue` - Markup configuration
- `commissionType` & `commissionValue` - Commission configuration

### 2. agencyActivityLogs Table
Complete audit trail of all agency actions.

**Action Types**:
- search
- booking
- ticketing
- payment
- wallet_transaction
- refund
- cancellation
- status_change
- settings_update
- admin_note

### 3. walletTransactions Table
Tracks all wallet deposits, withdrawals, charges, refunds, and commissions.

### 4. agencyBookings Table
Records all bookings made by agencies with pricing, ticketing, and payment status.

## Backend Modules

### server/iata-agency.ts
Core business logic functions:

```typescript
// Agency Management
getAgencyById(agencyId)
getAgencies(filters)
createIataAgency(data)
approveAgency(agencyId, approvedBy)
rejectAgency(agencyId, reason, rejectedBy)
suspendAgency(agencyId, reason, suspendedBy)

// Activity Logging
logAgencyActivity(agencyId, actionType, description, amount, createdBy)
getAgencyActivityLogs(agencyId, limit)

// Wallet Management
addWalletTransaction(agencyId, type, amount, currency, description, referenceId)
getAgencyWalletTransactions(agencyId, limit)

// Pricing Calculations
calculateMarkup(basePrice, agency)
calculateCommission(basePrice, agency)

// Permissions & Validation
canAgencyTicket(agencyId) → { allowed: boolean, reason?: string }
getAvailableCredit(agencyId)
```

### server/iata-endpoints.ts
REST API endpoints for agency management.

## REST API Endpoints

### 1. List All Agencies
```
GET /api/iata/agencies?status=approved&country=SA

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "companyName": "Royal Travel Agency",
      "iataNumber": "12345678",
      "status": "approved",
      "walletBalance": "10000.00",
      "ticketingPermission": "booking_ticketing",
      ...
    }
  ]
}
```

### 2. Get Agency Details
```
GET /api/iata/agencies/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "companyName": "Royal Travel Agency",
    "iataNumber": "12345678",
    "email": "contact@royaltravel.com",
    "phone": "+966-1-234-5678",
    "country": "SA",
    "status": "approved",
    "walletBalance": "10000.00",
    "ticketingPermission": "booking_ticketing",
    "paymentMethod": "wallet",
    "markupType": "percentage",
    "markupValue": "5.00",
    "commissionType": "percentage",
    "commissionValue": "2.50",
    ...
  }
}
```

### 3. Create New Agency
```
POST /api/iata/agencies

Request Body:
{
  "companyName": "Royal Travel Agency",
  "iataNumber": "12345678",
  "commercialRegistrationNumber": "REG-123456",
  "taxNumber": "TAX-123456",
  "responsiblePersonName": "Ahmed Al-Mansouri",
  "jobTitle": "Manager",
  "email": "contact@royaltravel.com",
  "phone": "+966-1-234-5678",
  "country": "SA",
  "city": "Riyadh",
  "bookingProvider": "amadeus",
  "ticketingPermission": "booking_ticketing",
  "paymentMethod": "wallet",
  "markupType": "percentage",
  "markupValue": "5.00",
  "commissionType": "percentage",
  "commissionValue": "2.50"
}

Response:
{
  "success": true,
  "message": "Agency created successfully",
  "agencyId": 1
}
```

### 4. Approve Agency
```
POST /api/iata/agencies/:id/approve

Request Body:
{
  "approvedBy": 1
}

Response:
{
  "success": true,
  "message": "Agency approved successfully"
}
```

### 5. Reject Agency
```
POST /api/iata/agencies/:id/reject

Request Body:
{
  "reason": "Missing required documents",
  "rejectedBy": 1
}

Response:
{
  "success": true,
  "message": "Agency rejected successfully"
}
```

### 6. Suspend Agency
```
POST /api/iata/agencies/:id/suspend

Request Body:
{
  "reason": "Payment overdue",
  "suspendedBy": 1
}

Response:
{
  "success": true,
  "message": "Agency suspended successfully"
}
```

### 7. Get Activity Logs
```
GET /api/iata/agencies/:id/logs?limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agencyId": 1,
      "actionType": "booking",
      "description": "Flight booking created",
      "amount": "500.00",
      "createdAt": "2026-04-25T10:30:00Z"
    }
  ]
}
```

### 8. Get Wallet Transactions
```
GET /api/iata/agencies/:id/wallet?limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agencyId": 1,
      "type": "deposit",
      "amount": "1000.00",
      "currency": "SAR",
      "description": "Wallet deposit",
      "balanceAfter": "11000.00",
      "createdAt": "2026-04-25T10:30:00Z"
    }
  ]
}
```

### 9. Add Wallet Deposit
```
POST /api/iata/agencies/:id/wallet/deposit

Request Body:
{
  "amount": 1000.00,
  "currency": "SAR",
  "description": "Wallet top-up",
  "referenceId": "TXN-12345"
}

Response:
{
  "success": true,
  "message": "Deposit successful",
  "newBalance": 11000.00
}
```

### 10. Check Ticketing Permission
```
GET /api/iata/agencies/:id/ticketing-permission

Response:
{
  "success": true,
  "data": {
    "allowed": true
  }
}

Or if not allowed:
{
  "success": true,
  "data": {
    "allowed": false,
    "reason": "Insufficient wallet balance"
  }
}
```

### 11. Get Available Credit
```
GET /api/iata/agencies/:id/available-credit

Response:
{
  "success": true,
  "data": {
    "availableCredit": 5000.00
  }
}
```

## Features

### Agency Status Workflow
1. **pending_review** - Initial state after creation
2. **more_documents_required** - Admin requests additional documents
3. **approved** - Agency is active and can book
4. **rejected** - Application rejected
5. **suspended** - Active agency suspended by admin

### Ticketing Permissions
- **search_only** - Can search flights but cannot book
- **booking_only** - Can search and book but cannot issue tickets
- **booking_ticketing** - Full access including ticketing

### Ticketing Owner
- **royal_voyage** - Royal Voyage issues tickets (agency books through us)
- **partner_agency** - Agency issues their own tickets (we provide API access)

### Payment Methods
- **wallet** - Prepaid wallet balance
- **credit_limit** - Credit line with usage tracking
- **bank_transfer** - Direct bank payment
- **iata_easypay** - IATA EasyPay system
- **royal_voyage_settlement** - Settlement with Royal Voyage

### Pricing Model
- **Markup** - Additional charge on base price (fixed amount or percentage)
- **Commission** - Revenue share (fixed amount or percentage)

## Security Notes

1. **API Key Authentication** - IATA endpoints should be protected with API key authentication
2. **Role-Based Access** - Only admins can approve/reject/suspend agencies
3. **Audit Trail** - All actions logged in agencyActivityLogs
4. **Wallet Security** - All transactions tracked and immutable
5. **Credit Limits** - Enforced at booking time to prevent overbooking

## Integration Points

### With Amadeus Flight API
- Check agency ticketing permission before booking
- Apply agency markup to flight prices
- Deduct from wallet or credit limit on booking

### With Hotelbeds Hotel API
- Check agency permissions before hotel booking
- Apply agency markup to hotel prices
- Track hotel bookings in agencyBookings table

### With Partner API
- Partner API keys tied to agencies
- Rate limiting per agency
- Usage tracking in activity logs

## Next Steps

1. **Admin Dashboard** - Build UI for agency management (approve/reject/suspend)
2. **Agency Portal** - Self-service portal for agencies to view bookings and wallet
3. **Ticketing Integration** - Connect to Amadeus ticketing for automatic ticket issuance
4. **Payment Gateway** - Integrate payment methods for wallet deposits
5. **Reporting** - Analytics dashboard for agency performance

## Files

- `drizzle/schema.ts` - Database schema (4 new tables)
- `server/iata-agency.ts` - Business logic (18 functions)
- `server/iata-endpoints.ts` - REST endpoints (11 endpoints)
- `server/_core/index.ts` - Server bootstrap (IATA router mounted)

## Status

✅ Backend foundation complete and ready for frontend integration
✅ All endpoints tested and working
✅ TypeScript compilation: 0 errors
✅ Ready for admin dashboard development
