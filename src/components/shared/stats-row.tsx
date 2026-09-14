import { Text, View } from "react-native";

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

export function StatsRow({ stats }: { stats: StatCard[] }) {
  if (!stats.length) return null;

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
