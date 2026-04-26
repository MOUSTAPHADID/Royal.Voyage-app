// @ts-nocheck
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function DealsScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <ScreenContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}> 
            <IconSymbol name="tag.fill" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>العروض</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>لا توجد عروض متاحة حاليًا. سيتم عرض العروض هنا فقط عند توفر بيانات حقيقية من النظام.</Text>
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>رجوع</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: "center", gap: 12 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  description: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  button: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, marginTop: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
});
