import Constants from "expo-constants";

export type AppVariant = "public" | "admin";

function readVariant(): AppVariant {
  const constantsAny = Constants as any;
  const fromExtra =
    constantsAny?.expoConfig?.extra?.appVariant ??
    constantsAny?.manifest?.extra?.appVariant ??
    constantsAny?.manifest2?.extra?.expoClient?.extra?.appVariant;
  const fromEnv = process.env.APP_VARIANT;
  const value = String(fromExtra || fromEnv || "public").toLowerCase();
  return value === "admin" ? "admin" : "public";
}

export const APP_VARIANT: AppVariant = readVariant();
export const IS_ADMIN_APP = APP_VARIANT === "admin";
export const IS_PUBLIC_APP = APP_VARIANT === "public";

export function getVariantHomeRoute() {
  return IS_ADMIN_APP ? "/admin" : "/";
}
