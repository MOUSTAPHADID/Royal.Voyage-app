import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

export default function DocsScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "auth",
      title: "Authentication",
      content: `All API requests require an API key in the Authorization header:

Authorization: Bearer YOUR_API_KEY

Example:
curl -H "Authorization: Bearer pk_live_xyz123" \\
  https://api.royalvoyage.online/api/flights/search`,
    },
    {
      id: "search",
      title: "Search Flights",
      content: `POST /api/flights/search

Request:
{
  "origin": "LIS",
  "destination": "NYC",
  "departureDate": "2026-05-15",
  "passengers": 2,
  "tripType": "roundtrip"
}

Response:
{
  "flights": [...],
  "sandbox": false
}`,
    },
    {
      id: "price",
      title: "Price Flight",
      content: `POST /api/flights/price

Request:
{
  "flightId": "flight_123",
  "passengers": 2
}

Response:
{
  "totalPrice": 2400.00,
  "pricePerPassenger": 1200.00,
  "currency": "USD"
}`,
    },
    {
      id: "booking",
      title: "Create Booking",
      content: `POST /api/bookings/create

Request:
{
  "flightId": "flight_123",
  "passengers": [...],
  "contactEmail": "user@example.com"
}

Response:
{
  "bookingId": "BK001",
  "status": "confirmed",
  "pnr": "ABC123"
}`,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">API Documentation</Text>
            <Text className="text-sm text-muted">Partner API Reference</Text>
          </View>

          {/* Base URL */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs font-semibold text-muted mb-2">Base URL</Text>
            <Text className="text-sm font-mono text-foreground">https://api.royalvoyage.online</Text>
          </View>

          {/* Sections */}
          {sections.map((section) => (
            <View key={section.id} className="bg-surface rounded-lg border border-border overflow-hidden">
              <TouchableOpacity
                onPress={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="p-4 flex-row items-center justify-between active:opacity-70"
              >
                <Text className="text-base font-semibold text-foreground">{section.title}</Text>
                <Text className="text-lg text-foreground">{expandedSection === section.id ? "−" : "+"}</Text>
              </TouchableOpacity>

              {expandedSection === section.id && (
                <View className="bg-background p-4 border-t border-border">
                  <Text className="text-xs font-mono text-muted leading-relaxed">{section.content}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Rate Limits */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-base font-semibold text-foreground">Rate Limits</Text>
            <View className="gap-1">
              <Text className="text-sm text-muted">• Standard: 10,000 requests/hour</Text>
              <Text className="text-sm text-muted">• Burst: 100 requests/minute</Text>
              <Text className="text-sm text-muted">• Rate limit info in response headers</Text>
            </View>
          </View>

          {/* Error Handling */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-base font-semibold text-foreground">Error Handling</Text>
            <Text className="text-sm text-muted">All errors return JSON with error code and message:</Text>
            <View className="bg-background rounded p-2 mt-2">
              <Text className="text-xs font-mono text-muted">{"{"}</Text>
              <Text className="text-xs font-mono text-muted">  "error": "INVALID_PARAMS",</Text>
              <Text className="text-xs font-mono text-muted">  "message": "Missing required field"</Text>
              <Text className="text-xs font-mono text-muted">{"}"}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
