import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type OptionSelectProps = {
  value: string;
  placeholder: string;
  options: readonly Option[] | readonly string[];
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
};

function normalizeOptions(options: OptionSelectProps["options"]): Option[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

export function OptionSelect({
  value,
  placeholder,
  options,
  onChange,
  hasError = false,
  disabled = false,
}: OptionSelectProps) {
  const [open, setOpen] = useState(false);
  const items = normalizeOptions(options);
  const selected = items.find((item) => item.value === value);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "rounded-2xl border bg-surface px-4 py-4",
          hasError ? "border-error" : "border-border",
        )}
      >
        <Text className={cn("text-base", selected ? "text-text" : "text-muted")}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="text-lg font-semibold text-text">{placeholder}</Text>
            <Pressable
              onPress={() => setOpen(false)}
              className="rounded-xl bg-surface-end px-3 py-2"
            >
              <Text className="text-sm font-semibold text-text">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-4 py-2 pb-8">
            {items.map((item) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-xl px-3 py-3",
                    isSelected && "bg-brand-mid/15",
                  )}
                >
                  <Text className="text-base text-text">{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
