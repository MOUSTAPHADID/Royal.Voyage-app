import { Redirect, Stack } from "expo-router";
import { AdminProvider } from "@/lib/admin-context";
import { IS_PUBLIC_APP } from "@/lib/app-variant";

export default function AdminLayout() {
  if (IS_PUBLIC_APP) {
    return <Redirect href="/" />;
  }

  return (
    <AdminProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking-detail/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="employee-form/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="partner-detail/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="iata-agencies/index" options={{ presentation: "card" }} />
        <Stack.Screen name="iata-agencies/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="iata-agencies/[id]" options={{ presentation: "card" }} />
      </Stack>
    </AdminProvider>
  );
}
