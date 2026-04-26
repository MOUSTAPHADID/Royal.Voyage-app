import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function CreditScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <View className="bg-surface rounded-lg p-6 gap-4 border border-border">
            <View className="gap-2">
              <Text className="text-sm text-muted">Credit Limit</Text>
              <Text className="text-3xl font-bold text-foreground">$10,000.00</Text>
            </View>
            <View className="gap-2">
              <Text className="text-sm text-muted">Used Credit</Text>
              <Text className="text-2xl font-bold text-warning">$3,500.00</Text>
            </View>
            <View className="gap-2">
              <Text className="text-sm text-muted">Available Credit</Text>
              <Text className="text-2xl font-bold text-success">$6,500.00</Text>
            </View>
          </View>
          <View className="bg-primary/10 rounded-lg p-4 border border-primary">
            <Text className="text-sm text-foreground">35% of your credit limit is used</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
