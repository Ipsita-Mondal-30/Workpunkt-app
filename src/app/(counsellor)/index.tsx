import { Redirect } from "expo-router";

/** Legacy home → tabs dashboard (website-parity IA). */
export default function CounsellorHomeRedirect() {
  return <Redirect href="/(counsellor)/(tabs)" />;
}
