// @ts-nocheck
import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";

const ROYAL = { blue: "#1E3A8A", gold: "#D4AF37", white: "#FFFFFF", bg: "#F8FAFC", text: "#1F2937", muted: "#64748B" };

export default function BusinessLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const login = () => {
    if (!email.trim()) { Alert.alert("بيانات ناقصة", "يرجى إدخال بريد الشركة أو رقم الهاتف."); return; }
    Alert.alert("تم الاستلام", "إذا كان حسابك التجاري معتمدًا، سيتواصل معك فريق Royal Voyage لتفعيل الدخول الكامل.", [
      { text: "متابعة", onPress: () => router.push("/business/dashboard" as any) }
    ]);
  };
  return (
    <ScreenContainer containerClassName="bg-primary" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={ROYAL.gold} /></Pressable>
          <MaterialIcons name="business-center" size={58} color={ROYAL.gold} />
          <Text style={styles.heroTitle}>دخول الشركات</Text>
          <Text style={styles.heroSub}>للوكالات والشركات المعتمدة لدى Royal Voyage</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>بريد الشركة أو رقم الهاتف</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="company@email.com أو +222..." placeholderTextColor="#94A3B8" autoCapitalize="none" />
          <Text style={styles.label}>رمز الدخول / رقم الطلب</Text>
          <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="اختياري" placeholderTextColor="#94A3B8" />
          <Pressable style={styles.submitBtn} onPress={login}><Text style={styles.submitText}>دخول / متابعة</Text></Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.push("/business/register" as any)}><Text style={styles.secondaryText}>تسجيل شركة جديدة</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: ROYAL.blue, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: ROYAL.white, fontSize: 28, fontWeight: "900", marginTop: 12 },
  heroSub: { color: "#E5E7EB", fontSize: 14, textAlign: "center", marginTop: 8 },
  card: { backgroundColor: ROYAL.white, marginHorizontal: 16, marginTop: -22, borderRadius: 24, padding: 18, borderWidth: 1.2, borderColor: ROYAL.gold },
  label: { color: ROYAL.text, fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1.2, borderColor: "#D9B85F", backgroundColor: ROYAL.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: ROYAL.text, fontSize: 15, textAlign: "right" },
  submitBtn: { marginTop: 22, backgroundColor: ROYAL.blue, borderRadius: 20, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: ROYAL.gold },
  submitText: { color: ROYAL.white, fontSize: 17, fontWeight: "900" },
  secondaryBtn: { marginTop: 12, paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: ROYAL.blue, fontWeight: "900", fontSize: 15 },
});
