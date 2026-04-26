import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ApiUsageScreen() {
  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">API Usage</Text>
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Total Requests</Text>
              <Text className="text-lg font-bold text-foreground">5,420</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Successful</Text>
              <Text className="text-lg font-bold text-success">5,380</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Failed</Text>
              <Text className="text-lg font-bold text-error">40</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Avg Response</Text>
              <Text className="text-lg font-bold text-foreground">245ms</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
