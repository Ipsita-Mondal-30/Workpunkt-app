import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { useColorScheme as useNativeWindColorScheme, vars } from "nativewind";

import { bootError, bootLog, bootWarn } from "@/lib/debug/boot-log";
import {
  getThemeColors,
  getThemeCssVars,
  type ThemeColors,
  type ThemePreference,
} from "@/lib/theme/theme-colors";

export type { ThemePreference } from "@/lib/theme/theme-colors";

export const THEME_STORAGE_KEY = "workpunkt-theme";

/**
 * Appearance toggle stays hidden in Settings for now.
 * While hidden, the app always boots into dark mode.
 */
export const FORCE_DARK_DEFAULT = true;

type ThemeContextValue = {
  theme: ThemePreference;
  isDark: boolean;
  ready: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): ThemePreference {
  return FORCE_DARK_DEFAULT ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme, setThemeState] = useState<ThemePreference>(resolveInitialTheme);
  const [ready, setReady] = useState(false);

  const applyTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      setColorScheme(next);
      bootLog("theme:applied", { theme: next });
    },
    [setColorScheme],
  );

  useEffect(() => {
    let mounted = true;
    bootLog("theme:load-start");

    void (async () => {
      try {
        if (FORCE_DARK_DEFAULT) {
          applyTheme("dark");
          try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, "dark");
          } catch (error) {
            bootWarn("theme:force-dark-persist-failed", error);
          }
          bootLog("theme:load-ok", { forcedDark: true });
          return;
        }

        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) return;
        if (stored === "dark" || stored === "light") {
          applyTheme(stored);
        } else {
          applyTheme(resolveInitialTheme());
        }
        bootLog("theme:load-ok", { stored });
      } catch (error) {
        bootWarn("theme:load-failed — falling back to dark", error);
        applyTheme("dark");
      } finally {
        if (mounted) {
          setReady(true);
          bootLog("theme:ready");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [applyTheme]);

  const setTheme = useCallback(
    async (next: ThemePreference) => {
      applyTheme(next);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
        bootLog("theme:saved", { theme: next });
      } catch (error) {
        bootError("theme:save-failed", error);
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const colors = useMemo(() => getThemeColors(theme), [theme]);
  const themeVars = useMemo(() => vars(getThemeCssVars(colors)), [colors]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      ready,
      colors,
      setTheme,
      toggleTheme,
    }),
    [theme, ready, colors, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/** Convenience hook for semantic palette values. */
export function useThemeColors(): ThemeColors {
  return useTheme().colors;
}
