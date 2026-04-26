import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ProviderTermsScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Provider Terms & Conditions</Text>
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">1. API Access & Usage</Text>
              <Text className="text-sm text-muted">Providers are responsible for keeping API keys confidential. API keys must not be shared or exposed in client-side code.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">2. Rate Limiting</Text>
              <Text className="text-sm text-muted">API requests are subject to rate limits: 10,000 requests per hour. Exceeding limits may result in temporary suspension.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">3. Acceptable Use</Text>
              <Text className="text-sm text-muted">Providers must not use the API for unauthorized purposes or attempt to bypass security measures.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">4. Settlement & Payments</Text>
              <Text className="text-sm text-muted">Commissions are calculated based on Provider's agreement and deducted from booking amounts. Settlement reports are generated monthly.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">5. Termination</Text>
              <Text className="text-sm text-muted">Royal Voyage may terminate for material breach, security violations, or regulatory non-compliance.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
