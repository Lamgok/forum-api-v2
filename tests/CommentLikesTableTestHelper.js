/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentLikesTableTestHelper = {
  async addLike({ commentId = 'comment-123', userId = 'user-123' } = {}) {
    await pool.query({
      text: 'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
      values: [commentId, userId],
    });
  },

  async findLikesByCommentId(commentId) {
    const result = await pool.query({
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

export default CommentLikesTableTestHelper;
