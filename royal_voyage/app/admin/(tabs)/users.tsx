// @ts-nocheck
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function AdminUsersScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>المستخدمون</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>لا توجد بيانات مستخدمين تجريبية في هذه الصفحة. سيتم عرض المستخدمين هنا بعد ربطها بواجهة API حقيقية.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, textAlign: "right" },
  description: { fontSize: 15, lineHeight: 24, textAlign: "right" },
});
