# Royal Voyage — Voice, Company Login, Partner Registration Fix

## Fixed

1. Voice search
- Added manual text fallback inside the voice modal.
- If speech-to-text service is unavailable or microphone transcription fails, the user can type the destination directly.
- Improved Arabic error message.

2. Company / Business flow
- Added `app/business/login.tsx`.
- Changed profile business account button to open `/business/login`.
- Rebuilt `app/business/register.tsx` as a safe working request form.
- Business request can be sent by Email or WhatsApp.
- No fake company data is shown.

3. Partner registration
- Rebuilt `app/partners/register.tsx` cleanly.
- Fixed broken style block.
- Partner request can be sent by Email or WhatsApp.
- Added success confirmation after sending.

4. Visa page
- Replaced Coming Soon placeholder with a working visa request form.
- Sends request by Email or WhatsApp.
- No fixed prices or fake data.

5. Insurance page
- Replaced Coming Soon placeholder with a working insurance request form.
- Sends request by Email or WhatsApp.
- No fixed prices or fake data.

6. eSIM page
- Contact button now opens WhatsApp directly for eSIM requests.
- Still does not show fake eSIM prices.

## Build
Run:

```bash
pnpm install
pnpm check
npx expo-doctor
eas build --platform android --profile public-preview
```

