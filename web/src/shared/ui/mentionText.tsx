import { Fragment, type ReactNode } from "react";

type MentionTextProps = {
  children: string;
  className?: string;
  renderMention?: (input: { username: string; text: string }) => ReactNode;
};

const MENTION_PATTERN = /(^|[^\w.])@([a-zA-Z0-9_.]{3,30})\b/g;

export function MentionText({
  children,
  className,
  renderMention,
}: MentionTextProps) {
  const parts = splitMentionText(children);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.kind === "mention" ? (
          <Fragment key={index}>
            {renderMention ? (
              renderMention({ username: part.username, text: part.text })
            ) : (
              <span className="text-brand font-semibold">{part.text}</span>
            )}
          </Fragment>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </span>
  );
}

type MentionTextPart =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "mention";
      text: string;
      username: string;
    };

function splitMentionText(value: string): MentionTextPart[] {
  const parts: MentionTextPart[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(MENTION_PATTERN)) {
    const prefix = match[1] ?? "";
    const username = match[2] ?? "";
    const mentionStart = (match.index ?? 0) + prefix.length;

    if (mentionStart > lastIndex) {
      parts.push({ kind: "text", text: value.slice(lastIndex, mentionStart) });
    }

    parts.push({
      kind: "mention",
      text: `@${username}`,
      username: username.toLowerCase(),
    });
    lastIndex = mentionStart + username.length + 1;
  }

  if (lastIndex < value.length) {
    parts.push({ kind: "text", text: value.slice(lastIndex) });
  }

  return parts;
}
