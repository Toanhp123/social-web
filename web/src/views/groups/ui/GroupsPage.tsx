"use client";

import { AppLayout } from "@/widgets/app-layout";
import { GroupsOverview } from "@/widgets/groups-overview";

export function GroupsPage() {
  return (
    <AppLayout
      title="Groups"
      description="Discover communities, join discussions and create group posts."
    >
      <GroupsOverview />
    </AppLayout>
  );
}
