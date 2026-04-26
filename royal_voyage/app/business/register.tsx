// @ts-nocheck
import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";

const ROYAL = { blue: "#1E3A8A", gold: "#D4AF37", white: "#FFFFFF", bg: "#F8FAFC", text: "#1F2937", muted: "#64748B", success: "#10B981" };
const TYPES = ["شركة", "وكالة سفر", "منظم رحلات", "مؤسسة", "أخرى"];

export default function BusinessRegisterScreen() {
  const router = useRouter();
  const [type, setType] = useState("شركة");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ companyName: "", managerName: "", email: "", phone: "", city: "", address: "", registrationNumber: "", taxId: "", iataNumber: "", notes: "" });
  const update = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const validate = () => {
    if (!form.companyName.trim() || !form.managerName.trim() || !form.phone.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال اسم الشركة واسم المسؤول ورقم الهاتف.");
      return false;
    }
    return true;
  };
  const message = () => `طلب حساب تجاري - Royal Voyage\n\nنوع الحساب: ${type}\nاسم الشركة: ${form.companyName}\nاسم المسؤول: ${form.managerName}\nالهاتف: ${form.phone}\nالبريد: ${form.email || "غير مضاف"}\nالمدينة: ${form.city}\nالعنوان: ${form.address}\nالسجل التجاري: ${form.registrationNumber}\nالرقم الضريبي: ${form.taxId}\nIATA: ${form.iataNumber || "لا يوجد"}\nملاحظات: ${form.notes}`;
  const sendEmail = () => {
    if (!validate()) return;
    setSubmitted(true);
    Linking.openURL(`mailto:suporte@royalvoyage.online?subject=${encodeURIComponent("Royal Voyage Business Account")}&body=${encodeURIComponent(message())}`).catch(() => Alert.alert("لم يتم فتح البريد", "يمكنك الإرسال عبر واتساب."));
  };
  const sendWhatsApp = () => {
    if (!validate()) return;
    setSubmitted(true);
    Linking.openURL(`https://wa.me/22233700000?text=${encodeURIComponent(message())}`).catch(() => Alert.alert("لم يتم فتح واتساب", "يرجى التواصل على +22233700000."));
  };
  return (
    <ScreenContainer containerClassName="bg-primary" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 42 }}>
        <View style={styles.hero}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={ROYAL.gold} /></Pressable>
          <View style={styles.logoCircle}><MaterialIcons name="business" size={34} color={ROYAL.gold} /></View>
          <Text style={styles.heroTitle}>تسجيل شركة</Text>
          <Text style={styles.heroSub}>اطلب حسابًا تجاريًا للشركات والوكالات وإدارة حجوزات فريقك</Text>
        </View>
        <View style={styles.card}>
          {submitted ? <View style={styles.successBox}><MaterialIcons name="check-circle" size={28} color={ROYAL.success} /><Text style={styles.successText}>تم تجهيز طلب الحساب التجاري. سيراجعه فريق Royal Voyage ويتواصل معك.</Text></View> : null}
          <Text style={styles.sectionTitle}>نوع الحساب</Text>
          <View style={styles.typeGrid}>{TYPES.map(t => <Pressable key={t} onPress={() => setType(t)} style={[styles.typeBtn, type === t && styles.typeBtnActive]}><Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text></Pressable>)}</View>
          <Field label="اسم الشركة *" value={form.companyName} onChangeText={(v) => update("companyName", v)} />
          <Field label="اسم المسؤول *" value={form.managerName} onChangeText={(v) => update("managerName", v)} />
          <Field label="رقم الهاتف *" value={form.phone} onChangeText={(v) => update("phone", v)} keyboardType="phone-pad" />
          <Field label="البريد الإلكتروني" value={form.email} onChangeText={(v) => update("email", v)} keyboardType="email-address" />
          <Field label="المدينة" value={form.city} onChangeText={(v) => update("city", v)} />
          <Field label="العنوان التجاري" value={form.address} onChangeText={(v) => update("address", v)} />
          <Field label="رقم السجل التجاري" value={form.registrationNumber} onChangeText={(v) => update("registrationNumber", v)} />
          <Field label="الرقم الضريبي" value={form.taxId} onChangeText={(v) => update("taxId", v)} />
          <Field label="رقم IATA إن وجد" value={form.iataNumber} onChangeText={(v) => update("iataNumber", v)} />
          <Field label="ملاحظات" value={form.notes} onChangeText={(v) => update("notes", v)} multiline />
          <View style={styles.noteBox}><MaterialIcons name="info" size={18} color={ROYAL.blue} /><Text style={styles.noteText}>بعد الإرسال يتم فتح البريد أو واتساب لإرسال الطلب. لاحقًا يمكن ربطه مباشرة بلوحة الإدارة.</Text></View>
          <Pressable style={styles.submitBtn} onPress={sendEmail}><MaterialIcons name="email" size={22} color={ROYAL.gold} /><Text style={styles.submitText}>إرسال بالبريد</Text></Pressable>
          <Pressable style={[styles.submitBtn, styles.whatsappBtn]} onPress={sendWhatsApp}><MaterialIcons name="chat" size={22} color="#fff" /><Text style={styles.submitText}>إرسال عبر واتساب</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }: any) {
  return <View style={{ marginTop: 14 }}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder || label} placeholderTextColor="#94A3B8" multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && { minHeight: 96, textAlignVertical: "top" }]} /></View>;
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
  typeBtn: { borderWidth: 1, borderColor: "#D9B85F", backgroundColor: ROYAL.bg, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 },
  typeBtnActive: { backgroundColor: ROYAL.blue, borderColor: ROYAL.gold },
  typeText: { color: ROYAL.text, fontSize: 12, fontWeight: "700" },
  typeTextActive: { color: ROYAL.white },
  label: { color: ROYAL.text, fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 6 },
  input: { borderWidth: 1.2, borderColor: "#D9B85F", backgroundColor: ROYAL.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: ROYAL.text, fontSize: 15, textAlign: "right" },
  noteBox: { marginTop: 18, flexDirection: "row", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#BFDBFE" },
  noteText: { flex: 1, color: ROYAL.text, fontSize: 12, lineHeight: 20, textAlign: "right" },
  submitBtn: { marginTop: 18, backgroundColor: ROYAL.blue, borderRadius: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderColor: ROYAL.gold },
  whatsappBtn: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  submitText: { color: ROYAL.white, fontSize: 17, fontWeight: "900" },
});
