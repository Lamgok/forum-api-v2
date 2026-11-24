import AddedReply from '../entities/AddedReply.js';

const validPayload = {
  id: 'reply-123',
  content: 'A reply',
  owner: 'user-123',
};

describe('AddedReply entity', () => {
  it('should create AddedReply object', () => {
    expect(new AddedReply(validPayload)).toEqual(validPayload);
  });

  it.each(['id', 'content', 'owner'])('should reject missing %s', (property) => {
    const payload = { ...validPayload };
    delete payload[property];

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'content', 'owner'])('should reject null %s', (property) => {
    const payload = { ...validPayload, [property]: null };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'content', 'owner'])('should reject a non-string %s', (property) => {
    const payload = { ...validPayload, [property]: 123 };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new AddedReply()).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new AddedReply(null)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
