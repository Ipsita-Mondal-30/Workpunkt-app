import { Redirect, useLocalSearchParams } from "expo-router";

export default function RedirectRoadmapDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Redirect
      href={{
        pathname: "/(counsellor)/(tabs)/more/roadmaps/[id]",
        params: { id: id ?? "" },
      }}
    />
  );
}
