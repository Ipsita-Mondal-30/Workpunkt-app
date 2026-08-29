import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

type CheckboxRowProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
};

export function CheckboxRow({ checked, onToggle, label, disabled }: CheckboxRowProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className={cn(
        "flex-row items-start gap-3 rounded-xl border px-3 py-3",
        checked ? "border-brand-mid bg-brand-mid/15" : "border-border bg-surface",
      )}
    >
      <View
        className={cn(
          "mt-0.5 h-5 w-5 items-center justify-center rounded border",
          checked ? "border-brand-mid bg-brand-mid" : "border-border bg-surface",
        )}
      >
        {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
      </View>
      <Text className="flex-1 text-sm leading-5 text-text">{label}</Text>
    </Pressable>
  );
}
