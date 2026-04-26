import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function WebhooksScreen() {
  const colors = useColors();
  const [webhookUrl, setWebhookUrl] = useState("https://partner.example.com/webhooks");
  const [enabled, setEnabled] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "booking_created",
    "ticket_issued",
    "payment_confirmed",
  ]);

  const allEvents = [
    { id: "booking_created", name: "Booking Created" },
    { id: "price_changed", name: "Price Changed" },
    { id: "ticket_issued", name: "Ticket Issued" },
    { id: "ticket_failed", name: "Ticket Failed" },
    { id: "refund_requested", name: "Refund Requested" },
    { id: "refund_completed", name: "Refund Completed" },
    { id: "payment_pending", name: "Payment Pending" },
    { id: "payment_confirmed", name: "Payment Confirmed" },
  ];

  const deliveryLogs = [
    { id: 1, event: "booking_created", status: "success", timestamp: "2 hours ago" },
    { id: 2, event: "ticket_issued", status: "success", timestamp: "1 hour ago" },
    { id: 3, event: "payment_confirmed", status: "failed", timestamp: "30 mins ago", retries: 2 },
  ];

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      Alert.alert("Error", "Please enter a webhook URL");
      return;
    }
    Alert.alert("Success", "Webhook configuration saved");
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Webhooks</Text>
            <Text className="text-sm text-muted">Configure webhook delivery</Text>
          </View>

          {/* Webhook Configuration */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-base font-semibold text-foreground">Webhook Configuration</Text>

            {/* URL */}
            <View className="gap-1">
              <Text className="text-xs font-semibold text-muted">Webhook URL</Text>
              <TextInput
                value={webhookUrl}
                onChangeText={setWebhookUrl}
                placeholder="https://your-domain.com/webhooks"
                className="border border-border rounded px-3 py-2 text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Enable/Disable */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Enabled</Text>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveWebhook}
              className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
            >
              <Text className="text-white font-semibold text-center text-sm">Save Configuration</Text>
            </TouchableOpacity>
          </View>

          {/* Events Selection */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Subscribe to Events</Text>
            <View className="gap-2">
              {allEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => toggleEvent(event.id)}
                  className="bg-surface rounded-lg p-3 border border-border flex-row items-center justify-between active:opacity-70"
                >
                  <Text className="text-sm font-semibold text-foreground">{event.name}</Text>
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      selectedEvents.includes(event.id)
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedEvents.includes(event.id) && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delivery Logs */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Recent Deliveries</Text>
            {deliveryLogs.map((log) => (
              <View key={log.id} className="bg-surface rounded-lg p-3 border border-border gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">{log.event}</Text>
                  <View
                    className={`px-2 py-1 rounded ${
                      log.status === "success"
                        ? "bg-success/20"
                        : "bg-error/20"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        log.status === "success"
                          ? "text-success"
                          : "text-error"
                      }`}
                    >
                      {log.status === "success" ? "✓ Success" : "✗ Failed"}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted">{log.timestamp}</Text>
                {log.retries && (
                  <Text className="text-xs text-muted">Retries: {log.retries}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Security Note */}
          <View className="bg-primary/10 rounded-lg p-3 border border-primary gap-1">
            <Text className="text-sm font-semibold text-foreground">🔒 Security</Text>
            <Text className="text-xs text-muted">
              Each webhook includes an HMAC-SHA256 signature in the X-Webhook-Signature header. Verify the signature before processing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
