import { Modal, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { GradientButton } from "@/components/shared/gradient-button";
import { useThemeColors } from "@/lib/theme/theme-context";
import {
  registerAppAlertPresenter,
  type AppAlertButton,
  type AppAlertOptions,
} from "@/lib/ui/app-alert";

export function AppAlertHost() {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AppAlertOptions | null>(null);

  const close = useCallback(() => {
    setVisible(false);
    setOptions(null);
  }, []);

  useEffect(() => {
    return registerAppAlertPresenter((next) => {
      setOptions(next);
      setVisible(true);
    });
  }, []);

  async function handlePress(button: AppAlertButton) {
    close();
    await button.onPress?.();
  }

  if (!options) return null;

  const buttons =
    options.buttons && options.buttons.length > 0
      ? options.buttons
      : [{ text: "OK", style: "default" as const }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.2,
            }}
          >
            {options.title}
          </Text>
          {options.message ? (
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 21,
                color: colors.muted,
              }}
            >
              {options.message}
            </Text>
          ) : null}

          <View style={{ marginTop: 20, gap: 10 }}>
            {buttons.map((button, index) => {
              const key = `${button.text}-${index}`;
              if (button.style === "cancel" || button.style === "destructive") {
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    onPress={() => void handlePress(button)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      minHeight: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        button.style === "destructive"
                          ? "rgba(220,38,38,0.45)"
                          : colors.border,
                      backgroundColor:
                        button.style === "destructive"
                          ? "rgba(220,38,38,0.12)"
                          : "transparent",
                      paddingHorizontal: 16,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color:
                          button.style === "destructive" ? colors.error : colors.text,
                      }}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              }

              return (
                <GradientButton
                  key={key}
                  text={button.text}
                  onPress={() => void handlePress(button)}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
