# Royal Voyage Provider Terms & Conditions

**Effective Date**: April 25, 2026  
**Last Updated**: April 25, 2026

## 1. Introduction

These Provider Terms & Conditions ("Terms") govern the use of Royal Voyage's Provider Platform by partners, agencies, and developers ("Provider"). By accessing or using the Provider Platform, you agree to be bound by these Terms.

## 2. Definitions

- **Provider**: Any travel agency, consolidator, or partner using Royal Voyage's services
- **Provider Platform**: The suite of tools including Developer Portal, API, Webhooks, and Settlement Reports
- **API Key**: Credentials used to authenticate API requests
- **Booking**: A flight or hotel reservation made through the Royal Voyage platform
- **Ticket**: An issued airline ticket resulting from a booking
- **Settlement**: The financial reconciliation between Royal Voyage and Provider

## 3. API Access & Usage

### 3.1 API Key Management
- Providers are responsible for keeping API keys confidential
- API keys must not be shared, committed to version control, or exposed in client-side code
- Providers must rotate API keys periodically
- Royal Voyage may revoke API keys at any time for security reasons

### 3.2 Rate Limiting
- API requests are subject to rate limits: 10,000 requests per hour
- Providers exceeding rate limits may experience temporary suspension
- Critical errors may trigger immediate suspension

### 3.3 Acceptable Use
Providers must not:
- Use the API for unauthorized purposes
- Attempt to bypass security measures
- Scrape or mass-download data
- Use the API to compete with Royal Voyage
- Resell API access to third parties

## 4. Webhook Delivery

### 4.1 Webhook Security
- Webhooks include HMAC-SHA256 signatures for verification
- Providers must validate webhook signatures before processing
- Webhook secrets must be kept confidential

### 4.2 Webhook Reliability
- Royal Voyage makes best-effort attempts to deliver webhooks
- Webhooks are retried up to 5 times with exponential backoff
- Providers must respond with HTTP 2xx status within 30 seconds
- Failed webhooks are logged for manual review

### 4.3 Events
Royal Voyage sends webhooks for:
- `booking_created`: New booking created
- `price_changed`: Price updated
- `ticket_issued`: Ticket successfully issued
- `ticket_failed`: Ticket issuance failed
- `refund_requested`: Refund request initiated
- `refund_completed`: Refund processed
- `payment_pending`: Payment awaiting confirmation
- `payment_confirmed`: Payment confirmed

## 5. Settlement & Payments

### 5.1 Commission Structure
- Commissions are calculated based on Provider's agreement
- Commissions are deducted from booking amounts
- Settlement reports are generated monthly

### 5.2 Wallet & Credit
- Providers may maintain a wallet balance for prepayment
- Credit limits are set per Provider and enforced at booking time
- Insufficient balance/credit will block ticket issuance

### 5.3 Settlement Disputes
- Providers have 30 days to dispute settlement reports
- Disputes must be submitted with supporting documentation
- Royal Voyage will investigate and respond within 15 business days

## 6. IATA Ticketing Responsibility

### 6.1 Agency Compliance
- Providers must maintain valid IATA credentials
- Providers must comply with all IATA regulations
- Providers are responsible for ticket validity and accuracy

### 6.2 Ticketing Validation
- Royal Voyage performs validation before ticket issuance
- Validation includes agency status, permissions, and financial checks
- Validation failures are communicated to Provider

### 6.3 Ticket Liability
- Provider is responsible for ticket accuracy and completeness
- Royal Voyage is not liable for ticketing errors caused by Provider
- Provider must maintain records of all issued tickets

## 7. Data Privacy & Security

### 7.1 Data Protection
- Providers must comply with GDPR, CCPA, and local data protection laws
- Providers must not store sensitive payment information
- Providers must encrypt data in transit and at rest

### 7.2 PII Handling
- Personally Identifiable Information (PII) is handled according to privacy policy
- Providers must not share PII with unauthorized third parties
- Providers must implement appropriate security measures

### 7.3 Data Retention
- Providers may retain booking data for compliance purposes
- Providers must delete PII upon request
- Royal Voyage retains data according to legal requirements

## 8. Liability & Indemnification

### 8.1 Limitation of Liability
- Royal Voyage's liability is limited to the fees paid by Provider in the past 12 months
- Royal Voyage is not liable for indirect, incidental, or consequential damages
- Royal Voyage is not liable for third-party services (Amadeus, Hotelbeds, etc.)

### 8.2 Indemnification
- Provider indemnifies Royal Voyage against claims arising from Provider's use of the platform
- Provider indemnifies Royal Voyage against claims from Provider's customers
- Provider indemnifies Royal Voyage against regulatory violations

## 9. Termination

### 9.1 Termination by Provider
- Provider may terminate at any time with 30 days' written notice
- Outstanding balances must be settled before termination

### 9.2 Termination by Royal Voyage
- Royal Voyage may terminate for material breach
- Royal Voyage may terminate for security violations
- Royal Voyage may terminate for regulatory non-compliance
- Royal Voyage will provide notice and opportunity to cure (except for security issues)

### 9.3 Effect of Termination
- All API keys are revoked immediately
- Provider loses access to Provider Platform
- Outstanding balances remain due
- Data retention follows data protection regulations

## 10. Modifications

Royal Voyage may modify these Terms at any time. Continued use of the Provider Platform constitutes acceptance of modified Terms.

## 11. Governing Law

These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.

## 12. Contact

For questions about these Terms, contact: legal@royalvoyage.online

---

**Version**: 1.0  
**Status**: Active
