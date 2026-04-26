import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function DeveloperLayout() {
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
          title: "Developer Portal",
        }}
      />
      <Stack.Screen
        name="api-keys"
        options={{
          title: "API Keys",
        }}
      />
      <Stack.Screen
        name="docs"
        options={{
          title: "API Documentation",
        }}
      />
      <Stack.Screen
        name="webhooks"
        options={{
          title: "Webhooks",
        }}
      />
      <Stack.Screen
        name="sandbox"
        options={{
          title: "Sandbox Tester",
        }}
      />
    </Stack>
  );
}
