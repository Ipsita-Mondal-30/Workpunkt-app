import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { LegalPageContent } from "@/lib/legal";

type LegalDocumentViewProps = {
  page: LegalPageContent;
};

export function LegalDocumentView({ page }: LegalDocumentViewProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable
          onPress={handleBack}
          className="rounded-xl bg-surface-end px-3 py-2"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-sm font-semibold text-text">Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-12 pt-6">
        <Text className="text-2xl font-bold text-text">{page.title}</Text>
        <Text className="mt-2 text-sm text-muted">Last updated: {page.lastUpdated}</Text>

        {page.sections.map((section, index) => (
          <View
            key={`${page.slug}-${section.heading ?? "section"}-${index}`}
            className="mt-6"
          >
            {section.heading ? (
              <Text className="mb-2 text-base font-semibold text-text">{section.heading}</Text>
            ) : null}
            {section.paragraphs.map((paragraph) => (
              <Text
                key={paragraph.slice(0, 64)}
                className="mb-2 text-sm leading-6 text-muted"
              >
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet) => (
              <View key={bullet} className="mb-1.5 flex-row gap-2 pl-1">
                <Text className="text-sm text-muted">•</Text>
                <Text className="flex-1 text-sm leading-6 text-muted">{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
