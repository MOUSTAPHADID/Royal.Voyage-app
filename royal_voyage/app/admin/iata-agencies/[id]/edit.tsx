import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";

export default function EditIataAgencyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    iataNumber: "",
    pccOfficeId: "",
    ticketingPermission: "booking_only",
    ticketingOwner: "royal_voyage",
    paymentMethod: "wallet",
    creditLimit: "0",
    currency: "SAR",
    markupType: "percentage",
    markupValue: "0",
    commissionType: "percentage",
    commissionValue: "0",
    status: "pending_review",
    adminNote: "",
  });

  useEffect(() => {
    loadAgencyData();
  }, [id]);

  const loadAgencyData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          iataNumber: data.data.iataNumber || "",
          pccOfficeId: data.data.pccOfficeId || "",
          ticketingPermission: data.data.ticketingPermission || "booking_only",
          ticketingOwner: data.data.ticketingOwner || "royal_voyage",
          paymentMethod: data.data.paymentMethod || "wallet",
          creditLimit: data.data.creditLimit?.toString() || "0",
          currency: data.data.currency || "SAR",
          markupType: data.data.markupType || "percentage",
          markupValue: data.data.markupValue?.toString() || "0",
          commissionType: data.data.commissionType || "percentage",
          commissionValue: data.data.commissionValue?.toString() || "0",
          status: data.data.status || "pending_review",
          adminNote: data.data.adminNote || "",
        });
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          creditLimit: parseFloat(formData.creditLimit),
          markupValue: parseFloat(formData.markupValue),
          commissionValue: parseFloat(formData.commissionValue),
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("نجاح", "تم تحديث الوكالة بنجاح", [
          {
            text: "حسناً",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("خطأ", data.error || "فشل تحديث الوكالة");
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const renderInput = (label: string, field: string, placeholder: string, keyboardType = "default") => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: colors.foreground,
          backgroundColor: colors.surface,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={formData[field as keyof typeof formData] as string}
        onChangeText={(value) => handleChange(field, value)}
        keyboardType={keyboardType as any}
      />
    </View>
  );

  const renderPicker = (label: string, field: string, options: { label: string; value: string }[]) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
        {label}
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          backgroundColor: colors.surface,
          overflow: "hidden",
        }}
      >
        <Picker
          selectedValue={formData[field as keyof typeof formData]}
          onValueChange={(value: string) => handleChange(field, value)}
          style={{ color: colors.foreground }}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 18, color: colors.primary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>
            تعديل الوكالة
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          {/* Booking Configuration */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            إعدادات الحجز
          </Text>
          {renderInput("رقم IATA", "iataNumber", "أدخل رقم IATA")}
          {renderInput("PCC / Office ID", "pccOfficeId", "أدخل PCC أو Office ID")}

          {/* Ticketing */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            إعدادات التذاكر
          </Text>
          {renderPicker("صلاحية التذاكر", "ticketingPermission", [
            { label: "بحث فقط", value: "search_only" },
            { label: "حجز فقط", value: "booking_only" },
            { label: "حجز وتذاكر", value: "booking_ticketing" },
          ])}
          {renderPicker("مالك التذاكر", "ticketingOwner", [
            { label: "Royal Voyage", value: "royal_voyage" },
            { label: "الوكالة", value: "partner_agency" },
          ])}

          {/* Payment Configuration */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            إعدادات الدفع
          </Text>
          {renderPicker("طريقة الدفع", "paymentMethod", [
            { label: "محفظة", value: "wallet" },
            { label: "حد ائتماني", value: "credit_limit" },
            { label: "تحويل بنكي", value: "bank_transfer" },
          ])}
          {renderInput("الحد الائتماني", "creditLimit", "0", "decimal-pad")}
          {renderPicker("العملة", "currency", [
            { label: "ريال سعودي", value: "SAR" },
            { label: "دولار أمريكي", value: "USD" },
            { label: "يورو", value: "EUR" },
          ])}

          {/* Pricing */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            الأسعار والعمولات
          </Text>
          {renderPicker("نوع الهامش", "markupType", [
            { label: "نسبة مئوية", value: "percentage" },
            { label: "مبلغ ثابت", value: "fixed" },
          ])}
          {renderInput("قيمة الهامش", "markupValue", "0", "decimal-pad")}
          {renderPicker("نوع العمولة", "commissionType", [
            { label: "نسبة مئوية", value: "percentage" },
            { label: "مبلغ ثابت", value: "fixed" },
          ])}
          {renderInput("قيمة العمولة", "commissionValue", "0", "decimal-pad")}

          {/* Status & Notes */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            الحالة والملاحظات
          </Text>
          {renderPicker("الحالة", "status", [
            { label: "قيد المراجعة", value: "pending_review" },
            { label: "مستندات مطلوبة", value: "more_documents_required" },
            { label: "موافق عليه", value: "approved" },
            { label: "مرفوض", value: "rejected" },
            { label: "معلق", value: "suspended" },
          ])}
          {renderInput("ملاحظة الإدارة", "adminNote", "أدخل ملاحظة (اختياري)")}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 32 }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                إلغاء
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: pressed || saving ? 0.7 : 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  حفظ التغييرات
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
