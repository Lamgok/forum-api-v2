import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../Domains/comments/entities/DetailComment.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';

const formatDate = (date) => (date instanceof Date ? date.toISOString() : date);

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const replyGroups = replies.reduce((groups, reply) => {
      const { comment_id: commentId } = reply;
      if (!groups[commentId]) {
        groups[commentId] = [];
      }

      groups[commentId].push(new DetailReply({
        id: reply.id,
        content: reply.content,
        date: formatDate(reply.date),
        username: reply.username,
        isDelete: reply.is_delete,
      }));

      return groups;
    }, {});

    const detailComments = comments.map((comment) => new DetailComment({
      id: comment.id,
      username: comment.username,
      date: formatDate(comment.date),
      content: comment.content,
      isDelete: comment.is_delete,
      likeCount: comment.like_count ?? 0,
      replies: replyGroups[comment.id] || [],
    }));

    return new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: formatDate(thread.date),
      username: thread.username,
      comments: detailComments,
    });
  }
}

export default GetThreadDetailUseCase;
