import { Image, type ImageStyle, type StyleProp, View } from "react-native";

const KLARA_AVATAR = require("../../../assets/klara-avatar.png");

type KlaraAvatarProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  alt?: string;
};

/**
 * Shared Klara identity mark — matches website `/klara-avatar.png`
 * (FAB, chat header, assistant bubbles).
 */
export function KlaraAvatar({ size = 36, style, alt = "Klara" }: KlaraAvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={alt}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <Image
        source={KLARA_AVATAR}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
