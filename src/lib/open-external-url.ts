import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";
import {
  isValidHttpUrl,
  resolvePublicUrl,
} from "@/lib/config/public-env";
import { appAlert } from "@/lib/ui/app-alert";

/**
 * Open a website path or absolute URL in the system / in-app browser.
 */
export async function openExternalUrl(pathOrUrl: string): Promise<void> {
  const url = resolvePublicUrl(pathOrUrl);

  if (!isValidHttpUrl(url)) {
    appAlert(
      "Can't open link",
      "Set EXPO_PUBLIC_API_URL to your Workpunkt site (for example http://10.x.x.x:3001).",
    );
    return;
  }

  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.error("[openExternalUrl] WebBrowser failed", error);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }
    appAlert("Can't open link", url);
  }
}
