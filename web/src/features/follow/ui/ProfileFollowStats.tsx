"use client";

import { useTranslations } from "@/shared/i18n";
import { useFollowStatusQuery } from "../model/use-follow-status-query";

type ProfileFollowStatsProps = {
  userId: string;
};

export function ProfileFollowStats({ userId }: ProfileFollowStatsProps) {
  const t = useTranslations().follows;
  const followStatusQuery = useFollowStatusQuery(userId);
  const status = followStatusQuery.data;

  if (!status) {
    return null;
  }

  return (
    <span>
      {t.followerCount.replace("{count}", String(status.followerCount))}
    </span>
  );
}
