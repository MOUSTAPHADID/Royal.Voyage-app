import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";
// Back button component

interface Agency {
  id: number;
  companyName: string;
  iataNumber: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  responsiblePersonName: string;
  status: string;
  walletBalance: string;
  creditLimit: string;
  usedCredit: string;
  ticketingPermission: string;
  ticketingOwner: string;
  paymentMethod: string;
  markupType: string;
  markupValue: string;
  commissionType: string;
  commissionValue: string;
  createdAt: string;
  approvedAt?: string;
}

interface ActivityLog {
  id: number;
  actionType: string;
  description: string;
  createdAt: string;
}

export default function IataAgencyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useColors();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadAgencyDetails();
  }, [id]);

  const loadAgencyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}`);
      const agencyData = await response.json();

      if (agencyData.success) {
        setAgency(agencyData.data);
        setEditData(agencyData.data);
      }

      const logsResponse = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}/logs`);
      const logsData = await logsResponse.json();

      if (logsData.success) {
        setLogs(logsData.data);
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    Alert.alert("تأكيد", "هل تريد الموافقة على هذه الوكالة؟", [
      { text: "إلغاء", onPress: () => {} },
      {
        text: "موافقة",
        onPress: async () => {
          try {
            setActionLoading(true);
            const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}/approve`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ approvedBy: 1 }),
            });

            const data = await response.json();
            if (data.success) {
              Alert.alert("نجاح", "تم الموافقة على الوكالة");
              loadAgencyDetails();
            } else {
              Alert.alert("خطأ", data.error);
            }
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
    Alert.alert("رفض الوكالة", "أدخل سبب الرفض:", [
      { text: "إلغاء", onPress: () => {} },
      {
        text: "رفض",
        onPress: async () => {
          try {
            setActionLoading(true);
            const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}/reject`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reason: "تم الرفض من قبل الإدارة",
                rejectedBy: 1,
              }),
            });

            const data = await response.json();
            if (data.success) {
              Alert.alert("نجاح", "تم رفض الوكالة");
              loadAgencyDetails();
            } else {
              Alert.alert("خطأ", data.error);
            }
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleSuspend = async () => {
    Alert.alert("تعليق الوكالة", "هل تريد تعليق هذه الوكالة؟", [
      { text: "إلغاء", onPress: () => {} },
      {
        text: "تعليق",
        onPress: async () => {
          try {
            setActionLoading(true);
            const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}/suspend`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reason: "تم التعليق من قبل الإدارة",
                suspendedBy: 1,
              }),
            });

            const data = await response.json();
            if (data.success) {
              Alert.alert("نجاح", "تم تعليق الوكالة");
              loadAgencyDetails();
            } else {
              Alert.alert("خطأ", data.error);
            }
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!agency) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <Text style={{ color: colors.error }}>لم يتم العثور على الوكالة</Text>
      </ScreenContainer>
    );
  }

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
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_review":
        return "قيد المراجعة";
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

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}>
            <Text style={{ fontSize: 24, color: colors.primary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, flex: 1 }}>
            {agency.companyName}
          </Text>
        </View>

        {/* Status Badge */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: getStatusColor(agency.status),
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>
              {getStatusLabel(agency.status)}
            </Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            معلومات الشركة
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>رقم IATA:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.iataNumber}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>البريد الإلكتروني:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.email}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>الهاتف:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.phone}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>الدولة:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.country}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>المسؤول:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.responsiblePersonName}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet & Credit */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            المحفظة والرصيد
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                رصيد المحفظة
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#22C55E" }}>
                {parseFloat(agency.walletBalance).toFixed(2)} SAR
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                الحد الائتماني
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
                {parseFloat(agency.creditLimit).toFixed(2)} SAR
              </Text>
            </View>
          </View>
        </View>

        {/* Ticketing Settings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            إعدادات التذاكر
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>صلاحية التذاكر:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
                {agency.ticketingPermission === "booking_ticketing"
                  ? "حجز وتذاكر"
                  : agency.ticketingPermission === "booking_only"
                  ? "حجز فقط"
                  : "بحث فقط"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>مالك التذاكر:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.ticketingOwner === "royal_voyage" ? "Royal Voyage" : "الوكالة"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>طريقة الدفع:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.paymentMethod === "wallet"
                  ? "محفظة"
                  : agency.paymentMethod === "credit_limit"
                  ? "حد ائتماني"
                  : "تحويل بنكي"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            الأسعار والعمولات
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>نوع الهامش:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.markupType === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>قيمة الهامش:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.markupValue}
                {agency.markupType === "percentage" ? "%" : " SAR"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>نوع العمولة:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.commissionType === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>قيمة العمولة:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                {agency.commissionValue}
                {agency.commissionType === "percentage" ? "%" : " SAR"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {agency.status === "pending_review" && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
            <Pressable
              onPress={handleApprove}
              disabled={actionLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: "#22C55E",
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: pressed || actionLoading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                {actionLoading ? "جاري المعالجة..." : "الموافقة على الوكالة"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleReject}
              disabled={actionLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: "#EF4444",
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: pressed || actionLoading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                رفض الوكالة
              </Text>
            </Pressable>
          </View>
        )}

        {agency.status === "approved" && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Pressable
              onPress={handleSuspend}
              disabled={actionLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: "#8B5CF6",
                  paddingVertical: 12,
                  borderRadius: 8,
                  opacity: pressed || actionLoading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                تعليق الوكالة
              </Text>
            </Pressable>
          </View>
        )}

        {/* Activity Logs */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            سجل النشاطات
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
            {logs.length === 0 ? (
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", paddingVertical: 8 }}>
                لا توجد نشاطات
              </Text>
            ) : (
              logs.slice(0, 5).map((log) => (
                <View key={log.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    {log.actionType}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {log.description}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    {new Date(log.createdAt).toLocaleString("ar-SA")}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
