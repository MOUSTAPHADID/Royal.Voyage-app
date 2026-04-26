// @ts-nocheck
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function AdminDashboardDeprecatedScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <ScreenContainer>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>لوحة التحكم الرئيسية</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>تم تعطيل هذه الصفحة لأنها كانت تحتوي على بيانات تجريبية. استخدم لوحة الإدارة الرئيسية المعتمدة على البيانات الحقيقية.</Text>
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.replace("/admin/(tabs)" as any)}>
          <Text style={styles.buttonText}>العودة للوحة الإدارة</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "right" },
  description: { fontSize: 15, lineHeight: 24, textAlign: "right" },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
});
