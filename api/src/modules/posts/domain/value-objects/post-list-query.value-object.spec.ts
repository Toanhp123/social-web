import { PostListQuery } from './post-list-query.value-object.js';

describe(PostListQuery.name, () => {
  it('normalizes search text for post listing', () => {
    const query = PostListQuery.create({
      search: '  hello world  ',
    });

    expect(query.search).toBe('hello world');
  });

  it('ignores blank search text', () => {
    const query = PostListQuery.create({
      search: '   ',
    });

    expect(query.search).toBeUndefined();
  });
});
