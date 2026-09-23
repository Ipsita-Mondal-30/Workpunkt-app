import { ScrollView, Text, View, useWindowDimensions } from "react-native";

import { useTheme } from "@/lib/theme/theme-context";

const COLOR_BAR = {
  purple: "#ad46ff",
  pink: "#f6339a",
  blue: "#0284c7",
  green: "#16a34a",
} as const;

export type StatCard = {
  id: string;
  value: string;
  label: string;
  sub?: string;
  color?: keyof typeof COLOR_BAR;
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
<<<<<<< HEAD
  const { isDark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const textColor = isDark ? "#ffffff" : "#0e0b11";
  const mutedColor = isDark ? "#a1a1aa" : "#71717a";
  const surfaceBg = isDark ? "#18151c" : "#ffffff";
  const borderColor = isDark ? "#2e2a33" : "#e4e4e7";

  if (!stats.length) return null;

  function renderCard(stat: StatCard, width?: number) {
    return (
      <View
        key={stat.id}
        style={{
          width,
          flexGrow: width == null ? 1 : 0,
          flexShrink: width == null ? 1 : 0,
          minWidth: width == null ? 140 : undefined,
          borderRadius: 16,
          borderWidth: 1,
          borderColor,
          backgroundColor: surfaceBg,
          paddingHorizontal: 16,
          paddingVertical: 20,
        }}
      >
        <View
          style={{
            marginBottom: 16,
            height: 4,
            width: 28,
            borderRadius: 999,
            backgroundColor: COLOR_BAR[stat.color ?? "purple"],
          }}
        />
        <Text style={{ fontSize: 24, fontWeight: "700", color: textColor, letterSpacing: -0.3 }}>
          {stat.value}
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "600", color: textColor }}>
          {stat.label}
        </Text>
        {stat.sub ? (
          <Text style={{ marginTop: 4, fontSize: 12, color: mutedColor }}>{stat.sub}</Text>
        ) : null}
      </View>
    );
  }

  if (!scrollable) {
    return (
      <View style={{ marginBottom: 24, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {stats.map((stat) => renderCard(stat))}
=======
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
>>>>>>> c6ee1f8a7e590413977de4e7294a973f477b3d10
      </View>
    );
  }

  const cardWidth = Math.max(148, windowWidth - PAGE_GUTTER - NEXT_PEEK);

  return (
<<<<<<< HEAD
    <View style={{ marginBottom: 24, marginHorizontal: -PAGE_GUTTER }}>
=======
    <View className="mb-6" style={{ marginHorizontal: -PAGE_GUTTER }}>
>>>>>>> c6ee1f8a7e590413977de4e7294a973f477b3d10
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
<<<<<<< HEAD
        {stats.map((stat) => renderCard(stat, cardWidth))}
=======
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
>>>>>>> c6ee1f8a7e590413977de4e7294a973f477b3d10
      </ScrollView>
    </View>
  );
}
