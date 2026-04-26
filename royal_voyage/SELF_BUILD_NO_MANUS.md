# Royal Voyage — البناء بدون Manus

هذه النسخة جاهزة للعمل بدون Manus. يوجد تطبيقان منفصلان عبر `APP_VARIANT`:

## 1) تطبيق العملاء Public
- الاسم: Royal Voyage
- Android package: `com.royalvoyage.app`
- EAS profiles:
  - `public-preview` لإخراج APK اختبار
  - `public-production` لإخراج AAB للنشر

### بناء APK اختبار للعملاء
```bash
pnpm install
pnpm check
npx expo-doctor
eas build --platform android --profile public-preview
```

### بناء AAB إنتاج للعملاء
```bash
pnpm install
pnpm check
npx expo-doctor
eas build --platform android --profile public-production
```

## 2) تطبيق الإدارة Admin
- الاسم: Royal Voyage Admin
- Android package: `com.royalvoyage.admin`
- EAS profiles:
  - `admin-internal` لإخراج APK داخلي للإدارة
  - `admin-preview` لاختبار الإدارة

### بناء APK الإدارة
```bash
pnpm install
pnpm check
npx expo-doctor
eas build --platform android --profile admin-internal
```

## متغيرات البيئة المطلوبة قبل التشغيل/الإنتاج
لا تضع الأسرار داخل الكود. ضعها في بيئة السيرفر أو EAS Secrets:

```bash
ADMIN_SESSION_SECRET=ضع_قيمة_قوية_وسرية
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test...
STRIPE_SECRET_KEY=sk_live_or_test...
STRIPE_WEBHOOK_SECRET=whsec_...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
HOTELBEDS_API_KEY=...
HOTELBEDS_SECRET=...
```

## أوامر سريعة
```bash
bash scripts/build-public-preview.sh
bash scripts/build-admin-internal.sh
```

## ملاحظات مهمة
- لا تحتاج Manus للبناء.
- تحتاج فقط تسجيل الدخول إلى حساب Expo الخاص بك مرة واحدة:
```bash
eas login
```
- لا ترسل كلمة مرور Expo أو Google Play لأي شخص.
- استخدم GitHub Secrets أو EAS Secrets للمفاتيح السرية.
