export type ThemePreference = "light" | "dark";

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceEnd: string;
  text: string;
  muted: string;
  border: string;
  placeholder: string;
  inputBg: string;
  panelBg: string;
  panelBorder: string;
  ink: string;
  brandStart: string;
  brandMid: string;
  brandEnd: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  heroGradient: [string, string, string];
  pageGradient: [string, string, string];
};

const LIGHT: ThemeColors = {
  bg: "#ffffff",
  surface: "#ffffff",
  surfaceEnd: "#f4f4f5",
  text: "#0e0b11",
  muted: "#71717a",
  border: "#e4e4e7",
  placeholder: "#71717a",
  inputBg: "#ffffff",
  panelBg: "#ffffff",
  panelBorder: "rgba(228,228,231,0.95)",
  ink: "#514957",
  brandStart: "#ad46ff",
  brandMid: "#f6339a",
  brandEnd: "#ff6900",
  error: "#dc2626",
  success: "#16a34a",
  warning: "#d97706",
  info: "#0284c7",
  overlay: "rgba(0,0,0,0.55)",
  heroGradient: ["#f0e5ff", "#ffe8f3", "#fff0df"],
  pageGradient: ["#faf7ff", "#fffafb", "#ffffff"],
};

const DARK: ThemeColors = {
  bg: "#09090b",
  surface: "#18151c",
  surfaceEnd: "#1f1b24",
  text: "#ffffff",
  muted: "#a1a1aa",
  border: "rgba(255,255,255,0.12)",
  placeholder: "#a1a1aa",
  inputBg: "rgba(255,255,255,0.04)",
  panelBg: "rgba(9,9,11,0.92)",
  panelBorder: "rgba(255,255,255,0.08)",
  ink: "#e4e4e7",
  brandStart: "#ad46ff",
  brandMid: "#f6339a",
  brandEnd: "#ff6900",
  error: "#dc2626",
  success: "#16a34a",
  warning: "#d97706",
  info: "#0284c7",
  overlay: "rgba(0,0,0,0.72)",
  heroGradient: ["#291637", "#32172d", "#301d19"],
  pageGradient: ["#15101d", "#09090b", "#120e14"],
};

export function getThemeColors(theme: ThemePreference | boolean): ThemeColors {
  const isDark = typeof theme === "boolean" ? theme : theme === "dark";
  return isDark ? DARK : LIGHT;
}

/** CSS custom properties for NativeWind `bg-bg` / `text-text` / etc. */
export function getThemeCssVars(colors: ThemeColors): Record<`--${string}`, string> {
  return {
    "--color-bg": colors.bg,
    "--color-surface": colors.surface,
    "--color-surface-end": colors.surfaceEnd,
    "--color-border": colors.border,
    "--color-muted": colors.muted,
    "--color-text": colors.text,
  };
}
