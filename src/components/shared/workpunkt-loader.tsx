import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { useThemeColors } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

export type WorkpunktLoaderProps = {
  fontSize?: number;
  className?: string;
  centered?: boolean;
  label?: string;
};

export function WorkpunktLoader({
  fontSize = 40,
  className,
  centered = true,
  label = "Loading",
}: WorkpunktLoaderProps) {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      className={cn(centered && "flex-1 items-center justify-center", className)}
      style={centered ? { backgroundColor: colors.bg } : undefined}
    >
      <Animated.View style={{ opacity }}>
        <WorkpunktLogo fontSize={fontSize} />
      </Animated.View>
    </View>
  );
}
