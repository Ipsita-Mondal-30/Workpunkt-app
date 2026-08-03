import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

const COLOR_MAP = {
  purple: "bg-brand-start/15 text-brand-start",
  pink: "bg-brand-mid/15 text-brand-mid",
  blue: "bg-info/15 text-info",
  green: "bg-success/15 text-success",
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
    <View className="mb-4 flex-row flex-wrap gap-2">
      {stats.map((stat) => (
        <View
          key={stat.id}
          className={cn(
            "min-w-[46%] flex-1 rounded-2xl border border-border px-3 py-3",
            COLOR_MAP[stat.color ?? "purple"].split(" ")[0],
          )}
        >
          <Text className="text-xl font-bold text-text">{stat.value}</Text>
          <Text className="mt-1 text-xs font-semibold text-text">{stat.label}</Text>
          {stat.sub ? <Text className="mt-1 text-xs text-muted">{stat.sub}</Text> : null}
        </View>
      ))}
    </View>
  );
}
