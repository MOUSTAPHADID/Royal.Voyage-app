import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ApiTermsScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">API Terms</Text>
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">1. Authentication</Text>
              <Text className="text-sm text-muted">All API requests must include a valid API key in the Authorization header.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">2. Rate Limits</Text>
              <Text className="text-sm text-muted">Standard: 10,000 requests/hour. Burst: 100 requests/minute.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">3. API Stability</Text>
              <Text className="text-sm text-muted">Royal Voyage maintains API stability. Planned maintenance is announced 7 days in advance.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">4. API Changes</Text>
              <Text className="text-sm text-muted">Deprecation notices are provided 90 days in advance.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
