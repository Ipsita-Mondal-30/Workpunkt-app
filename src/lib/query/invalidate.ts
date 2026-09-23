import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

/** Invalidate every query whose key starts with the given prefix. */
export async function invalidatePrefix(
  client: QueryClient,
  prefix: QueryKey,
): Promise<void> {
  await client.invalidateQueries({ queryKey: prefix });
}

/** Drop all cached API data (sign-out / account switch). */
export function clearAppQueryCache(client: QueryClient): void {
  client.clear();
}

/** After admin mutations that change pipeline volume / attention. */
export async function invalidateAdminWorkspace(client: QueryClient): Promise<void> {
  await Promise.all([
    invalidatePrefix(client, queryKeys.scopes.admin()),
  ]);
}

/** After partner/counsellor student or training changes. */
export async function invalidateAgentWorkspace(client: QueryClient): Promise<void> {
  await Promise.all([
    invalidatePrefix(client, queryKeys.scopes.agent()),
    invalidatePrefix(client, queryKeys.scopes.counsellor()),
  ]);
}
