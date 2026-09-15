import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
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
        style={{
          minHeight: 52,
          borderRadius: 9999,
          paddingHorizontal: 24,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {children ?? text}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
