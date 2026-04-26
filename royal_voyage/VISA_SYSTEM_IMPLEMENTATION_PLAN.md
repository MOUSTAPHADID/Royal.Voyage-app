# Visa System Implementation Plan

Complete guide for implementing the Visa System skeleton into a full production system.

## Overview

The Visa System skeleton provides safe, non-breaking foundations for a complete visa application management system. This plan outlines the step-by-step implementation process.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Customer App (Expo)                   │
├─────────────────────────────────────────────────────────┤
│  - Visa application form                                │
│  - Document upload                                      │
│  - Status tracking                                      │
│  - Notifications                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│              TRPC API Endpoints                          │
├─────────────────────────────────────────────────────────┤
│  - createVisaApplication                                │
│  - uploadDocument                                       │
│  - getStatus                                            │
│  - submitApplication                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│              Visa Service Layer                          │
├─────────────────────────────────────────────────────────┤
│  - Business logic                                       │
│  - Database operations                                  │
│  - Provider coordination                                │
│  - Notification triggers                                │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬──────────┐
        │         │         │          │
   ┌────▼──┐ ┌───▼───┐ ┌───▼───┐ ┌───▼────┐
   │ Cloud │ │  PDF  │ │Notif. │ │Provider│
   │Storage│ │System │ │System │ │Layer   │
   └───────┘ └───────┘ └───────┘ └────────┘
        │         │         │          │
   ┌────▼──┐ ┌───▼───┐ ┌───▼───┐ ┌───▼────┐
   │S3/R2/ │ │PDFKit │ │Email/ │ │Sherpa/ │
   │Supa.  │ │+RTL   │ │SMS    │ │iVisa   │
   └───────┘ └───────┘ └───────┘ └────────┘
```

## Phase 1: Database Integration (Week 1)

### 1.1 Create Database Schema

Create `server/db/schema/visa.ts`:

```typescript
import { pgTable, uuid, text, date, integer, decimal, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const visaApplications = pgTable('visa_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  visaApplicationId: text('visa_application_id').unique().notNull(),
  customerId: uuid('customer_id').notNull(),
  agencyId: uuid('agency_id'),
  partnerId: uuid('partner_id'),
  destinationCountry: text('destination_country').notNull(),
  travelerNationality: text('traveler_nationality').notNull(),
  visaType: text('visa_type').notNull(),
  expectedTravelDate: date('expected_travel_date').notNull(),
  numberOfTravelers: integer('number_of_travelers').notNull(),
  fullName: text('full_name').notNull(),
  passportNumber: text('passport_number').notNull(),
  nationality: text('nationality').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  passportExpiry: date('passport_expiry').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  status: text('status').notNull().default('draft'),
  paymentStatus: text('payment_status').notNull().default('unpaid'),
  provider: text('provider').notNull().default('manual'),
  providerReference: text('provider_reference'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const visaDocuments = pgTable('visa_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  visaApplicationId: uuid('visa_application_id').notNull(),
  documentType: text('document_type').notNull(),
  fileName: text('file_name').notNull(),
  fileKey: text('file_key').notNull(),
  storageProvider: text('storage_provider').notNull(),
  uploadedBy: uuid('uploaded_by').notNull(),
  status: text('status').notNull().default('uploaded'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const visaActivityLogs = pgTable('visa_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  visaApplicationId: uuid('visa_application_id').notNull(),
  action: text('action').notNull(),
  performedBy: uuid('performed_by').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### 1.2 Run Migrations

```bash
pnpm db:push
```

### 1.3 Update Visa Service

Implement database calls in `server/visa/visa-service.ts`:

```typescript
import { db } from '@/server/_core/db';
import { visaApplications, visaDocuments, visaActivityLogs } from '@/server/db/schema/visa';

export class VisaService {
  async createVisaApplication(...) {
    const app = await db.insert(visaApplications).values({...}).returning();
    await this.logActivity(app.id, 'created', userId);
    return app;
  }

  private async logActivity(visaId: string, action: string, userId: string) {
    await db.insert(visaActivityLogs).values({
      visaApplicationId: visaId,
      action,
      performedBy: userId,
    });
  }
}
```

## Phase 2: API Endpoints (Week 2)

### 2.1 Create TRPC Router

Create `server/routers/visa.ts`:

```typescript
import { router, publicProcedure } from '@/server/_core/trpc';
import { visaService } from '@/server/visa/visa-service';
import { z } from 'zod';

export const visaRouter = router({
  createApplication: publicProcedure
    .input(z.object({
      destinationCountry: z.string(),
      visaType: z.string(),
      // ... more fields
    }))
    .mutation(async ({ input, ctx }) => {
      return visaService.createVisaApplication(ctx.user.id, input);
    }),

  getApplications: publicProcedure
    .query(async ({ ctx }) => {
      return visaService.getCustomerVisaApplications(ctx.user.id);
    }),

  // ... more endpoints
});
```

### 2.2 Add to Main Router

Update `server/_core/router.ts`:

```typescript
export const appRouter = router({
  visa: visaRouter,
  // ... existing routers
});
```

### 2.3 Create Admin Router

Create `server/routers/admin-visa.ts`:

```typescript
export const adminVisaRouter = router({
  listApplications: adminProcedure.query(async () => {
    // List all applications
  }),

  changeStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ input }) => {
      // Change status
    }),

  // ... more admin endpoints
});
```

## Phase 3: Provider Integration (Week 3)

### 3.1 Implement Sherpa Provider

Create `server/visa/providers/sherpa-provider.ts`:

```typescript
import { IVisaProvider } from '../visa-provider';

export class SherpaVisaProvider implements IVisaProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sherpa.com';
  }

  async checkVisaRequirements(destinationCountry, nationality, visaType) {
    const response = await fetch(`${this.baseUrl}/requirements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: destinationCountry,
        nationality,
        visaType,
      }),
    });

    return response.json();
  }

  // ... implement other methods
}
```

### 3.2 Implement iVisa Provider

Create `server/visa/providers/ivisa-provider.ts`:

```typescript
export class IVisaProvider implements IVisaProvider {
  // Similar implementation to Sherpa
}
```

### 3.3 Update Provider Factory

Update `server/visa/visa-provider.ts`:

```typescript
export class VisaProviderFactory {
  static getProvider(provider: VisaProvider): IVisaProvider {
    const sherpaKey = process.env.SHERPA_API_KEY;
    const iVisaKey = process.env.IVISA_API_KEY;

    switch (provider) {
      case 'sherpa':
        return new SherpaVisaProvider(sherpaKey!);
      case 'ivisa':
        return new IVisaProvider(iVisaKey!);
      default:
        return new ManualVisaProvider();
    }
  }
}
```

## Phase 4: Cloud Storage Integration (Week 3)

### 4.1 Use Existing Cloud Storage

Update `server/visa/visa-service.ts`:

```typescript
import { cloudStorageFactory } from '@/server/pdf/cloud-storage-factory';

export class VisaService {
  async uploadVisaDocument(...) {
    const storage = cloudStorageFactory.getStorage();
    const fileKey = `visa/${visaId}/${documentType}/${fileName}`;
    
    await storage.uploadPDF(fileBuffer, fileKey);
    
    // Save document record
    await db.insert(visaDocuments).values({
      visaApplicationId: visaId,
      documentType,
      fileName,
      fileKey,
      storageProvider: process.env.PDF_STORAGE_PROVIDER || 'local',
      uploadedBy: userId,
    });
  }

  async getDocumentDownloadUrl(documentId: string) {
    const doc = await db.query.visaDocuments.findFirst({ where: eq(visaDocuments.id, documentId) });
    const storage = cloudStorageFactory.getStorage();
    return storage.getSignedUrl(doc.fileKey, 3600); // 1 hour expiry
  }
}
```

## Phase 5: PDF Generation (Week 4)

### 5.1 Implement PDF Generator

Update `server/visa/visa-pdf.ts`:

```typescript
import PDFDocument from 'pdfkit';
import { addWatermark, addQrCode, addStatusBadge } from '@/server/pdf/utils';

export class VisaPdfGenerator {
  async generateReceiptPdf(application: VisaApplication): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    // Add header
    doc.fontSize(24).text('Royal Voyage', { align: 'center' });
    doc.fontSize(14).text('Visa Application Receipt', { align: 'center' });

    // Add application details (with Arabic/RTL support)
    doc.fontSize(12).text(`Application ID: ${application.visaApplicationId}`);
    doc.text(`Destination: ${application.destinationCountry}`);
    doc.text(`Visa Type: ${application.visaType}`);
    doc.text(`Applicant: ${application.fullName}`);

    // Add QR code
    const qrCode = await generateQrCode(application.visaApplicationId);
    doc.image(qrCode, 50, 400, { width: 100 });

    // Add watermark
    doc.opacity(0.1).fontSize(60).text('DRAFT', { align: 'center' });

    // Add footer
    doc.fontSize(10).text('Royal Voyage | Email: royal-voyage@gmail.com | Phone: +22233700000', {
      align: 'center',
    });

    return new Promise((resolve) => {
      doc.end();
      setTimeout(() => resolve(Buffer.concat(buffers)), 100);
    });
  }
}
```

## Phase 6: Notifications (Week 4)

### 6.1 Implement Notifications

Update `server/visa/visa-notifications.ts`:

```typescript
import { sendEmail, sendSms } from '@/server/notifications';

export class VisaNotificationManager {
  async notifyVisaCreated(application: VisaApplication): Promise<boolean> {
    try {
      await sendEmail({
        to: application.email,
        subject: 'Visa Application Created',
        template: 'visa-created',
        data: {
          fullName: application.fullName,
          visaApplicationId: application.visaApplicationId,
          destinationCountry: application.destinationCountry,
        },
      });

      await sendSms({
        to: application.phone,
        message: `Your visa application ${application.visaApplicationId} has been created`,
      });

      return true;
    } catch (error) {
      console.error('Notification failed:', error);
      return false;
    }
  }

  async notifyVisaApproved(application: VisaApplication): Promise<boolean> {
    // Generate approval PDF
    const pdfBuffer = await visaPdfGenerator.generateApprovalPdf(application);

    // Send email with attachment
    await sendEmail({
      to: application.email,
      subject: 'Visa Application Approved!',
      template: 'visa-approved',
      data: { fullName: application.fullName },
      attachments: [{
        filename: `visa-approval-${application.visaApplicationId}.pdf`,
        content: pdfBuffer,
      }],
    });

    return true;
  }
}
```

## Phase 7: Admin UI (Week 5)

### 7.1 Create Admin Dashboard

Create `app/admin/visa/page.tsx`:

```typescript
export default function VisaAdminDashboard() {
  const [applications, setApplications] = useState<VisaApplication[]>([]);

  useEffect(() => {
    trpc.visa.admin.listApplications.useQuery();
  }, []);

  return (
    <View>
      <Text>Visa Applications</Text>
      <FlatList
        data={applications}
        renderItem={({ item }) => (
          <VisaApplicationCard
            application={item}
            onStatusChange={(status) => {
              trpc.visa.admin.changeStatus.useMutation({
                id: item.id,
                status,
              });
            }}
          />
        )}
      />
    </View>
  );
}
```

## Phase 8: Customer UI (Week 5)

### 8.1 Create Visa Application Form

Create `app/visa/apply.tsx`:

```typescript
export default function VisaApplicationForm() {
  const [formData, setFormData] = useState<CreateVisaApplicationRequest>({
    destinationCountry: '',
    visaType: 'tourist',
    // ... other fields
  });

  const createApplication = trpc.visa.createApplication.useMutation();

  const handleSubmit = async () => {
    const result = await createApplication.mutateAsync(formData);
    // Navigate to application details
  };

  return (
    <ScreenContainer>
      <ScrollView>
        <TextInput
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />
        {/* ... more form fields */}
        <TouchableOpacity onPress={handleSubmit}>
          <Text>Submit Application</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
```

### 8.2 Create Application Status Screen

Create `app/visa/[id].tsx`:

```typescript
export default function VisaApplicationDetail({ id }: { id: string }) {
  const { data: application } = trpc.visa.getApplication.useQuery({ id });

  if (!application) return <Text>Loading...</Text>;

  return (
    <ScreenContainer>
      <Text>{application.visaApplicationId}</Text>
      <Text>Status: {application.status}</Text>
      <Text>Destination: {application.destinationCountry}</Text>
      
      {application.status === 'more_documents_required' && (
        <DocumentUploadForm visaId={id} />
      )}
    </ScreenContainer>
  );
}
```

## Phase 9: Partner API (Week 6)

### 9.1 Create Partner Router

Create `server/routers/partner-visa.ts`:

```typescript
export const partnerVisaRouter = router({
  apply: publicProcedure
    .input(partnerVisaRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const partnerId = ctx.req.headers['x-partner-id'];
      return visaService.createVisaApplication(
        input.email,
        input,
        undefined,
        partnerId
      );
    }),

  getStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const application = await visaService.getVisaApplication(input.id);
      // Verify partner owns this application
      return {
        id: application.visaApplicationId,
        status: application.status,
        paymentStatus: application.paymentStatus,
      };
    }),
});
```

## Phase 10: Testing (Week 6)

### 10.1 Add Integration Tests

Create `__tests__/visa-integration.test.ts`:

```typescript
describe('Visa System Integration', () => {
  it('should create visa application', async () => {
    const app = await visaService.createVisaApplication('user-1', {
      destinationCountry: 'UAE',
      visaType: 'tourist',
      // ... other fields
    });

    expect(app.status).toBe('draft');
    expect(app.visaApplicationId).toBeDefined();
  });

  it('should upload document', async () => {
    const doc = await visaService.uploadVisaDocument(
      app.id,
      'passport_copy',
      'passport.pdf',
      pdfBuffer,
      'cloud',
      'user-1'
    );

    expect(doc).toBeDefined();
    expect(doc.status).toBe('uploaded');
  });

  it('should generate receipt PDF', async () => {
    const pdf = await visaPdfGenerator.generateReceiptPdf(app);
    expect(pdf).toBeDefined();
    expect(pdf.length).toBeGreaterThan(0);
  });

  it('should send notifications', async () => {
    const result = await visaNotificationManager.notifyVisaCreated(app);
    expect(result).toBe(true);
  });
});
```

## Environment Variables

Add to `.env`:

```env
# Visa Configuration
VISA_PROVIDER=manual  # manual, sherpa, ivisa
SHERPA_API_KEY=...
IVISA_API_KEY=...

# Cloud Storage (Already configured)
PDF_STORAGE_PROVIDER=s3
PDF_STORAGE_BUCKET=royal-voyage-pdfs
PDF_S3_ACCESS_KEY_ID=...
PDF_S3_SECRET_ACCESS_KEY=...

# Notifications (Already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Partner API
PARTNER_API_KEYS=key1,key2,key3
```

## Security Checklist

- ✅ No API secrets in code
- ✅ All secrets via environment variables
- ✅ Passport numbers not logged
- ✅ Cloud Storage for sensitive documents
- ✅ Signed URLs with expiry for downloads
- ✅ Access control per customer/agency/partner
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (using Drizzle ORM)
- ✅ CORS properly configured

## Performance Optimization

- ✅ Database indexes on frequently queried fields
- ✅ Cloud Storage caching for PDFs
- ✅ Async notifications (don't block API)
- ✅ Pagination for list endpoints
- ✅ Query optimization with Drizzle ORM

## Monitoring

- ✅ Log all visa application events
- ✅ Monitor API response times
- ✅ Alert on failed notifications
- ✅ Track provider API failures
- ✅ Monitor Cloud Storage usage

## Deployment

1. Run migrations: `pnpm db:push`
2. Set environment variables
3. Deploy backend: `npm run build && npm run start`
4. Deploy mobile app: `eas build --platform ios && eas build --platform android`
5. Test all flows end-to-end
6. Monitor logs for errors

## Timeline

- Week 1: Database integration
- Week 2: API endpoints
- Week 3: Provider integration + Cloud Storage
- Week 4: PDF generation + Notifications
- Week 5: Admin UI + Customer UI
- Week 6: Partner API + Testing

**Total: 6 weeks for full implementation**

## Support

For questions or issues:
1. Check `server/visa/README.md` for architecture overview
2. Review type definitions in `server/visa/visa-types.ts`
3. Check provider examples in `server/visa/visa-provider.ts`
4. Review service skeleton in `server/visa/visa-service.ts`
