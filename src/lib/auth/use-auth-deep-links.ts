import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

import { parseAuthLinkUrl } from "@/lib/auth/deep-link";

/**
 * Routes Universal Links / App Links / custom scheme into auth screens.
 */
export function useAuthDeepLinks() {
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url || handled.current === url) return;
      const parsed = parseAuthLinkUrl(url);
      if (parsed.kind === "unknown") return;

      handled.current = url;

      if (parsed.kind === "email-link") {
        router.push({
          pathname: "/(auth)/email-link",
          params: {
            token_hash: parsed.tokenHash ?? "",
            type: parsed.type ?? "",
            next: parsed.next ?? "",
          },
        });
        return;
      }

      if (parsed.kind === "confirm") {
        router.push({
          pathname: "/(auth)/confirm",
          params: {
            token_hash: parsed.tokenHash ?? "",
            type: parsed.type ?? "",
            next: parsed.next ?? "",
          },
        });
        return;
      }

      if (parsed.kind === "activate") {
        router.push({
          pathname: "/(auth)/activate",
          params: { token: parsed.token ?? "" },
        });
      }
    }

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener("url", (event) => handleUrl(event.url));
    return () => sub.remove();
  }, [router]);
}
