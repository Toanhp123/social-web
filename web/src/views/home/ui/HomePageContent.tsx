"use client";

import { CreatePostComposer } from "@/features/create-post";
import { useCurrentSession } from "@/entities/session";
import { useTranslations } from "@/shared/i18n";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";

export function HomePageContent() {
  const { currentUser } = useCurrentSession();
  const t = useTranslations().home;

  return (
    <AppLayout
      title={t.title}
      description={t.description}
      showPageHeader={false}
      contentClassName="mx-auto w-full max-w-2xl"
      reserveRightSidebar
    >
      <div className="space-y-4 sm:space-y-5">
        {currentUser && (
          <div className="hidden md:block">
            <CreatePostComposer />
          </div>
        )}

        <PostFeed canInteract={Boolean(currentUser)} />
      </div>
    </AppLayout>
  );
}
