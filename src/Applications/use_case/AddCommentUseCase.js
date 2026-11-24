import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId, owner, useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.verifyThreadAvailability(threadId);

    return this._commentRepository.addComment(threadId, owner, newComment);
  }
}

export default AddCommentUseCase;
