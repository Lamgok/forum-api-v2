import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(threadId, owner, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments (id, content, date, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, threadId, owner, false],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(commentId, threadId) {
    const query = threadId
      ? {
        text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
        values: [commentId, threadId],
      }
      : {
        text: 'SELECT id FROM comments WHERE id = $1',
        values: [commentId],
      };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0]?.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT comments.id, comments.content, comments.date, users.username, comments.is_delete, (SELECT COUNT(*)::INTEGER FROM comment_likes WHERE comment_id = comments.id) AS like_count FROM comments INNER JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default CommentRepositoryPostgres;
