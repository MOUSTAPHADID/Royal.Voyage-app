# Royal Voyage Premium Design Update

## Summary
Applied a premium Royal Voyage visual identity inspired by the provided reference:

- Primary royal blue/navy
- Gold accents
- White cards
- Higher text contrast
- Premium search button style
- More readable home sections
- Partner registration flow

## Updated Files

- `theme.config.js`
  - Updated global palette to royal blue/gold/white.

- `app/(tabs)/index.tsx`
  - Improved home color contrast.
  - Set section titles to white on navy background.
  - Converted service cards to white cards with gold borders.
  - Improved main search button to navy + gold style.
  - Added “انضم كشريك / Become a Partner” CTA.

- `app/(tabs)/profile.tsx`
  - Added Partner Registration menu item.
  - Adjusted header to premium royal blue.

- `app/(tabs)/_layout.tsx`
  - Updated bottom tab bar to white/gold premium style.

- `app/partners/register.tsx`
  - Added a complete partner registration screen.
  - Supports travel agencies, companies, IATA agents, hotels, activities providers, visa providers, and insurance providers.

- `eas.json`
  - Fixed EAS build profiles.
  - `public-preview` builds APK.
  - `public-production` builds app-bundle.
  - Admin profiles build APK.

## Build Commands

Public test APK:

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

## Notes

The partner form currently sends prepared data through email. It is safe for testing and launch preparation. For full production automation, connect it to a server endpoint/admin partner-request table later.
