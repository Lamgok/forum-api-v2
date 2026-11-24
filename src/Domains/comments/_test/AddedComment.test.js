import AddedComment from '../entities/AddedComment.js';

const validPayload = {
  id: 'comment-123',
  content: 'A comment',
  owner: 'user-123',
};

describe('AddedComment entity', () => {
  it('should create AddedComment object', () => {
    expect(new AddedComment(validPayload)).toEqual(validPayload);
  });

  it.each(['id', 'content', 'owner'])('should reject missing %s', (property) => {
    const payload = { ...validPayload };
    delete payload[property];

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'content', 'owner'])('should reject null %s', (property) => {
    const payload = { ...validPayload, [property]: null };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'content', 'owner'])('should reject a non-string %s', (property) => {
    const payload = { ...validPayload, [property]: 123 };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new AddedComment()).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new AddedComment(null)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
