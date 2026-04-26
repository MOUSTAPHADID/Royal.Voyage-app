import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ApiKeysScreen() {
  const colors = useColors();
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<{ key: string; name: string } | null>(null);

  const apiKeys = [
    { id: 1, name: "Production Key", preview: "****", status: "active", createdAt: "2026-04-15", lastUsed: "2 hours ago" },
    { id: 2, name: "Sandbox Key", preview: "****", status: "active", createdAt: "2026-04-10", lastUsed: "1 day ago" },
  ];

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      Alert.alert("Error", "Please enter a key name");
      return;
    }
    // Simulate key creation
    const newKey = `pk_live_${Math.random().toString(36).substring(2, 15)}`;
    setCreatedKey({ key: newKey, name: newKeyName });
    setNewKeyName("");
  };

  const handleCopyKey = (key: string) => {
    // In real app, use Clipboard API
    Alert.alert("Success", "API key copied to clipboard");
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">API Keys</Text>
              <Text className="text-sm text-muted">Manage your API credentials</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowNewKeyModal(true)}
              className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
            >
              <Text className="text-white font-semibold text-sm">+ New Key</Text>
            </TouchableOpacity>
          </View>

          {/* Created Key Display */}
          {createdKey && (
            <View className="bg-success/10 border border-success rounded-lg p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">✓ API Key Created</Text>
              <Text className="text-xs text-muted">Save this key securely. You won't see it again.</Text>
              <View className="bg-background rounded p-2 mt-2 border border-border">
                <Text className="text-xs font-mono text-foreground break-words">{createdKey.key}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopyKey(createdKey.key)}
                className="bg-primary px-3 py-2 rounded active:opacity-80 mt-2"
              >
                <Text className="text-white font-semibold text-sm text-center">Copy Key</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* API Keys List */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Your API Keys</Text>
            {apiKeys.map((key) => (
              <View key={key.id} className="bg-surface rounded-lg p-4 border border-border gap-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{key.name}</Text>
                    <Text className="text-xs text-muted mt-1">Key ends with: {key.preview}</Text>
                  </View>
                  <View className="bg-success/20 px-2 py-1 rounded">
                    <Text className="text-xs font-semibold text-success">{key.status}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
                  <View>
                    <Text className="text-xs text-muted">Created: {key.createdAt}</Text>
                    <Text className="text-xs text-muted">Last used: {key.lastUsed}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity className="px-3 py-1 rounded border border-border active:opacity-70">
                      <Text className="text-xs font-semibold text-foreground">Rename</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-3 py-1 rounded border border-error active:opacity-70">
                      <Text className="text-xs font-semibold text-error">Disable</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* New Key Modal */}
          {showNewKeyModal && (
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <Text className="text-base font-semibold text-foreground">Create New API Key</Text>
              <TextInput
                placeholder="Key name (e.g., Production, Staging)"
                value={newKeyName}
                onChangeText={setNewKeyName}
                className="border border-border rounded px-3 py-2 text-foreground"
                placeholderTextColor={colors.muted}
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setShowNewKeyModal(false)}
                  className="flex-1 px-3 py-2 rounded border border-border active:opacity-70"
                >
                  <Text className="text-sm font-semibold text-foreground text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateKey}
                  className="flex-1 px-3 py-2 rounded bg-primary active:opacity-80"
                >
                  <Text className="text-sm font-semibold text-white text-center">Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
