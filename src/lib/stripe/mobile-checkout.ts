import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { getApiBaseUrl } from "@/lib/config/public-env";
import { authFetch } from "@/lib/api/auth-fetch";
import type { CheckoutProductType } from "@/lib/api/counsellor-types";

const checkoutReturnPath = "checkout-return";

function apiBase(): string {
  return getApiBaseUrl();
}

function checkoutReturnUrl(): string {
  return Linking.createURL(checkoutReturnPath);
}

export async function startMobileCheckout(
  productType: CheckoutProductType,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const returnUrl = checkoutReturnUrl();
    const response = await authFetch("/api/checkout/create-session", {
      method: "POST",
      body: JSON.stringify({
        product_type: productType,
        success_url: `${returnUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}?status=cancel`,
      }),
    });

    const json = (await response.json()) as {
      url?: string;
      error?: string;
      data?: { url?: string };
    };

    if (!response.ok) {
      return { ok: false, error: json.error ?? "Could not start checkout." };
    }

    const checkoutUrl = json.url ?? json.data?.url;
    if (!checkoutUrl) {
      return { ok: false, error: "No checkout URL returned." };
    }

    const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);

    if (result.type !== "success" || !result.url) {
      return { ok: false, error: "Checkout was cancelled." };
    }

    const parsed = Linking.parse(result.url);
    const sessionId =
      typeof parsed.queryParams?.session_id === "string"
        ? parsed.queryParams.session_id
        : null;

    const syncResponse = await authFetch("/api/checkout/sync", {
      method: "POST",
      body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
    });

    if (!syncResponse.ok) {
      const syncJson = (await syncResponse.json()) as { error?: string; detail?: string };
      return {
        ok: false,
        error:
          syncJson.detail ??
          syncJson.error ??
          "Payment sync failed. If Stripe charged you, pull to refresh or reopen the app.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Checkout failed.",
    };
  }
}

export function counsellorAccessPriceLabel(): string {
  return "₹5,000";
}

export function careerPathingPriceLabel(): string {
  return "€2,999/yr";
}

export function careerPathingTopupLabel(): string {
  return "€999";
}

export { apiBase };
