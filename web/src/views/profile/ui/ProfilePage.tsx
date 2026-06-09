import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/entities/session/lib/current-session-user.server";
import { ROUTES } from "@/shared/config/routes";
import { getCurrentProfileOrNull } from "../server/server";
import { ProfilePageContent } from "./ProfilePageContent";

export async function ProfilePage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect(ROUTES.login);
  }

  const profile = await getCurrentProfileOrNull(currentUser.id);

  return <ProfilePageContent profile={profile} currentUser={currentUser} />;
}
