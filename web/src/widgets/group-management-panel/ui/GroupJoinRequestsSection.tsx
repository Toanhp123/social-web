"use client";

import { UserPlus } from "lucide-react";
import type { GroupJoinRequest } from "@/entities/group";
import { Avatar, Button } from "@/shared/ui";

type GroupJoinRequestsSectionProps = {
  requests: GroupJoinRequest[];
  isLoading: boolean;
  isApprovePending: (requestId: string) => boolean;
  isRejectPending: (requestId: string) => boolean;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  t: {
    joinRequests: string;
    loadingRequests: string;
    noPendingRequests: string;
    requesterFallback: string;
    accept: string;
    decline: string;
  };
};

export function GroupJoinRequestsSection({
  requests,
  isLoading,
  isApprovePending,
  isRejectPending,
  onApprove,
  onReject,
  t,
}: GroupJoinRequestsSectionProps) {
  return (
    <section className="rounded-card border-surface-border bg-surface border p-4">
      <h3 className="text-primary flex items-center gap-2 text-sm font-semibold">
        <UserPlus className="size-4" />
        {t.joinRequests}
      </h3>

      {isLoading ? (
        <p className="text-muted mt-3 text-sm">{t.loadingRequests}</p>
      ) : requests.length === 0 ? (
        <p className="text-muted mt-3 text-sm">{t.noPendingRequests}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {requests.map((request) => {
            const requester = request.requester;
            const isReviewing =
              isApprovePending(request.id) || isRejectPending(request.id);

            return (
              <div
                key={request.id}
                className="border-soft flex flex-col gap-3 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar
                    src={requester?.avatarUrl}
                    name={requester?.fullName ?? request.requesterId}
                    alt={requester?.fullName ?? t.requesterFallback}
                    size={40}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-primary truncate text-sm font-medium">
                      {requester?.fullName ?? request.requesterId}
                    </p>
                    {requester?.username && (
                      <p className="text-muted truncate text-xs">
                        @{requester.username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    fullWidth={false}
                    disabled={isReviewing}
                    onClick={() => onApprove(request.id)}
                  >
                    {t.accept}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    fullWidth={false}
                    disabled={isReviewing}
                    onClick={() => onReject(request.id)}
                  >
                    {t.decline}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
