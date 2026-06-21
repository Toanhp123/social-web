import { Lock } from "lucide-react";
import type { Group } from "@/entities/group";
import { CreatePostComposer } from "@/features/create-post";
import { PostFeed } from "@/widgets/post-feed";
import type { GroupMessages } from "./group-panel.types";

type GroupDiscussionProps = {
  group: Group;
  isMember: boolean;
  canInteract: boolean;
  canViewFeed: boolean;
  t: GroupMessages;
};

export function GroupDiscussion({
  group,
  isMember,
  canInteract,
  canViewFeed,
  t,
}: GroupDiscussionProps) {
  return (
    <div className="space-y-4">
      {isMember && <CreatePostComposer groupId={group.id} />}

      {canViewFeed ? (
        <PostFeed
          canInteract={canInteract}
          groupId={group.id}
          emptyTitle={t.detail.emptyPostsTitle}
          emptyDescription={t.detail.emptyPostsDescription}
        />
      ) : (
        <section className="rounded-card border-surface-border bg-surface-elevated shadow-card border p-6 text-center">
          <Lock className="text-muted mx-auto size-7" />
          <h2 className="text-primary mt-3 font-semibold">
            {t.detail.privateFeedTitle}
          </h2>
          <p className="text-muted mt-1 text-sm leading-6">
            {t.detail.privateFeedDescription}
          </p>
        </section>
      )}
    </div>
  );
}
