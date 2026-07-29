import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { cn } from "@/lib/utils";

export type GradientButtonProps = Omit<PressableProps, "children"> & {
  text?: string;
  children?: ReactNode;
  loading?: boolean;
  className?: string;
};

export function GradientButton({
  text,
  children,
  loading = false,
  disabled,
  className,
  ...props
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn("w-full overflow-hidden rounded-full", className)}
      style={({ pressed }) => [
        {
          opacity: isDisabled ? 0.6 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          shadowColor: "#f6339a",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        },
      ]}
      {...props}
    >
      <LinearGradient
        colors={["#ad46ff", "#f6339a", "#ff6900"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="items-center justify-center px-6 py-4"
        style={{ borderRadius: 9999, minHeight: 52 }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-center text-base font-semibold text-white">
            {children ?? text}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
