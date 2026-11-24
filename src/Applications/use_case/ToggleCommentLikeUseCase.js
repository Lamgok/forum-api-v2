class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);
    await this._commentLikeRepository.toggleLike(commentId, userId);
  }
}

export default ToggleCommentLikeUseCase;
