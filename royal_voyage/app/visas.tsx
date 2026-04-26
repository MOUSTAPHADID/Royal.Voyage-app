// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, StyleSheet, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const R = { blue: "#1E3A8A", gold: "#D4AF37", white: "#FFFFFF", bg: "#F8FAFC", text: "#1F2937", muted: "#64748B", green: "#10B981" };
const VISA_TYPES = ["سياحة", "أعمال", "دراسة", "علاج", "عمرة/زيارة", "أخرى"];

export default function VisasScreen() {
  const router = useRouter();
  const [visaType, setVisaType] = useState("سياحة");
  const [form, setForm] = useState({ name: "", phone: "", nationality: "", destination: "", travelDate: "", notes: "" });
  const update = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const validate = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.destination.trim()) {
      Alert.alert("بيانات ناقصة", "يرجى إدخال الاسم ورقم الهاتف والوجهة المطلوبة.");
      return false;
    }
    return true;
  };
  const msg = () => `طلب تأشيرة - Royal Voyage\n\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالجنسية: ${form.nationality}\nالوجهة: ${form.destination}\nنوع التأشيرة: ${visaType}\nتاريخ السفر: ${form.travelDate}\nملاحظات: ${form.notes}`;
  const sendWhatsApp = () => { if (!validate()) return; Linking.openURL(`https://wa.me/22233700000?text=${encodeURIComponent(msg())}`); };
  const sendEmail = () => { if (!validate()) return; Linking.openURL(`mailto:suporte@royalvoyage.online?subject=${encodeURIComponent("Visa Request")}&body=${encodeURIComponent(msg())}`); };
  return (
    <ScreenContainer containerClassName="bg-primary" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 44 }}>
        <Header icon="approval" title="طلب تأشيرة" sub="أرسل طلبك وسيقوم فريق Royal Voyage بمراجعة المتطلبات والتواصل معك" onBack={() => router.back()} />
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>نوع التأشيرة</Text>
          <View style={styles.grid}>{VISA_TYPES.map(t => <Pressable key={t} onPress={() => setVisaType(t)} style={[styles.chip, visaType === t && styles.chipActive]}><Text style={[styles.chipText, visaType === t && styles.chipTextActive]}>{t}</Text></Pressable>)}</View>
          <Field label="اسم المسافر *" value={form.name} onChangeText={(v) => update("name", v)} />
          <Field label="رقم الهاتف *" value={form.phone} onChangeText={(v) => update("phone", v)} keyboardType="phone-pad" />
          <Field label="الجنسية" value={form.nationality} onChangeText={(v) => update("nationality", v)} />
          <Field label="الدولة المطلوبة *" value={form.destination} onChangeText={(v) => update("destination", v)} placeholder="فرنسا / الإمارات / السعودية..." />
          <Field label="تاريخ السفر المتوقع" value={form.travelDate} onChangeText={(v) => update("travelDate", v)} placeholder="2026-05-26" />
          <Field label="ملاحظات أو تفاصيل إضافية" value={form.notes} onChangeText={(v) => update("notes", v)} multiline />
          <Info text="الأسعار والمتطلبات تعتمد على الجنسية والوجهة ونوع التأشيرة. لا يتم تأكيد أي طلب إلا بعد المراجعة." />
          <Actions onEmail={sendEmail} onWhatsApp={sendWhatsApp} main="إرسال طلب التأشيرة" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Header({ icon, title, sub, onBack }: any) { return <View style={styles.hero}><Pressable style={styles.back} onPress={onBack}><MaterialIcons name="arrow-back" size={22} color={R.gold} /></Pressable><View style={styles.logo}><MaterialIcons name={icon} size={36} color={R.gold} /></View><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroSub}>{sub}</Text></View>; }
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }: any) { return <View style={{ marginTop: 14 }}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder || label} placeholderTextColor="#94A3B8" keyboardType={keyboardType} multiline={multiline} style={[styles.input, multiline && { minHeight: 96, textAlignVertical: "top" }]} /></View>; }
function Info({ text }: any) { return <View style={styles.info}><MaterialIcons name="info" size={18} color={R.blue} /><Text style={styles.infoText}>{text}</Text></View>; }
function Actions({ onEmail, onWhatsApp, main }: any) { return <><Pressable style={styles.btn} onPress={onEmail}><MaterialIcons name="email" size={22} color={R.gold} /><Text style={styles.btnText}>{main} بالبريد</Text></Pressable><Pressable style={[styles.btn, styles.whatsapp]} onPress={onWhatsApp}><MaterialIcons name="chat" size={22} color="#fff" /><Text style={styles.btnText}>إرسال عبر واتساب</Text></Pressable></>; }

const styles = StyleSheet.create({
  hero: { backgroundColor: R.blue, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36, alignItems: "center" },
  back: { alignSelf: "flex-start", width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  logo: { width: 76, height: 76, borderRadius: 24, borderWidth: 1.5, borderColor: R.gold, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroTitle: { color: R.white, fontSize: 28, fontWeight: "900" }, heroSub: { color: "#E5E7EB", textAlign: "center", marginTop: 8, lineHeight: 22 },
  card: { backgroundColor: R.white, marginHorizontal: 16, marginTop: -22, borderRadius: 24, padding: 18, borderWidth: 1.2, borderColor: R.gold },
  sectionTitle: { color: R.blue, fontSize: 18, fontWeight: "900", textAlign: "right", marginBottom: 12 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  chip: { borderWidth: 1, borderColor: "#D9B85F", backgroundColor: R.bg, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16 }, chipActive: { backgroundColor: R.blue }, chipText: { color: R.text, fontWeight: "800" }, chipTextActive: { color: R.white },
  label: { color: R.text, fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 6 }, input: { borderWidth: 1.2, borderColor: "#D9B85F", backgroundColor: R.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: R.text, textAlign: "right" },
  info: { marginTop: 18, flexDirection: "row", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#BFDBFE" }, infoText: { flex: 1, color: R.text, textAlign: "right", lineHeight: 20 },
  btn: { marginTop: 18, backgroundColor: R.blue, borderRadius: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderColor: R.gold }, whatsapp: { backgroundColor: "#16A34A", borderColor: "#16A34A" }, btnText: { color: R.white, fontWeight: "900", fontSize: 16 },
});
