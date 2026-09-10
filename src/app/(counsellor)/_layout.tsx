import { Slot, Redirect } from "expo-router";

import { RoleShell } from "@/components/layout/role-shell";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";
import { CounsellorProvider } from "@/lib/counsellor/use-counsellor-context";

export default function CounsellorLayout() {
  const { loading, session, role, homePath } = useAuth();

  if (loading) return <WorkpunktLoader />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (role !== "counsellor") return <Redirect href={homePath as never} />;

  return (
    <CounsellorProvider>
      <RoleShell role="counsellor" title="Counsellor">
        <Slot />
      </RoleShell>
    </CounsellorProvider>
  );
}
