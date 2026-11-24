import NewReply from '../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId, commentId, owner, useCasePayload) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);

    return this._replyRepository.addReply(commentId, owner, newReply);
  }
}

export default AddReplyUseCase;
