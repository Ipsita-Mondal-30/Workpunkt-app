const fs = require("fs");
const path = require("path");

const appJson = require("./app.json");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const values = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key) values[key] = value;
  }

  return values;
}

module.exports = ({ config }) => {
  const env = loadDotEnv(path.join(__dirname, ".env"));

  const apiUrl = (env.EXPO_PUBLIC_API_URL ?? "https://www.workpunkt.com").replace(
    /\/$/,
    "",
  );
  const signupUrl = (
    env.EXPO_PUBLIC_SIGNUP_URL ?? `${apiUrl}/login`
  ).replace(/([^:]\/)\/+/g, "$1");

  // Mirror into process.env so Metro inlines EXPO_PUBLIC_* on every config reload.
  process.env.EXPO_PUBLIC_API_URL = apiUrl;
  process.env.EXPO_PUBLIC_SIGNUP_URL = signupUrl;
  if (env.EXPO_PUBLIC_SUPABASE_URL) {
    process.env.EXPO_PUBLIC_SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL;
  }
  if (env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[app.config] EXPO_PUBLIC_API_URL=${apiUrl}`);
  }

  return {
    ...appJson.expo,
    ...config,
    extra: {
      ...appJson.expo.extra,
      ...config?.extra,
      apiUrl,
      signupUrl,
    },
  };
};
