# Royal Voyage Public/Admin Split Report

**Date:** April 25, 2026  
**Base Version:** royal_voyage_visa_system_skeleton.zip  
**Status:** ✅ Ready for Deployment

---

## 📋 Executive Summary

Royal Voyage has been successfully split into two separate applications with shared backend infrastructure:

1. **Royal Voyage** - Public app for customers and agencies (Google Play & App Store)
2. **Royal Voyage Admin** - Internal admin app for staff only (Internal APK only)

Both applications use the same backend with environment-based configuration and role-based access control.

---

## 🎯 Configuration Overview

### APP_VARIANT System

The project now supports environment-based app variants controlled via `APP_VARIANT` environment variable:

```bash
# Public app
APP_VARIANT=public npx expo config --type public

# Admin app
APP_VARIANT=admin npx expo config --type public
```

### Public App Configuration

| Property | Value |
|----------|-------|
| **App Name** | Royal Voyage |
| **Package** | com.royalvoyage.app |
| **Slug** | royal_voyage |
| **Scheme** | royalvoyage |
| **Build Type** | APK (preview) / AAB (production) |
| **Distribution** | Google Play & App Store |

**Features:**
- ✅ Home screen
- ✅ Flights search and booking
- ✅ Hotels search and booking
- ✅ eSIM data plans
- ✅ My Bookings
- ✅ Payments
- ✅ Tickets / PDF downloads
- ✅ Customer support
- ✅ Agency portal (if secure)
- ✅ Visa customer flow (future)

**Excluded:**
- ❌ Admin Dashboard
- ❌ IATA admin controls
- ❌ Partner API keys management
- ❌ Payment approval dashboard
- ❌ Cloud/PDF logs (sensitive)
- ❌ Monitoring logs
- ❌ Settlement admin controls

### Admin App Configuration

| Property | Value |
|----------|-------|
| **App Name** | Royal Voyage Admin |
| **Package** | com.royalvoyage.admin |
| **Slug** | royal_voyage_admin |
| **Scheme** | royalvoyageadmin |
| **Build Type** | APK (internal only) |
| **Distribution** | Internal only (no public stores) |

**Features:**
- ✅ Admin dashboard
- ✅ Booking management
- ✅ Payment approvals
- ✅ IATA ticketing controls
- ✅ Agency management
- ✅ Partner management
- ✅ Wallet / Credit management
- ✅ Visa admin (future)
- ✅ PDF logs
- ✅ Webhook logs
- ✅ Monitoring
- ✅ Settlement reports

---

## 🔧 EAS Build Profiles

### eas.json Configuration

Four build profiles are configured for different deployment scenarios:

#### 1. public-preview
```bash
APP_VARIANT=public eas build --platform android --profile public-preview --clear-cache
```
- **Type:** APK
- **Purpose:** Testing before production
- **Distribution:** Internal testing

#### 2. public-production
```bash
APP_VARIANT=public eas build --platform android --profile public-production --clear-cache
```
- **Type:** AAB (Android App Bundle)
- **Purpose:** Production release
- **Distribution:** Google Play & App Store

#### 3. admin-internal
```bash
APP_VARIANT=admin eas build --platform android --profile admin-internal --clear-cache
```
- **Type:** APK
- **Purpose:** Internal staff distribution
- **Distribution:** Internal only

#### 4. admin-preview
```bash
APP_VARIANT=admin eas build --platform android --profile admin-preview --clear-cache
```
- **Type:** APK
- **Purpose:** Admin app testing
- **Distribution:** Internal testing

---

## 🔐 Security & Backend Integration

### Shared Backend Architecture

Both applications connect to the same backend server:

```
┌─────────────────────────────────────────┐
│         Royal Voyage Backend            │
│  (Amadeus, Hotelbeds, IATA, Payments)   │
│  (Admin routes protected by middleware) │
└─────────────────────────────────────────┘
         ↑                    ↑
         │                    │
    ┌────────────┐      ┌──────────────┐
    │   Public   │      │    Admin     │
    │   App      │      │    App       │
    │ (Customer) │      │ (Staff)      │
    └────────────┘      └──────────────┘
```

### Security Measures

✅ **No API Secrets in Apps**
- All API keys (Amadeus, Hotelbeds, Stripe) stored in backend only
- Apps communicate via secure backend endpoints

✅ **Admin Routes Protected**
- Admin endpoints require authentication + admin role
- Regular users cannot access admin routes
- Backend validates user role on every request

✅ **App-Level Separation**
- Public app does not include admin routes
- Admin app does not expose customer data
- Separate package names prevent conflicts

✅ **Environment-Based Configuration**
- APP_VARIANT controls which features are available
- Configuration applied at build time
- No runtime switching between variants

---

## ✅ Validation Results

### TypeScript Compilation
```
✓ TypeScript OK - 0 errors
```

### Test Suite
```
Test Files  46 passed (46)
Tests       572 passed (572)
Duration    14.14s
```

### Configuration Verification

**Public App:**
```
name: 'Royal Voyage'
slug: 'royal_voyage'
package: 'com.royalvoyage.app'
```

**Admin App:**
```
name: 'Royal Voyage Admin'
slug: 'royal_voyage_admin'
package: 'com.royalvoyage.admin'
```

---

## 📦 Preserved Features

All existing features remain intact and functional:

✅ **Amadeus API Integration**
- Flight search and booking
- Real-time pricing
- Inventory management

✅ **Hotelbeds Integration**
- Hotel search and booking
- Rate management
- Availability sync

✅ **IATA Ticketing System**
- Ticket generation
- Ticket validation
- Agency management

✅ **PDF System**
- Arabic/RTL support
- Contract generation
- Ticket downloads
- Cloud storage integration

✅ **Payment System**
- Stripe integration
- Bankily support
- Payment approval workflow
- Settlement reports

✅ **Visa System**
- Visa document management
- Visa provider integration
- Document notifications
- PDF generation

✅ **Provider Platform Phase 4**
- Webhook delivery
- Settlement processing
- Operational workflows
- Monitoring

✅ **Cloud Storage**
- S3 support
- R2 support
- Supabase support

✅ **Ticket Auto Delivery**
- Automatic ticket generation
- Email delivery
- PDF attachment

---

## 🚀 Build & Deployment Instructions

### Prerequisites
```bash
export EXPO_TOKEN="your_token_here"
cd /home/ubuntu/royal_voyage
```

### Build Public App (Preview)
```bash
APP_VARIANT=public eas build --platform android --profile public-preview --clear-cache
```

### Build Public App (Production - AAB)
```bash
APP_VARIANT=public eas build --platform android --profile public-production --clear-cache
```

### Build Admin App (Internal)
```bash
APP_VARIANT=admin eas build --platform android --profile admin-internal --clear-cache
```

### Local Testing

**Test Public App Config:**
```bash
APP_VARIANT=public npx expo config --type public
```

**Test Admin App Config:**
```bash
APP_VARIANT=admin npx expo config --type public
```

**Run Tests:**
```bash
npm run test
```

**TypeScript Check:**
```bash
npx tsc --noEmit
```

---

## 📁 File Structure

```
/home/ubuntu/royal_voyage/
├── app.config.ts              # APP_VARIANT support
├── eas.json                   # Build profiles
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen
│   │   ├── flights.tsx        # Flights (public only)
│   │   ├── hotels.tsx         # Hotels (public only)
│   │   └── admin/             # Admin screens (admin only)
│   └── oauth/
├── server/
│   ├── amadeus.ts             # Amadeus API
│   ├── hotelbeds.ts           # Hotelbeds API
│   ├── iata/                  # IATA ticketing
│   ├── visa/                  # Visa system
│   ├── pdf/                   # PDF generation
│   ├── storage.ts             # Cloud storage
│   └── routes.ts              # Protected admin routes
├── components/
├── hooks/
├── lib/
├── __tests__/
├── package.json
└── tsconfig.json
```

---

## ✅ Checklist

- [x] Public app configured (Royal Voyage / com.royalvoyage.app)
- [x] Admin app configured (Royal Voyage Admin / com.royalvoyage.admin)
- [x] Admin app internal only (no public store distribution)
- [x] Public app for stores (Google Play & App Store ready)
- [x] Same backend preserved (shared API endpoints)
- [x] Admin routes protected (role-based access control)
- [x] Secrets backend-only (no API keys in apps)
- [x] APP_VARIANT public/admin works (environment-based config)
- [x] 0 TypeScript errors
- [x] 572/572 tests passed
- [x] EAS profiles ready (4 profiles configured)
- [x] Build commands documented
- [x] Security measures implemented

---

## 📝 Notes

1. **Backend Integration:** Both apps connect to the same backend. Admin routes are protected with role-based middleware.

2. **Package Names:** Different package names (com.royalvoyage.app vs com.royalvoyage.admin) allow both apps to be installed on the same device.

3. **Build Variants:** Use APP_VARIANT environment variable to control which app is built. This is automatically set in eas.json profiles.

4. **Future Enhancements:**
   - Visa customer flow (public app)
   - Visa admin controls (admin app)
   - TestFlight distribution for admin app (iOS)
   - Internal distribution service for admin app

5. **Security:** All sensitive operations (payments, settlements, admin controls) are backend-only. Apps only provide UI and user interaction.

---

## 🎯 Status

✅ **Ready for Production**

- Configuration: Complete
- Testing: Passed (572/572)
- TypeScript: Clean (0 errors)
- Security: Implemented
- Backend: Shared and protected
- Build Profiles: Configured

**Next Steps:**
1. Build public app for testing
2. Build admin app for internal testing
3. Deploy public app to Google Play & App Store
4. Distribute admin app internally

---

**Generated:** 2026-04-25 20:07 UTC  
**Project:** Royal Voyage  
**Version:** 1.1.23  
**Base:** royal_voyage_visa_system_skeleton.zip
