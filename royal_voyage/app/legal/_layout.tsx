import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function LegalLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="provider-terms"
        options={{
          title: "Provider Terms",
        }}
      />
      <Stack.Screen
        name="api-terms"
        options={{
          title: "API Terms",
        }}
      />
      <Stack.Screen
        name="ticketing-responsibility"
        options={{
          title: "Ticketing Responsibility",
        }}
      />
      <Stack.Screen
        name="payment-settlement-terms"
        options={{
          title: "Payment Settlement",
        }}
      />
    </Stack>
  );
}
