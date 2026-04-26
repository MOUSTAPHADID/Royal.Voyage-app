import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function PaymentSettlementTermsScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Payment Settlement Terms</Text>
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">1. Settlement Cycle</Text>
              <Text className="text-sm text-muted">Settlements are processed monthly on the 15th for the previous calendar month.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">2. Payment Methods</Text>
              <Text className="text-sm text-muted">Bank transfer, credit to wallet, or check for large amounts.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">3. Payment Timing</Text>
              <Text className="text-sm text-muted">Payments processed within 5 business days. Bank transfers typically arrive within 2-3 business days.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">4. Disputes</Text>
              <Text className="text-sm text-muted">Providers may dispute settlements within 30 days with supporting documentation.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
