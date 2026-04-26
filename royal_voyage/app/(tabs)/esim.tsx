import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Linking } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const T = {
  ar: {
    title: 'eSIM Go',
    subtitle: 'اتصل بالعالم بسهولة',
    myEsims: 'eSIMs الخاصة بي',
    dataPlans: 'خطط البيانات',
    gb: 'GB',
    days: 'يوم',
    price: 'السعر',
    active: 'نشط',
    expired: 'منتهي الصلاحية',
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    cancelled: 'ملغي',
    failed: 'فشل',
    noEsims: 'لا توجد eSIMs حالياً',
    noPlans: 'لا توجد خطط eSIM متاحة حاليًا، يرجى المحاولة لاحقًا أو التواصل معنا.',
    contactUs: 'تواصل معنا',
    contactMessage: 'للحصول على خطط eSIM، يرجى التواصل معنا عبر واتساب أو البريد الإلكتروني.',
  },
  fr: {
    title: 'eSIM Go',
    subtitle: 'Connectez-vous au monde facilement',
    myEsims: 'Mes eSIMs',
    dataPlans: 'Plans de données',
    gb: 'GB',
    days: 'jours',
    price: 'Prix',
    active: 'Actif',
    expired: 'Expiré',
    pending: 'En attente',
    processing: 'En cours',
    cancelled: 'Annulé',
    failed: 'Échoué',
    noEsims: 'Aucun eSIM actuellement',
    noPlans: 'Aucun plan eSIM disponible actuellement. Veuillez réessayer plus tard ou nous contacter.',
    contactUs: 'Contactez-nous',
    contactMessage: 'Pour obtenir des plans eSIM, veuillez nous contacter via WhatsApp ou email.',
  },
};

type TabType = 'plans' | 'myEsims';

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#22C55E20', text: '#22C55E' },
  expired: { bg: '#EF444420', text: '#EF4444' },
  pending: { bg: '#F59E0B20', text: '#F59E0B' },
  processing: { bg: '#3B82F620', text: '#3B82F6' },
  cancelled: { bg: '#6B728020', text: '#6B7280' },
  failed: { bg: '#EF444420', text: '#EF4444' },
};

export default function EsimScreen() {
  const colors = useColors();
  const t = T['ar'];

  const [activeTab, setActiveTab] = useState<TabType>('plans');

  // Use the real API route: trpc.esim.myOrders
  const { data: myOrdersData, isLoading: myOrdersLoading } = trpc.esim.myOrders.useQuery(
    { userId: 'user123' },
    { enabled: activeTab === 'myEsims' }
  );

  const myOrders = myOrdersData ?? [];

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      active: t.active,
      expired: t.expired,
      pending: t.pending,
      processing: t.processing,
      cancelled: t.cancelled,
      failed: t.failed,
    };
    return map[status] || status;
  };

  const renderOrderCard = ({ item }: { item: typeof myOrders[number] }) => {
    const statusStyle = statusColors[item.status] || statusColors.pending;
    return (
      <View
        style={[styles.esimCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.esimHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="sim-card" size={20} color={colors.primary} />
            <Text style={[styles.esimDestination, { color: colors.foreground }]}>{item.destination}</Text>
          </View>
          <View style={[styles.esimStatus, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.esimStatusText, { color: statusStyle.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={[styles.esimDetail, { color: colors.muted }]}>{item.planName}</Text>
          {item.dataAmount && (
            <Text style={[styles.esimDetail, { color: colors.muted }]}>{item.dataAmount}</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={[styles.esimPrice, { color: colors.primary }]}>{item.priceMru} MRU</Text>
          <Text style={[styles.esimDate, { color: colors.muted }]}>
            {new Date(item.createdAt).toLocaleDateString('ar-SA')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="sim-card" size={32} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'plans' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('plans')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'plans' ? colors.primary : colors.muted, fontWeight: activeTab === 'plans' ? 'bold' : 'normal' },
              ]}
            >
              {t.dataPlans}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'myEsims' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('myEsims')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'myEsims' ? colors.primary : colors.muted, fontWeight: activeTab === 'myEsims' ? 'bold' : 'normal' },
              ]}
            >
              {t.myEsims}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'plans' ? (
          <View style={styles.content}>
            {/* No fake plans - show informational message */}
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="sim-card" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>
                {t.dataPlans}
              </Text>
              <Text style={[styles.infoText, { color: colors.muted }]}>
                {t.noPlans}
              </Text>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL('https://wa.me/22233700000?text=' + encodeURIComponent('طلب خطط eSIM - Royal Voyage'))}
              >
                <MaterialIcons name="chat" size={18} color="#fff" style={{ marginLeft: 6 }} />
                <Text style={styles.contactBtnText}>{t.contactUs}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {myOrdersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : myOrders.length > 0 ? (
              <FlatList
                data={myOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                numColumns={1}
                contentContainerStyle={{ gap: 12 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="sim-card" size={48} color={colors.muted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>{t.noEsims}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 24, marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  loadingContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  infoCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  infoText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 12, gap: 6 },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  esimCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  esimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  esimDestination: { fontSize: 16, fontWeight: 'bold' },
  esimStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  esimStatusText: { fontSize: 11, fontWeight: 'bold' },
  esimDetail: { fontSize: 12 },
  esimPrice: { fontSize: 14, fontWeight: 'bold' },
  esimDate: { fontSize: 11 },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 14 },
});
