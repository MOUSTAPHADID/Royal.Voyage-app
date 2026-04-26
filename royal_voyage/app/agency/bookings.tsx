import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function AgencyBookingsScreen() {
  const bookings = [
    {
      id: "BK001",
      passenger: "John Doe",
      route: "LIS → NYC",
      date: "2026-05-15",
      status: "ticketed",
      amount: 1200.0,
    },
    {
      id: "BK002",
      passenger: "Jane Smith",
      route: "LIS → LAX",
      date: "2026-05-16",
      status: "confirmed",
      amount: 1450.0,
    },
    {
      id: "BK003",
      passenger: "Bob Johnson",
      route: "LIS → MIA",
      date: "2026-05-17",
      status: "pending",
      amount: 950.0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ticketed":
        return "bg-success/20 text-success";
      case "confirmed":
        return "bg-primary/20 text-primary";
      case "pending":
        return "bg-warning/20 text-warning";
      default:
        return "bg-muted/20 text-muted";
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Your Bookings</Text>
            <Text className="text-sm text-muted">Total: {bookings.length} bookings</Text>
          </View>

          {/* Bookings List */}
          <View className="gap-2">
            {bookings.map((booking) => (
              <View key={booking.id} className="bg-surface rounded-lg p-4 border border-border gap-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{booking.passenger}</Text>
                    <Text className="text-sm text-muted mt-1">{booking.route}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                    <Text className="text-xs font-semibold capitalize">{booking.status}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-2 border-t border-border">
                  <View>
                    <Text className="text-xs text-muted">Booking ID: {booking.id}</Text>
                    <Text className="text-xs text-muted">Date: {booking.date}</Text>
                  </View>
                  <Text className="text-base font-bold text-foreground">${booking.amount.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
