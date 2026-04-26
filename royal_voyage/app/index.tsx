import { Redirect } from "expo-router";
import { Platform } from "react-native";
import { useApp } from "@/lib/app-context";
import { IS_ADMIN_APP } from "@/lib/app-variant";

export default function Index() {
  const { isAuthenticated } = useApp();

  if (IS_ADMIN_APP) {
    return <Redirect href="/admin" />;
  }

  if (Platform.OS === "web") {
    return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/landing" />;
  }

  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/onboarding" />;
}
