import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function WalletScreen() {
  const transactions = [
    { id: 1, type: "debit", description: "Booking BK001", amount: 1200.0, date: "2 hours ago" },
    { id: 2, type: "credit", description: "Deposit", amount: 5000.0, date: "1 day ago" },
    { id: 3, type: "debit", description: "Booking BK002", amount: 1450.0, date: "2 days ago" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Balance */}
          <View className="bg-primary rounded-lg p-6 gap-2">
            <Text className="text-sm text-white/80">Wallet Balance</Text>
            <Text className="text-4xl font-bold text-white">$25,000.00</Text>
          </View>

          {/* Transactions */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Recent Transactions</Text>
            {transactions.map((tx) => (
              <View key={tx.id} className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{tx.description}</Text>
                  <Text className="text-xs text-muted mt-1">{tx.date}</Text>
                </View>
                <Text className={`text-base font-bold ${tx.type === "credit" ? "text-success" : "text-foreground"}`}>
                  {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
