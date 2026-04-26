import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function TicketsScreen() {
  const tickets = [
    { id: "NKC26239A", booking: "BK001", passenger: "John Doe", status: "issued", date: "2 hours ago" },
    { id: "NKC26239B", booking: "BK002", passenger: "Jane Smith", status: "issued", date: "1 day ago" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Issued Tickets</Text>
          {tickets.map((ticket) => (
            <View key={ticket.id} className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="text-base font-bold text-foreground">{ticket.id}</Text>
              <Text className="text-sm text-muted">{ticket.passenger}</Text>
              <Text className="text-xs text-muted">Booking: {ticket.booking}</Text>
              <Text className="text-xs text-muted">{ticket.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
