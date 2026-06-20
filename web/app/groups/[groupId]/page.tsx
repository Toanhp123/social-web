import { GroupDetailPage } from "@/views/group-detail";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { groupId } = await params;

  return <GroupDetailPage groupId={groupId} />;
}
