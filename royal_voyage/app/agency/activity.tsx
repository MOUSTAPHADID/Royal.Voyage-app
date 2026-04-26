import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ActivityScreen() {
  const logs = [
    { id: 1, action: "Booking created", details: "BK001", timestamp: "2 hours ago" },
    { id: 2, action: "Ticket issued", details: "NKC26239A", timestamp: "2 hours ago" },
    { id: 3, action: "Payment confirmed", details: "BK001", timestamp: "1 day ago" },
    { id: 4, action: "Booking created", details: "BK002", timestamp: "1 day ago" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Activity Logs</Text>
          {logs.map((log) => (
            <View key={log.id} className="bg-surface rounded-lg p-4 border border-border gap-1">
              <Text className="text-sm font-semibold text-foreground">{log.action}</Text>
              <Text className="text-xs text-muted">{log.details}</Text>
              <Text className="text-xs text-muted">{log.timestamp}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
