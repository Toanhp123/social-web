"use client";

import { Check, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { useFollowStatusQuery } from "../model/use-follow-status-query";
import { useFollowUserMutation } from "../model/use-follow-user-mutation";
import { useUnfollowUserMutation } from "../model/use-unfollow-user-mutation";

type ProfileFollowButtonProps = {
  userId: string;
};

export function ProfileFollowButton({ userId }: ProfileFollowButtonProps) {
  const t = useTranslations().follows;
  const followStatusQuery = useFollowStatusQuery(userId);
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnfollowUserMutation();

  const status = followStatusQuery.data;
  const isFollowing = Boolean(status?.isFollowing);
  const isPending =
    followStatusQuery.isLoading ||
    followUserMutation.isPending ||
    unfollowUserMutation.isPending;
  const error =
    followStatusQuery.error ??
    followUserMutation.error ??
    unfollowUserMutation.error;

  const handleClick = () => {
    if (isFollowing) {
      unfollowUserMutation.mutate({ userId });
      return;
    }

    followUserMutation.mutate({ userId });
  };

  const Icon = isPending ? Loader2 : isFollowing ? Check : UserPlus;

  return (
    <div className="min-w-36">
      <Button
        type="button"
        fullWidth={false}
        variant={isFollowing ? "secondary" : "primary"}
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2"
      >
        <Icon className={isPending ? "size-4 animate-spin" : "size-4"} />
        {isPending
          ? t.loading
          : isFollowing
            ? t.following
            : t.follow}
      </Button>

      {status && (
        <p className="text-muted mt-1 text-xs">
          {t.followerCount.replace("{count}", String(status.followerCount))}
        </p>
      )}

      {error && <p className="text-danger mt-1 text-xs">{error.message}</p>}
    </div>
  );
}
