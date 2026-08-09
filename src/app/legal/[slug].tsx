import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { getLegalPageBySlug } from "@/lib/legal";

export default function LegalDocumentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = typeof slug === "string" ? getLegalPageBySlug(slug) : undefined;

  if (!page) {
    return (
      <SafeAreaView className="flex-1 bg-bg px-6 py-8">
        <View>
          <Text className="text-xl font-bold text-text">Document not found</Text>
          <Text className="mt-2 text-sm text-muted">
            This legal page is unavailable offline.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return <LegalDocumentView page={page} />;
}
