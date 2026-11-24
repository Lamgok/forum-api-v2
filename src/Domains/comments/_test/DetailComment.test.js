import DetailComment from '../entities/DetailComment.js';

const validPayload = {
  id: 'comment-123',
  username: 'dicoding',
  date: '2026-11-17T00:00:00.000Z',
  content: 'A comment',
  isDelete: false,
};

describe('DetailComment entity', () => {
  it('should create DetailComment object and default replies to an empty array', () => {
    expect(new DetailComment(validPayload)).toEqual({
      id: validPayload.id,
      username: validPayload.username,
      date: validPayload.date,
      content: validPayload.content,
      likeCount: 0,
      replies: [],
    });
  });

  it('should set deleted comment content to the deletion message', () => {
    expect(new DetailComment({ ...validPayload, isDelete: true }).content)
      .toBe('**komentar telah dihapus**');
  });

  it('should retain a provided replies array', () => {
    const replies = [{ id: 'reply-123' }];

    expect(new DetailComment({ ...validPayload, replies }).replies).toBe(replies);
  });

  it('should include a provided like count', () => {
    expect(new DetailComment({ ...validPayload, likeCount: 2 }).likeCount).toBe(2);
  });

  it.each([-1, 1.5, '2'])('should reject invalid like counts', (likeCount) => {
    expect(() => new DetailComment({ ...validPayload, likeCount }))
      .toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it.each(['id', 'username', 'date', 'content', 'isDelete'])(
    'should reject missing %s',
    (property) => {
      const payload = { ...validPayload };
      delete payload[property];

      expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'username', 'date', 'content', 'isDelete'])(
    'should reject null %s',
    (property) => {
      const payload = { ...validPayload, [property]: null };

      expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'username', 'date', 'content'])(
    'should reject a non-string %s',
    (property) => {
      const payload = { ...validPayload, [property]: 123 };

      expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    },
  );

  it('should reject a non-boolean isDelete', () => {
    expect(() => new DetailComment({ ...validPayload, isDelete: 'false' }))
      .toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject replies that are not an array', () => {
    expect(() => new DetailComment({ ...validPayload, replies: 'not-an-array' }))
      .toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new DetailComment()).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new DetailComment(null)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
