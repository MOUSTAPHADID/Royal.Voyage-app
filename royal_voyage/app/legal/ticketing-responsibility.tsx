import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function TicketingResponsibilityScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">IATA Ticketing Responsibility</Text>
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">1. Agency Responsibility</Text>
              <Text className="text-sm text-muted">Providers accept full responsibility for accuracy of passenger information and compliance with IATA regulations.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">2. Royal Voyage's Role</Text>
              <Text className="text-sm text-muted">Royal Voyage provides technical infrastructure but does not guarantee ticket validity or accept IATA compliance responsibility.</Text>
            </View>
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">3. Ticket Validation</Text>
              <Text className="text-sm text-muted">Royal Voyage performs validation including agency status, permissions, and financial checks.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
