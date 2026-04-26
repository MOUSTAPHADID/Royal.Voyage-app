import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";

export default function NewIataAgencyScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    commercialRegistrationNumber: "",
    taxNumber: "",
    iataNumber: "",
    responsiblePersonName: "",
    jobTitle: "",
    email: "",
    phone: "",
    country: "SA",
    city: "",
    bookingProvider: "amadeus",
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
    adminNote: "",
    status: "pending_review",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.iataNumber || !formData.email || !formData.phone) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies`, {
        method: "POST",
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
        Alert.alert("نجاح", "تم إنشاء الوكالة بنجاح", [
          {
            text: "حسناً",
            onPress: () => router.push("/admin/iata-agencies"),
          },
        ]);
      } else {
        Alert.alert("خطأ", data.error || "فشل إنشاء الوكالة");
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>
            إنشاء وكالة IATA جديدة
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          {/* Company Information */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            معلومات الشركة
          </Text>
          {renderInput("اسم الشركة *", "companyName", "أدخل اسم الشركة")}
          {renderInput("رقم السجل التجاري", "commercialRegistrationNumber", "أدخل رقم السجل التجاري")}
          {renderInput("رقم الضريبة", "taxNumber", "أدخل رقم الضريبة")}
          {renderInput("رقم IATA *", "iataNumber", "أدخل رقم IATA")}

          {/* Contact Information */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            معلومات الاتصال
          </Text>
          {renderInput("اسم المسؤول *", "responsiblePersonName", "أدخل اسم المسؤول")}
          {renderInput("المسمى الوظيفي", "jobTitle", "أدخل المسمى الوظيفي")}
          {renderInput("البريد الإلكتروني *", "email", "أدخل البريد الإلكتروني", "email")}
          {renderInput("رقم الهاتف *", "phone", "أدخل رقم الهاتف", "phone-pad")}

          {/* Location */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            الموقع
          </Text>
          {renderPicker("الدولة", "country", [
            { label: "السعودية", value: "SA" },
            { label: "الإمارات", value: "AE" },
            { label: "مصر", value: "EG" },
            { label: "الأردن", value: "JO" },
            { label: "لبنان", value: "LB" },
          ])}
          {renderInput("المدينة", "city", "أدخل المدينة")}

          {/* Booking Configuration */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12, marginTop: 16 }}>
            إعدادات الحجز
          </Text>
          {renderPicker("مزود الحجز", "bookingProvider", [
            { label: "Amadeus", value: "amadeus" },
            { label: "TPConnects", value: "tpconnects" },
          ])}
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
          {renderPicker("الحالة الأولية", "status", [
            { label: "قيد المراجعة", value: "pending_review" },
            { label: "موافق عليه", value: "approved" },
            { label: "مرفوض", value: "rejected" },
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
              disabled={loading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: pressed || loading ? 0.7 : 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  إنشاء الوكالة
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
