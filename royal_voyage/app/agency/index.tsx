import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function AgencyDashboard() {
  const stats = [
    { label: "Total Bookings", value: "500", icon: "📅" },
    { label: "This Month", value: "45", icon: "📊" },
    { label: "Tickets Issued", value: "480", icon: "🎫" },
    { label: "Pending Refunds", value: "3", icon: "↩️" },
  ];

  const quickLinks = [
    { title: "Bookings", href: "/agency/bookings", icon: "📅" },
    { title: "Wallet", href: "/agency/wallet", icon: "💰" },
    { title: "Credit", href: "/agency/credit", icon: "💳" },
    { title: "Tickets", href: "/agency/tickets", icon: "🎫" },
    { title: "Refunds", href: "/agency/refunds", icon: "↩️" },
    { title: "Invoices", href: "/agency/invoices", icon: "📄" },
    { title: "API Usage", href: "/agency/api-usage", icon: "📈" },
    { title: "Activity", href: "/agency/activity", icon: "📋" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Welcome Back</Text>
            <Text className="text-base text-muted">Example Agency</Text>
          </View>

          {/* Stats Grid */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Overview</Text>
            <View className="gap-2">
              {stats.map((stat, idx) => (
                <View key={idx} className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-muted">{stat.label}</Text>
                    <Text className="text-2xl font-bold text-foreground mt-1">{stat.value}</Text>
                  </View>
                  <Text className="text-3xl">{stat.icon}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Links */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Quick Access</Text>
            <View className="gap-2">
              {quickLinks.map((link, idx) => (
                <Link key={idx} href={link.href as any} asChild>
                  <TouchableOpacity className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between active:opacity-70">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">{link.icon}</Text>
                      <Text className="text-base font-semibold text-foreground">{link.title}</Text>
                    </View>
                    <Text className="text-foreground">→</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>

          {/* Account Status */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Account Status</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Status</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-success" />
                <Text className="font-semibold text-foreground">Active</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Agency ID</Text>
              <Text className="font-mono text-foreground">AG-12345</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
