import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: string;
  title: string;
  width: number;
  render: (row: T) => ReactNode;
};

type HorizontalDataTableProps<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowPress?: (row: T) => void;
  emptyLabel?: string;
  stickyFirstColumn?: boolean;
};

export function HorizontalDataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  emptyLabel = "No rows.",
  stickyFirstColumn = true,
}: HorizontalDataTableProps<T>) {
  const minWidth = columns.reduce((sum, col) => sum + col.width, 0);

  if (rows.length === 0) {
    return (
      <View className="rounded-2xl border border-border bg-surface px-4 py-6">
        <Text className="text-sm text-muted">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator className="flex-grow-0">
      <View style={{ minWidth }} className="rounded-2xl border border-border bg-surface">
        <View className="flex-row border-b border-border bg-surface-end">
          {columns.map((col, index) => (
            <View
              key={col.key}
              style={{ width: col.width }}
              className={cn(
                "px-3 py-3",
                stickyFirstColumn && index === 0 && "bg-surface-end",
              )}
            >
              <Text className="text-xs font-semibold uppercase text-muted">
                {col.title}
              </Text>
            </View>
          ))}
        </View>

        {rows.map((row, rowIndex) => (
          <View
            key={keyExtractor(row, rowIndex)}
            className={cn(
              "flex-row border-b border-border",
              rowIndex % 2 === 1 && "bg-surface-end/40",
            )}
          >
            {columns.map((col, index) => (
              <View
                key={`${keyExtractor(row, rowIndex)}-${col.key}`}
                style={{ width: col.width }}
                className={cn("justify-center px-3 py-3", stickyFirstColumn && index === 0 && "bg-surface")}
                onTouchEnd={() => onRowPress?.(row)}
              >
                {col.render(row)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
