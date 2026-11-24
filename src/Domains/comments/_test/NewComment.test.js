import NewComment from '../entities/NewComment.js';

describe('NewComment entity', () => {
  it('should create NewComment object', () => {
    expect(new NewComment({ content: 'A comment' })).toEqual({ content: 'A comment' });
  });

  it('should reject missing content', () => {
    expect(() => new NewComment({})).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject null content', () => {
    expect(() => new NewComment({ content: null }))
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a non-string content', () => {
    expect(() => new NewComment({ content: 123 }))
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new NewComment()).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new NewComment(null)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
