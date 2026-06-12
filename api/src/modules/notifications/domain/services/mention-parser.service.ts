const MENTION_PATTERN = /(^|[^\w.])@([a-zA-Z0-9_.]{3,30})\b/g;

export class MentionParser {
  static extractUsernames(content: string): string[] {
    const usernames = new Set<string>();

    for (const match of content.matchAll(MENTION_PATTERN)) {
      usernames.add(match[2].toLowerCase());
    }

    return [...usernames];
  }
}
