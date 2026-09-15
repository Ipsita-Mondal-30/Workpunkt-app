import { ScrollView, Text, View, useWindowDimensions } from "react-native";

import { cn } from "@/lib/utils";

const COLOR_MAP = {
  purple: "bg-brand-start",
  pink: "bg-brand-mid",
  blue: "bg-info",
  green: "bg-success",
} as const;

export type StatCard = {
  id: string;
  value: string;
  label: string;
  sub?: string;
  color?: keyof typeof COLOR_MAP;
};

/** Horizontal padding used by PortalPage — keep peek math aligned. */
const PAGE_GUTTER = 20;
const CARD_GAP = 12;
/** Always leave this much of the next card visible. */
const NEXT_PEEK = 36;

export function StatsRow({
  stats,
  scrollable = false,
}: {
  stats: StatCard[];
  /** Prefer horizontal peek rail on narrow admin/home layouts. */
  scrollable?: boolean;
}) {
  const { width: windowWidth } = useWindowDimensions();

  if (!stats.length) return null;

  if (!scrollable) {
    return (
      <View className="mb-6 flex-row flex-wrap gap-3">
        {stats.map((stat) => (
          <View
            key={stat.id}
            className="min-w-[140px] flex-1 rounded-2xl border border-border bg-surface px-4 py-5"
          >
            <View className={cn("mb-4 h-1 w-7 rounded-full", COLOR_MAP[stat.color ?? "purple"])} />
            <Text className="text-2xl font-bold tracking-tight text-text">{stat.value}</Text>
            <Text className="mt-1 text-xs font-semibold text-text">{stat.label}</Text>
            {stat.sub ? <Text className="mt-1 text-xs text-muted">{stat.sub}</Text> : null}
          </View>
        ))}
      </View>
    );
  }

  const cardWidth = Math.max(148, windowWidth - PAGE_GUTTER - NEXT_PEEK);

  return (
    <View className="mb-6" style={{ marginHorizontal: -PAGE_GUTTER }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{
          paddingHorizontal: PAGE_GUTTER,
          gap: CARD_GAP,
        }}
      >
        {stats.map((stat) => (
          <View
            key={stat.id}
            style={{ width: cardWidth }}
            className="rounded-2xl border border-border bg-surface px-4 py-5"
          >
            <View className={cn("mb-4 h-1 w-7 rounded-full", COLOR_MAP[stat.color ?? "purple"])} />
            <Text className="text-2xl font-bold tracking-tight text-text">{stat.value}</Text>
            <Text className="mt-1 text-xs font-semibold text-text">{stat.label}</Text>
            {stat.sub ? <Text className="mt-1 text-xs text-muted">{stat.sub}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
