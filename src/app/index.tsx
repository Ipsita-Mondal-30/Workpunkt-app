import { Redirect } from "expo-router";

import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";

export default function Index() {
  const { loading, session, homePath } = useAuth();

  if (loading) {
    return <WorkpunktLoader />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={homePath as never} />;
}
