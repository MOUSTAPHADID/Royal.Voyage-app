import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";
import { cn } from "@/lib/utils";

interface Agency {
  id: number;
  companyName: string;
  iataNumber: string;
  email: string;
  phone: string;
  status: "pending_review" | "more_documents_required" | "approved" | "rejected" | "suspended";
  walletBalance: string;
  ticketingPermission: string;
  createdAt: string;
}

export default function IataAgenciesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgencies();
  }, [selectedStatus]);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedStatus
        ? `${getApiBaseUrl()}/api/iata/agencies?status=${selectedStatus}`
        : `${getApiBaseUrl()}/api/iata/agencies`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAgencies(data.data);
      } else {
        setError(data.error || "Failed to load agencies");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#22C55E";
      case "pending_review":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      case "suspended":
        return "#8B5CF6";
      case "more_documents_required":
        return "#06B6D4";
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_review":
        return "قيد المراجعة";
      case "more_documents_required":
        return "مستندات مطلوبة";
      case "approved":
        return "موافق عليه";
      case "rejected":
        return "مرفوض";
      case "suspended":
        return "معلق";
      default:
        return status;
    }
  };

  const statusFilters = [
    { label: "الكل", value: null },
    { label: "قيد المراجعة", value: "pending_review" },
    { label: "موافق عليه", value: "approved" },
    { label: "مرفوض", value: "rejected" },
    { label: "معلق", value: "suspended" },
  ];

  const renderAgencyCard = ({ item }: { item: Agency }) => (
    <Pressable
      onPress={() => router.push(`/admin/iata-agencies/${item.id}`)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(item.status),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            {item.companyName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            IATA: {item.iataNumber}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: "#fff", fontWeight: "600" }}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
          {item.email}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {item.phone}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
            رصيد المحفظة
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            {parseFloat(item.walletBalance).toFixed(2)} SAR
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
            صلاحية التذاكر
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
            {item.ticketingPermission === "booking_ticketing" ? "كامل" : item.ticketingPermission === "booking_only" ? "حجز فقط" : "بحث فقط"}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
            إدارة وكالات IATA
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {agencies.length} وكالة
          </Text>
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {statusFilters.map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => setSelectedStatus(filter.value)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: selectedStatus === filter.value ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: selectedStatus === filter.value ? "#fff" : colors.foreground,
                }}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 14, color: colors.error, textAlign: "center" }}>
                {error}
              </Text>
              <Pressable
                onPress={loadAgencies}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  إعادة المحاولة
                </Text>
              </Pressable>
            </View>
          ) : agencies.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
                لا توجد وكالات
              </Text>
            </View>
          ) : (
            <FlatList
              data={agencies}
              renderItem={renderAgencyCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
