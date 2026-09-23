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
      </View>
    );
  }

  const cardWidth = Math.max(148, windowWidth - PAGE_GUTTER - NEXT_PEEK);

  return (
    <View style={{ marginBottom: 24, marginHorizontal: -PAGE_GUTTER }}>
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
        {stats.map((stat) => renderCard(stat, cardWidth))}
      </ScrollView>
    </View>
  );
}
