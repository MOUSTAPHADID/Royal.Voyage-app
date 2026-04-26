import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function PartnerLayout() {
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
        name="developer"
        options={{
          title: "Partner Developer Portal",
        }}
      />
    </Stack>
  );
}
