# Royal Voyage — Public / Admin Split Build Guide

This project now supports two separated build variants using `APP_VARIANT`.

## 1. Public App — customer app

Purpose: customers only.

Included user-facing areas:
- Home
- Flights
- Hotels
- eSIM
- Visas
- Insurance
- Activities
- Bookings
- Profile
- Support and legal pages

Admin access is hidden and guarded in this variant. Direct access to `/admin` redirects back to the public app.

Build command:

```bash
eas build --platform android --profile public-preview
```

Production AAB:

```bash
eas build --platform android --profile public-production
```

Package name:

```text
com.royalvoyage.app
```

App name:

```text
Royal Voyage
```

## 2. Admin App — internal staff app

Purpose: internal staff and management only.

Startup route:

```text
/admin/login
```

Admin areas:
- Dashboard
- Bookings
- Employees
- Partners
- Reports
- Settings
- Activity Log
- IATA Agencies

Customer tabs are guarded in this variant and redirect to `/admin`.

Build command:

```bash
eas build --platform android --profile admin-internal
```

Admin preview build:

```bash
eas build --platform android --profile admin-preview
```

Package name:

```text
com.royalvoyage.admin
```

App name:

```text
Royal Voyage Admin
```

## EAS profiles

The profiles are configured in `eas.json`:

```text
public-preview      APP_VARIANT=public  APK
public-production   APP_VARIANT=public  AAB
admin-internal      APP_VARIANT=admin   APK
admin-preview       APP_VARIANT=admin   APK
```

## Important production notes

Before production, make sure these environment variables are configured on the server/build environment:

```text
ADMIN_SESSION_SECRET
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
AMADEUS_CLIENT_ID
AMADEUS_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Never publish the Admin App publicly. Use it only as an internal build or controlled distribution.
