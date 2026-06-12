"use client";

import Link from "next/link";
import { getProfileRoute } from "@/shared/config/routes";
import { MentionText } from "@/shared/ui";
import { useMentionedUsersMap } from "../model/use-mentioned-users-map";

type LinkedMentionTextProps = {
  children: string;
  className?: string;
};

export function LinkedMentionText({
  children,
  className,
}: LinkedMentionTextProps) {
  const usersByUsername = useMentionedUsersMap(children);

  return (
    <MentionText
      className={className}
      renderMention={({ username, text }) => {
        const user = usersByUsername.get(username);

        if (!user) {
          return <span className="text-brand font-semibold">{text}</span>;
        }

        return (
          <Link
            href={getProfileRoute(user.id)}
            className="text-brand hover:text-brand-hover font-semibold transition"
          >
            {text}
          </Link>
        );
      }}
    >
      {children}
    </MentionText>
  );
}
