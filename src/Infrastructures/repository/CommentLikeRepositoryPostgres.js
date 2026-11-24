import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import CommentLikeRepository from '../../Domains/comments/CommentLikeRepository.js';

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async toggleLike(commentId, userId) {
    const client = await this._pool.connect();

    try {
      await client.query('BEGIN');
      const comment = await client.query({
        text: 'SELECT id FROM comments WHERE id = $1 FOR UPDATE',
        values: [commentId],
      });

      if (comment.rowCount === 0) {
        throw new NotFoundError('komentar tidak ditemukan');
      }

      const existingLike = await client.query({
        text: 'SELECT user_id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        values: [commentId, userId],
      });

      if (existingLike.rowCount > 0) {
        await client.query({
          text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
          values: [commentId, userId],
        });
      } else {
        await client.query({
          text: 'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
          values: [commentId, userId],
        });
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default CommentLikeRepositoryPostgres;
