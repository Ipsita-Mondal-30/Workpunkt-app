/**
 * Shared React Query cache budgets for the mobile app.
 * Heavy Airtable-backed admin/partner payloads stay fresh longer;
 * live inboxes/notifications refresh sooner.
 */
export const CACHE_MS = {
  /** Near-realtime (inbox / unread badges). */
  live: 30_000,
  /** Default screen data. */
  standard: 2 * 60_000,
  /** Expensive admin / catalog payloads. */
  heavy: 5 * 60_000,
  /** How long unused cache entries stay in memory. */
  gc: 45 * 60_000,
} as const;

export type CachePolicy = keyof Omit<typeof CACHE_MS, "gc">;

export type CacheQueryOptions = {
  staleTime: number;
  gcTime: number;
  refetchOnMount: boolean;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  retry: number;
};

export function cacheOptions(policy: CachePolicy = "standard"): CacheQueryOptions {
  return {
    staleTime: CACHE_MS[policy],
    gcTime: CACHE_MS.gc,
    // Only refetch when data is actually stale (RQ default), not on every focus.
    refetchOnMount: true,
    refetchOnWindowFocus: policy === "live",
    refetchOnReconnect: true,
    retry: 1,
  };
}
