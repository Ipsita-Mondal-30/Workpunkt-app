import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { cn } from "@/lib/utils";

export type WorkpunktLogoProps = {
  fontSize?: number;
  className?: string;
};

function TrademarkIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="#b754c0">
      <Path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Zm36-128H92a8 8 0 0 0 0 16h28v80a8 8 0 0 0 16 0V104h28a8 8 0 0 0 0-16Z" />
    </Svg>
  );
}

export function WorkpunktLogo({ fontSize = 40, className }: WorkpunktLogoProps) {
  const tmSize = fontSize * 0.52;

  return (
    <View
      accessibilityLabel="workpunkt"
      className={cn("flex-row items-end", className)}
      style={{ height: fontSize * 1.2 }}
    >
      <Text
        className="font-bold lowercase tracking-tight text-logo-start"
        style={{ fontSize }}
      >
        workpunk
      </Text>
      <View className="relative flex-row items-end">
        <View
          className="absolute z-10"
          style={{ top: -fontSize * 0.4, right: -fontSize * 0.22 }}
        >
          {/* <TrademarkIcon size={tmSize} /> */}
        </View>
        <Text
          className="font-bold lowercase tracking-tight text-logo-end"
          style={{ fontSize }}
        >
          t
        </Text>
        <View
          className="ml-1 rounded-full bg-logo-dot"
          style={{
            width: fontSize * 0.3,
            height: fontSize * 0.3,
            marginBottom: fontSize * 0.08,
          }}
        />
      </View>
    </View>
  );
}
