import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";

interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  createdAt: string;
}

export default function WalletManagementScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [formData, setFormData] = useState({
    amount: "",
    currency: "SAR",
    description: "",
    referenceId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [id]);

  const loadWalletData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/iata/agencies/${id}/wallet`);
      const data = await response.json();

      if (data.success) {
        setBalance(data.data.balance || 0);
        setTransactions(data.data.transactions || []);
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount) {
      Alert.alert("خطأ", "يرجى إدخال المبلغ");
      return;
    }

    try {
      setSubmitting(true);
      const endpoint =
        transactionType === "deposit"
          ? `${getApiBaseUrl()}/api/iata/agencies/${id}/wallet/deposit`
          : `${getApiBaseUrl()}/api/iata/agencies/${id}/wallet/adjustment`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          referenceId: formData.referenceId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("نجاح", "تم تسجيل العملية بنجاح");
        setFormData({ amount: "", currency: "SAR", description: "", referenceId: "" });
        setShowModal(false);
        loadWalletData();
      } else {
        Alert.alert("خطأ", data.error || "فشل تسجيل العملية");
      }
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 18, color: colors.primary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>
            إدارة المحفظة
          </Text>
        </View>

        {/* Balance Card */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, marginBottom: 8 }}>
              رصيد المحفظة
            </Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "700" }}>
              {balance.toFixed(2)} SAR
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <Pressable
              onPress={() => {
                setTransactionType("deposit");
                setShowModal(true);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.success,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                إضافة رصيد
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTransactionType("adjustment");
                setShowModal(true);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.warning,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                تسوية
              </Text>
            </Pressable>
          </View>

          {/* Transactions List */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            آخر العمليات
          </Text>
          {transactions.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 20 }}>
              لا توجد عمليات
            </Text>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: tx.type === "deposit" ? colors.success : colors.warning,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>
                    {tx.type === "deposit" ? "إضافة رصيد" : "تسوية"}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: tx.type === "deposit" ? colors.success : colors.warning,
                    }}
                  >
                    {tx.type === "deposit" ? "+" : "-"} {tx.amount.toFixed(2)} {tx.currency}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                  {tx.description}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>
                  {new Date(tx.createdAt).toLocaleDateString("ar-SA")}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 20,
              maxHeight: "80%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>
              {transactionType === "deposit" ? "إضافة رصيد" : "تسوية"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                  المبلغ
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
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={formData.amount}
                  onChangeText={(value) => setFormData((prev) => ({ ...prev, amount: value }))}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Currency */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                  العملة
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
                    selectedValue={formData.currency}
                    onValueChange={(value: string) => setFormData((prev) => ({ ...prev, currency: value }))}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="ريال سعودي" value="SAR" />
                    <Picker.Item label="دولار أمريكي" value="USD" />
                    <Picker.Item label="يورو" value="EUR" />
                  </Picker>
                </View>
              </View>

              {/* Description */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                  الوصف
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
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  placeholder="أدخل وصف العملية"
                  placeholderTextColor={colors.muted}
                  value={formData.description}
                  onChangeText={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                  multiline
                />
              </View>

              {/* Reference ID */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                  رقم المرجع
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
                  placeholder="أدخل رقم المرجع (اختياري)"
                  placeholderTextColor={colors.muted}
                  value={formData.referenceId}
                  onChangeText={(value) => setFormData((prev) => ({ ...prev, referenceId: value }))}
                />
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                <Pressable
                  onPress={() => setShowModal(false)}
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
                  disabled={submitting}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      opacity: pressed || submitting ? 0.7 : 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      تسجيل العملية
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
