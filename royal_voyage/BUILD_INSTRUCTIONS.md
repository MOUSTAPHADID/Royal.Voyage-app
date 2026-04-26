# Royal Voyage - Build Instructions

## Prerequisites

- Node.js 18+ and pnpm installed
- Expo CLI installed globally: `npm install -g expo-cli`
- EAS CLI installed globally: `npm install -g eas-cli`
- Expo account created at https://expo.dev

## Installation

```bash
# Install dependencies
pnpm install

# Verify TypeScript compilation
pnpm check

# Check Expo project health
npx expo-doctor
```

## Building for Android

### Preview Build (APK - for testing)

```bash
# Build APK using public-preview profile
eas build --platform android --profile public-preview

# This creates an APK file that can be installed directly on Android devices
# Download the APK from the Expo dashboard and install it
```

### Production Build (AAB - for Google Play Store)

```bash
# Build AAB using public-production profile
eas build --platform android --profile public-production

# This creates an Android App Bundle for submission to Google Play Store
```

## Available Build Profiles

| Profile | Type | Purpose | Output |
|---------|------|---------|--------|
| `public-preview` | APK | Testing & development | Direct installation |
| `public-production` | AAB | Production release | Google Play Store |
| `admin-preview` | APK | Admin testing | Direct installation |
| `admin-internal` | APK | Internal admin | Direct installation |

## Environment Variables Required

Before building, ensure these environment variables are set:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Amadeus
AMADEUS_CLIENT_ID=xxxxx
AMADEUS_CLIENT_SECRET=xxxxx

# Hotelbeds
HOTELBEDS_API_KEY=xxxxx

# Cloud Storage
PDF_STORAGE_PROVIDER=s3
PDF_S3_ACCESS_KEY_ID=xxxxx
PDF_S3_SECRET_ACCESS_KEY=xxxxx

# Other required variables...
```

## Build Process

1. **Development Build**
   ```bash
   eas build --platform android --profile public-preview
   ```
   - Creates APK file
   - Takes ~15-20 minutes
   - Can be tested immediately on devices

2. **Production Build**
   ```bash
   eas build --platform android --profile public-production
   ```
   - Creates AAB file
   - Takes ~15-20 minutes
   - Ready for Google Play Store submission

## Submitting to Google Play Store

```bash
# After production build completes
eas submit --platform android --latest
```

## Troubleshooting

### Build fails with "STRIPE_WEBHOOK_SECRET not set"
- Ensure `STRIPE_WEBHOOK_SECRET` is set in your environment variables
- Do NOT hardcode secrets in the code

### Dependency version mismatches
- Run: `npx expo install --check`
- These are usually non-critical warnings

### TypeScript errors
- Run: `pnpm check`
- Fix any compilation errors before building

## Project Structure

```
royal_voyage/
├── app/                    # Expo Router pages
├── server/                 # Backend API (Node.js/Express)
├── components/             # Reusable React Native components
├── hooks/                  # Custom React hooks
├── assets/                 # Images, icons, fonts
├── eas.json                # EAS build configuration
├── app.config.ts           # Expo app configuration
└── package.json            # Dependencies
```

## Key Features

- ✅ Flight booking (Amadeus integration)
- ✅ Hotel booking (Hotelbeds integration)
- ✅ eSIM plans
- ✅ Activities & tours
- ✅ Visa system (skeleton - ready for implementation)
- ✅ Travel insurance (placeholder)
- ✅ Payment processing (Stripe)
- ✅ Admin dashboard
- ✅ Partner API
- ✅ IATA ticketing support

## Support

For issues or questions:
1. Check the documentation in `server/README.md`
2. Review API docs in `PARTNER_API_DOCS.md`
3. Check visa system docs in `VISA_SYSTEM_IMPLEMENTATION_PLAN.md`

---

**Last Updated:** April 26, 2026
**Version:** 1.0.0

## Public/Admin separated builds

See `BUILD_PUBLIC_AND_ADMIN.md` for the separated Public App and Admin App build commands.
