import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function InvoicesScreen() {
  const invoices = [
    { id: "INV001", date: "2026-04-01", amount: 5000.0, status: "paid" },
    { id: "INV002", date: "2026-03-01", amount: 4500.0, status: "paid" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Invoices</Text>
          {invoices.map((invoice) => (
            <View key={invoice.id} className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{invoice.id}</Text>
                <Text className="text-sm text-muted mt-1">{invoice.date}</Text>
              </View>
              <View className="items-end gap-2">
                <Text className="text-base font-bold text-foreground">${invoice.amount.toFixed(2)}</Text>
                <TouchableOpacity className="px-3 py-1 rounded bg-primary/10 border border-primary">
                  <Text className="text-xs font-semibold text-primary">Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
