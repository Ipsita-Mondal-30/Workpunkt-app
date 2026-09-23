import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import type { CareerPathingBundle, CareerPathingBundleResult } from "@/lib/counsellor/types";

export function useCareerPathingBundle() {
  const query = useApiQuery<CareerPathingBundleResult>(
    queryKeys.agentCareerPathing(),
    "/api/agent/career-pathing",
    { cachePolicy: "heavy" },
  );

  const bundle = query.data?.ok === true ? (query.data as CareerPathingBundle) : null;
  const bundleError =
    query.data?.ok === false ? query.data.error : query.error?.message ?? null;
  const planActive = bundle?.planActive ?? false;

  return {
    ...query,
    bundle,
    bundleError,
    planActive,
  };
}
