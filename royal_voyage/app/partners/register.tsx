// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";

const ROYAL = {
  blue: "#1E3A8A",
  darkBlue: "#0B2D46",
  gold: "#D4AF37",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  text: "#1F2937",
  muted: "#64748B",
  success: "#10B981",
};

type PartnerType =
  | "travel_agency"
  | "company"
  | "iata_agent"
  | "hotel"
  | "activities"
  | "visa_provider"
  | "insurance_provider";

const PARTNER_TYPES: { key: PartnerType; ar: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: "travel_agency", ar: "وكالة سفر", icon: "flight-takeoff" },
  { key: "company", ar: "شركة", icon: "business" },
  { key: "iata_agent", ar: "وكيل IATA", icon: "verified" },
  { key: "hotel", ar: "فندق", icon: "hotel" },
  { key: "activities", ar: "مزود أنشطة", icon: "tour" },
  { key: "visa_provider", ar: "مزود تأشيرات", icon: "approval" },
  { key: "insurance_provider", ar: "مزود تأمين", icon: "security" },
];

export default function PartnerRegisterScreen() {
  const router = useRouter();
  const [partnerType, setPartnerType] = useState<PartnerType>("travel_agency");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    managerName: "",
    phone: "",
    email: "",
    country: "موريتانيا",
    city: "",
    hasIata: "no",
    iataNumber: "",
    paymentMethod: "",
    description: "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectedType = PARTNER_TYPES.find((p) => p.key === partnerType)?.ar ?? "شريك";

  const buildMessage = () =>
    `طلب تسجيل شريك جديد - Royal Voyage\n\n` +
    `نوع الشريك: ${selectedType}\n` +
    `اسم الشركة: ${form.companyName}\n` +
    `اسم المسؤول: ${form.managerName}\n` +
    `الهاتف: ${form.phone}\n` +
    `البريد: ${form.email || "غير مضاف"}\n` +
    `الدولة/المدينة: ${form.country} - ${form.city}\n` +
    `IATA: ${form.hasIata === "yes" ? form.iataNumber || "نعم بدون رقم" : "لا"}\n` +
    `طريقة الدفع: ${form.paymentMethod || "غير محددة"}\n` +
    `الوصف: ${form.description || "غير مضاف"}`;

  const validate = () => {
    if (!form.companyName.trim() || !form.managerName.trim() || !form.phone.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال اسم الشركة واسم المسؤول ورقم الهاتف.");
      return false;
    }
    return true;
  };

  const sendEmail = () => {
    if (!validate()) return;
    const subject = encodeURIComponent("Royal Voyage Partner Registration");
    const body = encodeURIComponent(buildMessage());
    setSubmitted(true);
    Linking.openURL(`mailto:suporte@royalvoyage.online?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert("لم يتم فتح البريد", "تم حفظ الطلب داخل الصفحة. يمكنك إرساله عبر واتساب بدلًا من البريد.");
    });
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    setSubmitted(true);
    const text = encodeURIComponent(buildMessage());
    Linking.openURL(`https://wa.me/22233700000?text=${text}`).catch(() => {
      Alert.alert("لم يتم فتح واتساب", "يرجى التواصل معنا على الرقم +22233700000.");
    });
  };

  return (
    <ScreenContainer containerClassName="bg-primary" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={ROYAL.gold} />
          </Pressable>
          <View style={styles.logoCircle}>
            <MaterialIcons name="handshake" size={34} color={ROYAL.gold} />
          </View>
          <Text style={styles.heroTitle}>انضم كشريك</Text>
          <Text style={styles.heroSub}>سجّل وكالتك أو شركتك أو خدمتك للعمل مع Royal Voyage</Text>
        </View>

        <View style={styles.card}>
          {submitted ? (
            <View style={styles.successBox}>
              <MaterialIcons name="check-circle" size={28} color={ROYAL.success} />
              <Text style={styles.successText}>تم تجهيز طلبك بنجاح. سيتواصل معك فريق Royal Voyage بعد مراجعة البيانات.</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>نوع الشريك</Text>
          <View style={styles.typeGrid}>
            {PARTNER_TYPES.map((item) => {
              const active = item.key === partnerType;
              return (
                <Pressable key={item.key} onPress={() => setPartnerType(item.key)} style={[styles.typeBtn, active && styles.typeBtnActive]}>
                  <MaterialIcons name={item.icon} size={20} color={active ? ROYAL.gold : ROYAL.blue} />
                  <Text style={[styles.typeText, active && styles.typeTextActive]}>{item.ar}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="اسم الشركة / المؤسسة *" value={form.companyName} onChangeText={(v) => update("companyName", v)} />
          <Field label="اسم المسؤول *" value={form.managerName} onChangeText={(v) => update("managerName", v)} />
          <Field label="رقم الهاتف *" value={form.phone} onChangeText={(v) => update("phone", v)} keyboardType="phone-pad" />
          <Field label="البريد الإلكتروني" value={form.email} onChangeText={(v) => update("email", v)} keyboardType="email-address" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}><Field label="الدولة" value={form.country} onChangeText={(v) => update("country", v)} /></View>
            <View style={{ flex: 1 }}><Field label="المدينة" value={form.city} onChangeText={(v) => update("city", v)} /></View>
          </View>

          <Text style={styles.label}>هل لديك IATA؟</Text>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segment, form.hasIata === "yes" && styles.segmentActive]} onPress={() => update("hasIata", "yes")}>
              <Text style={[styles.segmentText, form.hasIata === "yes" && styles.segmentTextActive]}>نعم</Text>
            </Pressable>
            <Pressable style={[styles.segment, form.hasIata === "no" && styles.segmentActive]} onPress={() => update("hasIata", "no")}>
              <Text style={[styles.segmentText, form.hasIata === "no" && styles.segmentTextActive]}>لا</Text>
            </Pressable>
          </View>

          {form.hasIata === "yes" && <Field label="رقم IATA" value={form.iataNumber} onChangeText={(v) => update("iataNumber", v)} />}

          <Field label="طريقة الدفع المفضلة" value={form.paymentMethod} onChangeText={(v) => update("paymentMethod", v)} placeholder="Bankily / Masrifi / Bank transfer / Cash" />
          <Field label="وصف مختصر عن النشاط" value={form.description} onChangeText={(v) => update("description", v)} multiline />

          <View style={styles.noteBox}>
            <MaterialIcons name="info" size={18} color={ROYAL.blue} />
            <Text style={styles.noteText}>يمكنك إرسال الطلب بالبريد أو واتساب. هذه طريقة آمنة حتى يتم ربط الطلبات مباشرة بلوحة الإدارة.</Text>
          </View>

          <Pressable style={styles.submitBtn} onPress={sendEmail}>
            <MaterialIcons name="email" size={22} color={ROYAL.gold} />
            <Text style={styles.submitText}>إرسال بالبريد</Text>
          </Pressable>
          <Pressable style={[styles.submitBtn, styles.whatsappBtn]} onPress={sendWhatsApp}>
            <MaterialIcons name="chat" size={22} color="#FFFFFF" />
            <Text style={styles.submitText}>إرسال عبر واتساب</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }: any) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && { minHeight: 96, textAlignVertical: "top" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: ROYAL.blue, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  logoCircle: { width: 76, height: 76, borderRadius: 24, borderWidth: 1.5, borderColor: ROYAL.gold, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroTitle: { color: ROYAL.white, fontSize: 28, fontWeight: "900", textAlign: "center" },
  heroSub: { color: "#E5E7EB", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  card: { backgroundColor: ROYAL.white, marginHorizontal: 16, marginTop: -22, borderRadius: 24, padding: 18, borderWidth: 1.2, borderColor: ROYAL.gold, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  successBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#ECFDF5", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#BBF7D0", marginBottom: 16 },
  successText: { flex: 1, color: ROYAL.text, fontSize: 13, lineHeight: 21, textAlign: "right", fontWeight: "700" },
  sectionTitle: { color: ROYAL.blue, fontSize: 18, fontWeight: "900", textAlign: "right", marginBottom: 12 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#D9B85F", backgroundColor: "#F8FAFC", paddingHorizontal: 10, paddingVertical: 9, borderRadius: 16 },
  typeBtnActive: { backgroundColor: ROYAL.blue, borderColor: ROYAL.gold },
  typeText: { color: ROYAL.text, fontSize: 12, fontWeight: "700" },
  typeTextActive: { color: ROYAL.white },
  label: { color: ROYAL.text, fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 6 },
  input: { borderWidth: 1.2, borderColor: "#D9B85F", backgroundColor: ROYAL.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: ROYAL.text, fontSize: 15, textAlign: "right" },
  row: { flexDirection: "row", gap: 10 },
  segmentRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  segment: { paddingVertical: 10, paddingHorizontal: 26, borderRadius: 14, backgroundColor: ROYAL.bg, borderWidth: 1, borderColor: "#D9B85F" },
  segmentActive: { backgroundColor: ROYAL.blue },
  segmentText: { color: ROYAL.text, fontWeight: "800" },
  segmentTextActive: { color: ROYAL.white },
  noteBox: { marginTop: 18, flexDirection: "row", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#BFDBFE" },
  noteText: { flex: 1, color: ROYAL.text, fontSize: 12, lineHeight: 20, textAlign: "right" },
  submitBtn: { marginTop: 18, backgroundColor: ROYAL.blue, borderRadius: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderColor: ROYAL.gold },
  whatsappBtn: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  submitText: { color: ROYAL.white, fontSize: 17, fontWeight: "900" },
});
