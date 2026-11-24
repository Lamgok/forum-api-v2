/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'Comment content',
    date = new Date(),
    threadId = 'thread-123',
    owner = 'user-123',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments (id, content, date, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, threadId, owner, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

export default CommentsTableTestHelper;
