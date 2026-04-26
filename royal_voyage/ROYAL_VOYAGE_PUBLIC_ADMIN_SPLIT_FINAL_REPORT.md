# Public/Admin Split Final Report

## Completed

- Added `lib/app-variant.ts` to detect `APP_VARIANT` from Expo config.
- `app.config.ts` already supports separate public/admin names, package IDs, schemes, and slugs.
- `eas.json` already supports separate public/admin profiles.
- Public build starts as customer app.
- Admin build starts at `/admin` and then redirects to admin login when no admin session exists.
- Public app direct access to `/admin` is guarded and redirects to `/`.
- Customer tabs are guarded in the admin variant and redirect to `/admin`.
- Removed the visible Admin Dashboard shortcut from the customer profile in public builds.
- Guarded legacy employee login/dashboard routes from opening in public builds.
- Added `BUILD_PUBLIC_AND_ADMIN.md` with build commands.

## Build commands

Public APK:

```bash
eas build --platform android --profile public-preview
```

Public production AAB:

```bash
eas build --platform android --profile public-production
```

Admin internal APK:

```bash
eas build --platform android --profile admin-internal
```

## Security reminder

UI separation does not replace server security. Admin APIs must remain protected by the admin token/session on the backend.
