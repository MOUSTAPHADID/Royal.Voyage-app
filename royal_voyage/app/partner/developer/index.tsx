import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function DeveloperPortalDashboard() {
  const colors = useColors();

  const stats = [
    { label: "API Requests", value: "5,420", change: "+12%" },
    { label: "Success Rate", value: "99.2%", change: "+0.3%" },
    { label: "Avg Response", value: "245ms", change: "-15ms" },
    { label: "Rate Limit", value: "4,580/10k", change: "45% used" },
  ];

  const quickLinks = [
    { title: "API Keys", href: "/partner/developer/api-keys", icon: "🔑" },
    { title: "Webhooks", href: "/partner/developer/webhooks", icon: "🪝" },
    { title: "Documentation", href: "/partner/developer/docs", icon: "📚" },
    { title: "Sandbox", href: "/partner/developer/sandbox", icon: "🧪" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Developer Portal</Text>
            <Text className="text-base text-muted">Manage your API integration</Text>
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-2">Account Status</Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-lg font-bold text-foreground">Active</Text>
                <Text className="text-xs text-muted">Partner ID: PRT-12345</Text>
              </View>
              <View className="w-3 h-3 rounded-full bg-success" />
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">API Usage</Text>
            <View className="gap-2">
              {stats.map((stat, idx) => (
                <View key={idx} className="bg-surface rounded-lg p-3 border border-border flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs text-muted">{stat.label}</Text>
                    <Text className="text-lg font-bold text-foreground">{stat.value}</Text>
                  </View>
                  <Text className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-success" : "text-error"}`}>
                    {stat.change}
                  </Text>
                </View>
              ))}
            </View>
          </View>

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

          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Wallet & Credit</Text>
            <View className="gap-2">
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Wallet Balance</Text>
                <Text className="text-2xl font-bold text-foreground">$15,000.00</Text>
              </View>
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Credit Limit</Text>
                <Text className="text-2xl font-bold text-foreground">$10,000.00</Text>
                <Text className="text-xs text-muted mt-1">Available: $6,500.00</Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Recent API Errors</Text>
            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <View className="flex-row items-start gap-2">
                <Text className="text-lg">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Rate Limit Warning</Text>
                  <Text className="text-xs text-muted">2 hours ago</Text>
                </View>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-lg">❌</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Timeout Error</Text>
                  <Text className="text-xs text-muted">5 hours ago</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
