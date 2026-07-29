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
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { Appearance } from "react-native";

export type ThemePreference = "light" | "dark";

export const THEME_STORAGE_KEY = "workpunkt-theme";

type ThemeContextValue = {
  theme: ThemePreference;
  isDark: boolean;
  ready: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): ThemePreference {
  const system = Appearance.getColorScheme();
  return system === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme, setThemeState] = useState<ThemePreference>(resolveInitialTheme);
  const [ready, setReady] = useState(false);

  const applyTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      setColorScheme(next);
    },
    [setColorScheme],
  );

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) return;
        if (stored === "dark" || stored === "light") {
          applyTheme(stored);
        } else {
          applyTheme(resolveInitialTheme());
        }
      } catch (error) {
        console.error("[theme] failed to load preference", error);
        applyTheme(resolveInitialTheme());
      } finally {
        if (mounted) setReady(true);
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
        console.log("[theme] saved", next);
      } catch (error) {
        console.error("[theme] failed to save preference", error);
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      ready,
      setTheme,
      toggleTheme,
    }),
    [theme, ready, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
