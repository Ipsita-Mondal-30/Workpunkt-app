import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

export type WorkpunktLogoProps = {
  fontSize?: number;
  className?: string;
};

/** Hardcoded brand stops — NativeWind `text-logo-*` classes are unreliable on RN. */
const LOGO_START = "#fb575d";
const LOGO_END = "#b754c0";
const LOGO_DOT = "#ff3131";

export function WorkpunktLogo({ fontSize = 40, className }: WorkpunktLogoProps) {
  return (
    <View
      accessibilityLabel="workpunkt"
      className={cn("flex-row items-end", className)}
      style={{ height: fontSize * 1.2 }}
    >
      <Text
        className="font-bold lowercase tracking-tight"
        style={{ fontSize, color: LOGO_START }}
      >
        workpunk
      </Text>
      <View className="relative flex-row items-end">
        <Text
          className="font-bold lowercase tracking-tight"
          style={{ fontSize, color: LOGO_END }}
        >
          t
        </Text>
        <View
          className="ml-1 rounded-full"
          style={{
            width: fontSize * 0.3,
            height: fontSize * 0.3,
            marginBottom: fontSize * 0.08,
            backgroundColor: LOGO_DOT,
          }}
        />
      </View>
    </View>
  );
}
