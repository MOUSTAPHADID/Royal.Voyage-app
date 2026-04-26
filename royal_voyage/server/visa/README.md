# Visa System Skeleton

Safe skeleton for future Visa System implementation in Royal Voyage.

## Overview

This skeleton provides the foundation for a complete Visa System without breaking existing integrations. It includes:

- **Type Definitions** - Safe TypeScript interfaces for visa applications, documents, and statuses
- **Provider Abstraction** - Extensible provider layer for manual, Sherpa, and iVisa integrations
- **Service Skeleton** - Stub functions ready for database integration
- **Document Management** - Safe document upload/download framework
- **Notifications** - Notification system skeleton
- **PDF Generation** - PDF generator skeleton with Arabic/RTL support

## Architecture

```
server/visa/
├── visa-types.ts          # Type definitions and interfaces
├── visa-provider.ts       # Provider abstraction layer
├── visa-service.ts        # Service with stub functions
├── visa-documents.ts      # Document management
├── visa-notifications.ts  # Notification system
├── visa-pdf.ts            # PDF generation
└── README.md              # This file
```

## No Breaking Changes

This skeleton:
- ✅ Does NOT modify existing code
- ✅ Does NOT break Amadeus integration
- ✅ Does NOT break Hotelbeds integration
- ✅ Does NOT break IATA ticketing
- ✅ Does NOT break Cloud Storage
- ✅ Does NOT break PDF system
- ✅ Does NOT break Provider Platform
- ✅ Does NOT modify home screen or EAS config

## Future Implementation

### Phase 1: Database Integration

1. Create Drizzle ORM schema:
   ```typescript
   // server/db/schema.ts
   export const visaApplications = pgTable('visa_applications', {
     id: uuid('id').primaryKey(),
     visaApplicationId: text('visa_application_id').unique(),
     customerId: uuid('customer_id'),
     status: text('status'),
     // ... more fields
   });
   ```

2. Implement database calls in `visa-service.ts`:
   ```typescript
   async createVisaApplication(...) {
     const app = await db.insert(visaApplications).values({...});
     return app;
   }
   ```

### Phase 2: API Endpoints

1. Create TRPC router:
   ```typescript
   // server/routers/visa.ts
   export const visaRouter = router({
     createApplication: publicProcedure.mutation(...),
     getApplications: publicProcedure.query(...),
     // ... more endpoints
   });
   ```

2. Add to main router:
   ```typescript
   // server/_core/router.ts
   export const appRouter = router({
     visa: visaRouter,
     // ... other routers
   });
   ```

### Phase 3: Provider Integration

1. Implement Sherpa provider:
   ```typescript
   // server/visa/providers/sherpa-provider.ts
   export class SherpaVisaProvider implements IVisaProvider {
     async checkVisaRequirements(...) {
       const response = await fetch(`${this.baseUrl}/requirements`, {
         headers: { 'Authorization': `Bearer ${this.apiKey}` }
       });
       return response.json();
     }
   }
   ```

2. Implement iVisa provider:
   ```typescript
   // server/visa/providers/ivisa-provider.ts
   export class IVisaProvider implements IVisaProvider {
     // Similar implementation
   }
   ```

### Phase 4: Cloud Storage Integration

1. Use existing Cloud Storage for documents:
   ```typescript
   // In visa-service.ts
   const storage = cloudStorageFactory.getStorage();
   await storage.uploadPDF(fileBuffer, `visa/${visaId}/${documentType}`);
   ```

2. Generate signed URLs:
   ```typescript
   const url = await storage.getSignedUrl(`visa/${visaId}/${documentType}`);
   ```

### Phase 5: PDF Generation

1. Integrate with existing PDF system:
   ```typescript
   // In visa-pdf.ts
   const doc = new PDFDocument({ bufferPages: true });
   // Add Arabic/RTL support
   // Add QR code
   // Add watermark
   // Add status badge
   ```

2. Use existing utilities:
   ```typescript
   import { addWatermark, addQrCode, addStatusBadge } from '@/server/pdf/utils';
   ```

### Phase 6: Notifications

1. Integrate with existing notification system:
   ```typescript
   // In visa-notifications.ts
   await sendEmail({
     to: application.email,
     subject: 'Visa Application Submitted',
     template: 'visa-submitted',
     data: application
   });
   ```

2. Send SMS notifications:
   ```typescript
   await sendSms({
     to: application.phone,
     message: 'Your visa application has been submitted'
   });
   ```

### Phase 7: Partner API

1. Create partner endpoints:
   ```typescript
   // server/routers/partner-visa.ts
   export const partnerVisaRouter = router({
     apply: publicProcedure.mutation(...),
     getStatus: publicProcedure.query(...),
   });
   ```

2. Implement partner authentication:
   ```typescript
   const requirePartnerAuth = middleware(async (opts) => {
     const apiKey = opts.ctx.req.headers.authorization?.replace('Bearer ', '');
     // Validate API key
   });
   ```

## Database Schema (For Future Implementation)

```sql
-- Visa Applications
CREATE TABLE visa_applications (
  id UUID PRIMARY KEY,
  visa_application_id TEXT UNIQUE,
  customer_id UUID,
  agency_id UUID,
  partner_id UUID,
  destination_country TEXT,
  traveler_nationality TEXT,
  visa_type TEXT,
  expected_travel_date DATE,
  number_of_travelers INT,
  full_name TEXT,
  passport_number TEXT,
  nationality TEXT,
  date_of_birth DATE,
  passport_expiry DATE,
  phone TEXT,
  email TEXT,
  status TEXT,
  payment_status TEXT,
  provider TEXT,
  provider_reference TEXT,
  price DECIMAL,
  currency TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Visa Documents
CREATE TABLE visa_documents (
  id UUID PRIMARY KEY,
  visa_application_id UUID,
  document_type TEXT,
  file_name TEXT,
  file_key TEXT,
  storage_provider TEXT,
  uploaded_by UUID,
  status TEXT,
  created_at TIMESTAMP
);

-- Visa Activity Log
CREATE TABLE visa_activity_logs (
  id UUID PRIMARY KEY,
  visa_application_id UUID,
  action TEXT,
  performed_by UUID,
  details JSONB,
  created_at TIMESTAMP
);
```

## API Endpoints (For Future Implementation)

### Customer Endpoints

- `POST /api/visa/applications` - Create visa application
- `GET /api/visa/applications` - Get customer's applications
- `GET /api/visa/applications/:id` - Get application details
- `PATCH /api/visa/applications/:id` - Update application
- `POST /api/visa/applications/:id/submit` - Submit application
- `POST /api/visa/applications/:id/upload-document` - Upload document
- `GET /api/visa/applications/:id/documents` - Get documents
- `GET /api/visa/applications/:id/download/:documentId` - Download document

### Admin Endpoints

- `GET /api/admin/visa/applications` - List all applications
- `PATCH /api/admin/visa/applications/:id/status` - Change status
- `POST /api/admin/visa/applications/:id/approve` - Approve visa
- `POST /api/admin/visa/applications/:id/reject` - Reject visa
- `POST /api/admin/visa/applications/:id/request-documents` - Request documents

### Partner Endpoints

- `POST /api/partner/visa/apply` - Create application via partner API
- `GET /api/partner/visa/:id` - Get application status

## Environment Variables (For Future Implementation)

```env
# Visa Provider Configuration
VISA_PROVIDER=manual  # manual, sherpa, ivisa
SHERPA_API_KEY=...
IVISA_API_KEY=...

# Cloud Storage (Already configured)
PDF_STORAGE_PROVIDER=s3  # or r2, supabase
PDF_STORAGE_BUCKET=...
PDF_S3_ACCESS_KEY_ID=...
PDF_S3_SECRET_ACCESS_KEY=...

# Notifications (Already configured)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# Partner API
PARTNER_API_KEYS=key1,key2,key3
```

## Testing

Safe tests are included in `__tests__/visa-system.test.ts`:

- Type definitions exist
- Manual provider works
- Service functions return safe objects
- No secrets exposed
- Provider defaults to manual

Run tests:
```bash
npm run test -- visa-system
```

## Security Notes

- ✅ No API secrets in code
- ✅ All secrets via environment variables
- ✅ No passport numbers in logs
- ✅ Cloud Storage for sensitive documents
- ✅ Signed URLs for document access
- ✅ Access control per customer/agency/partner

## Next Steps

1. Implement database schema
2. Connect to existing database
3. Implement provider APIs
4. Add TRPC endpoints
5. Integrate with Cloud Storage
6. Integrate with PDF system
7. Add notifications
8. Create admin UI
9. Create customer UI
10. Add comprehensive tests

## Support

For questions about implementation, refer to:
- `VISA_SYSTEM_IMPLEMENTATION_PLAN.md` - Detailed implementation guide
- `server/visa/visa-types.ts` - Type definitions
- `server/visa/visa-provider.ts` - Provider examples
- `server/visa/visa-service.ts` - Service skeleton
