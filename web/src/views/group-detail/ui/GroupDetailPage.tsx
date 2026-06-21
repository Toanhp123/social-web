import { notFound } from "next/navigation";
import { ApiError } from "@/shared/api/api-error";
import { getGroupApi } from "@/entities/group/server";
import { GroupsSectionLayout } from "@/widgets/groups-section-layout";
import { GroupAboutRail, GroupPanel } from "@/widgets/group-panel";

type GroupDetailPageProps = {
  groupId: string;
};

export async function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const group = await getVisibleGroup(groupId);

  return (
    <GroupsSectionLayout rightSidebar={<GroupAboutRail group={group} />}>
      <div className="mx-auto w-full max-w-2xl">
        <GroupPanel group={group} />
      </div>
    </GroupsSectionLayout>
  );
}

async function getVisibleGroup(groupId: string) {
  try {
    return await getGroupApi(groupId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
