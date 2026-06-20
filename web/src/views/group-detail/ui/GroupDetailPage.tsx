import { notFound } from "next/navigation";
import { ApiError } from "@/shared/api/api-error";
import { getGroupApi } from "@/entities/group/server";
import { AppLayout } from "@/widgets/app-layout";
import { GroupPanel } from "@/widgets/group-panel";

type GroupDetailPageProps = {
  groupId: string;
};

export async function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const group = await getVisibleGroup(groupId);

  return (
    <AppLayout showPageHeader={false}>
      <GroupPanel group={group} />
    </AppLayout>
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
