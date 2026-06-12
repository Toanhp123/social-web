import { MentionParser } from './mention-parser.service.js';

describe('MentionParser', () => {
  it('extracts unique usernames from mention tokens', () => {
    expect(
      MentionParser.extractUsernames(
        'Hello @alice and @bob.dev, again @Alice!',
      ),
    ).toEqual(['alice', 'bob.dev']);
  });

  it('ignores email-like tokens and dangling at signs', () => {
    expect(
      MentionParser.extractUsernames('mail me at a@test.com or @ later'),
    ).toEqual([]);
  });
});
