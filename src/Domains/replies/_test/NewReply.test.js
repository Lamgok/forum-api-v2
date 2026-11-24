import NewReply from '../entities/NewReply.js';

describe('NewReply entity', () => {
  it('should create NewReply object', () => {
    expect(new NewReply({ content: 'A reply' })).toEqual({ content: 'A reply' });
  });

  it('should reject missing content', () => {
    expect(() => new NewReply({})).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject null content', () => {
    expect(() => new NewReply({ content: null }))
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a non-string content', () => {
    expect(() => new NewReply({ content: 123 }))
      .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new NewReply()).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new NewReply(null)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
