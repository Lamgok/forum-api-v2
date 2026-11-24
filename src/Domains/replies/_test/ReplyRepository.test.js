import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when invoking abstract methods', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.addReply('comment-123', 'user-123', {}))
      .rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyAvailability('reply-123'))
      .rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123'))
      .rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.deleteReplyById('reply-123'))
      .rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.getRepliesByThreadId('thread-123'))
      .rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
