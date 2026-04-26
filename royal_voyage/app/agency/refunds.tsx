import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function RefundsScreen() {
  const refunds = [
    { id: "RF001", booking: "BK001", amount: 600.0, status: "pending", date: "2 days ago" },
    { id: "RF002", booking: "BK003", amount: 950.0, status: "completed", date: "1 week ago" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Refunds</Text>
            <TouchableOpacity className="bg-primary px-4 py-2 rounded active:opacity-80">
              <Text className="text-white font-semibold text-sm">Request Refund</Text>
            </TouchableOpacity>
          </View>
          {refunds.map((refund) => (
            <View key={refund.id} className="bg-surface rounded-lg p-4 border border-border gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-foreground">{refund.id}</Text>
                <View className={`px-2 py-1 rounded ${refund.status === "completed" ? "bg-success/20" : "bg-warning/20"}`}>
                  <Text className={`text-xs font-semibold capitalize ${refund.status === "completed" ? "text-success" : "text-warning"}`}>
                    {refund.status}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-muted">Booking: {refund.booking}</Text>
              <Text className="text-base font-bold text-foreground">${refund.amount.toFixed(2)}</Text>
              <Text className="text-xs text-muted">{refund.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
