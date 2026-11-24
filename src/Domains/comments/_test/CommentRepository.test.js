import CommentRepository from '../CommentRepository.js';

describe('CommentRepository interface', () => {
  it('should throw error when invoking abstract methods', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment('thread-123', 'user-123', {}))
      .rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentAvailability('comment-123'))
      .rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.deleteCommentById('comment-123'))
      .rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getCommentsByThreadId('thread-123'))
      .rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
