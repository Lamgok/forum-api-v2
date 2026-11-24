import DetailReply from '../entities/DetailReply.js';

const validPayload = {
  id: 'reply-123',
  content: 'A reply',
  date: '2026-11-17T00:00:00.000Z',
  username: 'dicoding',
  isDelete: false,
};

describe('DetailReply entity', () => {
  it('should create DetailReply object', () => {
    expect(new DetailReply(validPayload)).toEqual({
      id: validPayload.id,
      content: validPayload.content,
      date: validPayload.date,
      username: validPayload.username,
    });
  });

  it('should set deleted reply content to the deletion message', () => {
    expect(new DetailReply({ ...validPayload, isDelete: true }).content)
      .toBe('**balasan telah dihapus**');
  });

  it.each(['id', 'content', 'date', 'username', 'isDelete'])(
    'should reject missing %s',
    (property) => {
      const payload = { ...validPayload };
      delete payload[property];

      expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'content', 'date', 'username', 'isDelete'])(
    'should reject null %s',
    (property) => {
      const payload = { ...validPayload, [property]: null };

      expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'content', 'date', 'username'])(
    'should reject a non-string %s',
    (property) => {
      const payload = { ...validPayload, [property]: 123 };

      expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    },
  );

  it('should reject a non-boolean isDelete', () => {
    expect(() => new DetailReply({ ...validPayload, isDelete: 'false' }))
      .toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new DetailReply()).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new DetailReply(null)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
