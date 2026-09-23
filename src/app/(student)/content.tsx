import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { openExternalUrl } from "@/lib/open-external-url";
import { queryKeys } from "@/lib/query/keys";
import { useThemeColors } from "@/lib/theme/theme-context";

type ContentItem = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  duration?: string;
  phase?: string;
  image?: string;
  action?: string;
  url?: string;
  playbackUrl?: string;
};

const TYPES = ["All", "Podcast", "Newsletter", "Webinar", "Career Conversation", "Article"];
const PHASES = ["All", "Discovery", "Decision", "Docs", "Application", "Waiting", "Pre-departure"];

export default function StudentContentScreen() {
  const colors = useThemeColors();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [phase, setPhase] = useState("All");

  return (
    <ResourceScreen<ContentItem[]>
      title="Content Hub"
      subtitle="Podcasts, articles, webinars and career conversations for your Germany journey."
      queryKey={queryKeys.studentContent()}
      path="/api/content"
      staleTime={5 * 60_000}
    >
      {(items) => {
        const needle = search.trim().toLowerCase();
        const filtered = items.filter((item) =>
          (!needle || `${item.title} ${item.description ?? ""}`.toLowerCase().includes(needle)) &&
          (type === "All" || item.type === type) &&
          (phase === "All" || item.phase === phase),
        );
        return (
          <View>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search the Content Hub…" placeholderTextColor={colors.placeholder} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text" />
            <Text className="mb-2 mt-4 text-xs font-bold uppercase text-muted">Content type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((item) => <Pressable key={item} onPress={() => setType(item)} className={type === item ? "rounded-full bg-brand-mid px-3 py-2" : "rounded-full bg-surface-end px-3 py-2"}><Text className={type === item ? "text-xs font-bold text-white" : "text-xs font-semibold text-text"}>{item}</Text></Pressable>)}
            </View>
            <Text className="mb-2 mt-4 text-xs font-bold uppercase text-muted">Journey phase</Text>
            <View className="flex-row flex-wrap gap-2">
              {PHASES.map((item) => <Pressable key={item} onPress={() => setPhase(item)} className={phase === item ? "rounded-full bg-brand-start px-3 py-2" : "rounded-full bg-surface-end px-3 py-2"}><Text className={phase === item ? "text-xs font-bold text-white" : "text-xs font-semibold text-text"}>{item}</Text></Pressable>)}
            </View>
            <Text className="mb-3 mt-6 text-base font-bold text-text">{filtered.length} resource{filtered.length === 1 ? "" : "s"}</Text>
            {filtered.length === 0 ? <Text className="text-sm text-muted">No content matches those filters.</Text> : filtered.map((item) => (
              <Pressable key={item.id} disabled={!item.url && !item.playbackUrl} onPress={() => void openExternalUrl(item.playbackUrl || item.url || "")} className="mb-3 overflow-hidden rounded-2xl border border-border bg-surface">
                {item.image ? <Image source={{ uri: item.image }} style={{ width: "100%", height: 160 }} contentFit="cover" transition={180} /> : null}
                <View className="px-4 py-4">
                  <View className="flex-row flex-wrap gap-2"><Text className="text-[10px] font-bold uppercase text-brand-mid">{item.type || "Resource"}</Text>{item.phase ? <Text className="text-[10px] font-semibold uppercase text-muted">· {item.phase}</Text> : null}</View>
                  <Text className="mt-2 text-base font-bold text-text">{item.title}</Text>
                  {item.description ? <Text className="mt-2 text-sm leading-5 text-muted" numberOfLines={3}>{item.description}</Text> : null}
                  <Text className="mt-3 text-xs font-bold text-brand-mid">{item.action || "Open"}{item.duration ? ` · ${item.duration}` : ""} →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        );
      }}
    </ResourceScreen>
  );
}
