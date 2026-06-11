import { notFound, redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/entities/session/lib/current-session-user.server";
import { ProfileFriendRequestButton } from "@/features/friend-request";
import { ProfileFollowButton, ProfileFollowStats } from "@/features/follow";
import { ROUTES } from "@/shared/config/routes";
import { getCurrentProfileOrNull, getUserOrNull } from "../server/server";
import { ProfilePageContent } from "./ProfilePageContent";

type UserProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export async function UserProfilePage({ params }: UserProfilePageProps) {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect(ROUTES.login);
  }

  const { userId } = await params;

  if (userId === currentUser.id) {
    redirect(ROUTES.profile);
  }

  const [profile, profileOwner] = await Promise.all([
    getCurrentProfileOrNull(userId),
    getUserOrNull(userId),
  ]);

  if (!profileOwner) {
    notFound();
  }

  return (
    <ProfilePageContent
      profile={profile}
      currentUser={currentUser}
      profileOwner={profileOwner}
      profileStats={<ProfileFollowStats userId={userId} />}
      canEdit={false}
      showLogout={false}
      headerActions={
        <>
          <ProfileFollowButton userId={userId} />
          <ProfileFriendRequestButton receiverId={userId} />
        </>
      }
    />
  );
}
