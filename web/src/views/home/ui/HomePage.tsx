import { HomePageContent } from "./HomePageContent";
import { getCurrentSessionUserOrNull } from "../server/server";

export async function HomePage() {
  const currentUser = await getCurrentSessionUserOrNull();

  return <HomePageContent currentUser={currentUser} />;
}

