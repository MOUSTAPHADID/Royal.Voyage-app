# Royal Voyage Admin Production Fix Report

Applied fixes:

1. Removed fixed/fake deals from `app/deals.tsx` and replaced them with a safe empty state.
2. Replaced localhost IATA API URLs in admin screens with `getApiBaseUrl()`.
3. Disabled admin dashboard and users screens that contained demo/fake data.
4. Cleaned missing admin Stack screens from `app/admin/_layout.tsx`.
5. Strengthened tRPC admin authentication:
   - `employees.verifyLogin` now returns a signed admin session token.
   - tRPC client now sends `x-admin-token` with `x-employee-id`.
   - `adminProcedure` now requires a valid signed token, not just an employee id.

Build notes:
- Use: `eas build --platform android --profile public-preview`
- Production: `eas build --platform android --profile public-production`
- Before production, set `ADMIN_SESSION_SECRET` in the server environment.
