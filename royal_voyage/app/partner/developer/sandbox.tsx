import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function SandboxScreen() {
  const colors = useColors();
  const [selectedEndpoint, setSelectedEndpoint] = useState("search");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    {
      id: "search",
      name: "Search Flights",
      method: "POST",
      url: "/api/flights/search",
      request: {
        origin: "LIS",
        destination: "NYC",
        departureDate: "2026-05-15",
        passengers: 2,
      },
    },
    {
      id: "price",
      name: "Price Flight",
      method: "POST",
      url: "/api/flights/price",
      request: {
        flightId: "flight_123",
        passengers: 2,
      },
    },
    {
      id: "booking",
      name: "Create Booking",
      method: "POST",
      url: "/api/bookings/create",
      request: {
        flightId: "flight_123",
        passengers: [
          { firstName: "John", lastName: "Doe", email: "john@example.com" },
        ],
      },
    },
  ];

  const handleTestApi = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const endpoint = endpoints.find((e) => e.id === selectedEndpoint);
      setResponse({
        status: 200,
        statusText: "OK",
        data: {
          ...endpoint?.request,
          sandbox: true,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to test API");
    } finally {
      setLoading(false);
    }
  };

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Sandbox Tester</Text>
            <Text className="text-sm text-muted">Test API endpoints in sandbox mode</Text>
          </View>

          {/* Endpoint Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Select Endpoint</Text>
            {endpoints.map((endpoint) => (
              <TouchableOpacity
                key={endpoint.id}
                onPress={() => setSelectedEndpoint(endpoint.id)}
                className={`rounded-lg p-3 border ${
                  selectedEndpoint === endpoint.id
                    ? "bg-primary/10 border-primary"
                    : "bg-surface border-border"
                } active:opacity-70`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`w-2 h-2 rounded-full ${
                        selectedEndpoint === endpoint.id ? "bg-primary" : "bg-border"
                      }`}
                    />
                    <Text className="font-semibold text-foreground">{endpoint.name}</Text>
                  </View>
                  <Text className="text-xs font-mono text-muted">{endpoint.method}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Request */}
          {currentEndpoint && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Request</Text>
              <View className="bg-surface rounded-lg p-3 border border-border">
                <Text className="text-xs font-mono text-muted mb-2">{currentEndpoint.method} {currentEndpoint.url}</Text>
                <View className="bg-background rounded p-2">
                  <Text className="text-xs font-mono text-muted">
                    {JSON.stringify(currentEndpoint.request, null, 2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Test Button */}
          <TouchableOpacity
            onPress={handleTestApi}
            disabled={loading}
            className={`${loading ? "opacity-50" : ""} bg-primary px-4 py-3 rounded-lg active:opacity-80`}
          >
            <Text className="text-white font-semibold text-center">
              {loading ? "Testing..." : "Test API Connection"}
            </Text>
          </TouchableOpacity>

          {/* Response */}
          {response && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Response</Text>
              <View className="bg-surface rounded-lg p-3 border border-border gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-mono text-muted">Status</Text>
                  <View className="bg-success/20 px-2 py-1 rounded">
                    <Text className="text-xs font-semibold text-success">{response.status} {response.statusText}</Text>
                  </View>
                </View>
                <View className="bg-background rounded p-2">
                  <Text className="text-xs font-mono text-muted">
                    {JSON.stringify(response.data, null, 2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sandbox Note */}
          <View className="bg-primary/10 rounded-lg p-3 border border-primary gap-1">
            <Text className="text-sm font-semibold text-foreground">💡 Sandbox Mode</Text>
            <Text className="text-xs text-muted">
              All responses include "sandbox": true. Use this for testing without affecting production data.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
