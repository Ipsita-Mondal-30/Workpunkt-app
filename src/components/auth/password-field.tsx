import { forwardRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type PasswordFieldProps = Omit<TextInputProps, "secureTextEntry"> & {
  label?: string;
  isDark?: boolean;
  inputStyle?: StyleProp<TextStyle>;
};

function EyeIcon({ open, color }: { open: boolean; color: string }) {
  // Lucide-style eye / eye-off paths
  if (open) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
        <Path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.1M6.1 6.1C3.9 7.7 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(
  function PasswordField(
    { label, isDark = false, style, inputStyle, className, ...props },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const mutedColor = isDark ? "#a1a1aa" : "#71717a";

    return (
      <View style={{ gap: 6 }}>
        {label ? (
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: mutedColor,
            }}
          >
            {label}
          </Text>
        ) : null}
        <View style={{ position: "relative", justifyContent: "center" }}>
          <TextInput
            {...props}
            ref={ref}
            className={className}
            secureTextEntry={!showPassword}
            autoCapitalize={props.autoCapitalize ?? "none"}
            autoCorrect={props.autoCorrect ?? false}
            style={[
              {
                paddingRight: 48,
              },
              style,
              inputStyle,
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            hitSlop={10}
            onPress={() => setShowPassword((current) => !current)}
            style={{
              position: "absolute",
              right: 4,
              top: 0,
              bottom: 0,
              width: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EyeIcon open={showPassword} color="#ba43ed" />
          </Pressable>
        </View>
      </View>
    );
  },
);
