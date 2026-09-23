import { useState } from "react";
import { Pressable, View } from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KlaraChatSheet } from "@/components/klara/klara-chat-sheet";
import { KlaraAvatar } from "@/components/shared/klara-avatar";
import type { AppRole } from "@/lib/auth/resolve-role";
import { useThemeColors } from "@/lib/theme/theme-context";

type KlaraFabProps = {
  role: AppRole;
};

/**
 * Floating Klara button — dark-theme plate + full Klara avatar.
 */
export function KlaraFab({ role }: KlaraFabProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const onKlaraRoute = Boolean(pathname?.includes("/klara"));
  if (onKlaraRoute) {
    return null;
  }

  const aiOnly = role === "admin";
  const bottomOffset = Math.max(insets.bottom, 12) + (role === "counsellor" ? 78 : 16);

  return (
    <>
      {!open ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            right: 16,
            bottom: bottomOffset,
            zIndex: 50,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open chat"
            onPress={() => setOpen(true)}
            style={({ pressed }) => ({
              height: 60,
              width: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: 0,
              backgroundColor: colors.surface,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
              borderWidth: 2,
              borderColor: colors.border,
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <KlaraAvatar size={60} alt="" />
          </Pressable>
        </View>
      ) : null}

      <KlaraChatSheet
        visible={open}
        onClose={() => setOpen(false)}
        role={role}
        aiOnly={aiOnly}
      />
    </>
  );
}
