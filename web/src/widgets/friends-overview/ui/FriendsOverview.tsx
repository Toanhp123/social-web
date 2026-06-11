"use client";

import {
  FriendCandidateList,
  IncomingFriendRequestList,
  OutgoingFriendRequestList,
} from "@/features/friend-request";
import { FriendsList } from "@/features/friendship";
import { useTranslations } from "@/shared/i18n";

export function FriendsOverview() {
  const t = useTranslations().friends;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="border-subtle bg-surface shadow-card rounded-card border p-5">
        <div className="mb-4">
          <h3 className="text-primary text-base font-semibold">{t.title}</h3>
          <p className="text-muted mt-1 text-sm">{t.description}</p>
        </div>

        <FriendsList />
      </section>

      <aside className="space-y-5">
        <section className="border-subtle bg-surface shadow-card rounded-card border p-5">
          <div className="mb-4">
            <h3 className="text-primary text-base font-semibold">
              {t.discoverTitle}
            </h3>
            <p className="text-muted mt-1 text-sm">{t.discoverDescription}</p>
          </div>

          <FriendCandidateList />
        </section>

        <section className="border-subtle bg-surface shadow-card rounded-card border p-5">
          <div className="mb-4">
            <h3 className="text-primary text-base font-semibold">
              {t.incomingTitle}
            </h3>
            <p className="text-muted mt-1 text-sm">{t.incomingDescription}</p>
          </div>

          <IncomingFriendRequestList />
        </section>

        <section className="border-subtle bg-surface shadow-card rounded-card border p-5">
          <div className="mb-4">
            <h3 className="text-primary text-base font-semibold">
              {t.outgoingTitle}
            </h3>
            <p className="text-muted mt-1 text-sm">{t.outgoingDescription}</p>
          </div>

          <OutgoingFriendRequestList />
        </section>
      </aside>
    </div>
  );
}
