import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function AgencyLayout() {
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
        name="index"
        options={{
          title: "Agency Dashboard",
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: "Bookings",
        }}
      />
      <Stack.Screen
        name="wallet"
        options={{
          title: "Wallet",
        }}
      />
      <Stack.Screen
        name="credit"
        options={{
          title: "Credit",
        }}
      />
      <Stack.Screen
        name="tickets"
        options={{
          title: "Tickets",
        }}
      />
      <Stack.Screen
        name="refunds"
        options={{
          title: "Refunds",
        }}
      />
      <Stack.Screen
        name="invoices"
        options={{
          title: "Invoices",
        }}
      />
      <Stack.Screen
        name="api-usage"
        options={{
          title: "API Usage",
        }}
      />
      <Stack.Screen
        name="activity"
        options={{
          title: "Activity Logs",
        }}
      />
    </Stack>
  );
}
