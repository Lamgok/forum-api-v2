import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';

describe('Forum repositories postgres', () => {
  const cleanTables = async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  };

  beforeEach(async () => {
    await cleanTables();
  });

  afterEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  const seedUser = async (id = 'user-123', username = 'dicoding') => {
    await UsersTableTestHelper.addUser({ id, username });
  };

  const seedThread = async (id = 'thread-123', owner = 'user-123') => {
    await ThreadsTableTestHelper.addThread({
      id,
      owner,
      date: new Date('2026-01-01T00:00:00.000Z'),
    });
  };

  const seedComment = async (id = 'comment-123', threadId = 'thread-123', owner = 'user-123', date) => {
    await CommentsTableTestHelper.addComment({
      id,
      threadId,
      owner,
      date: date ?? new Date('2026-01-02T00:00:00.000Z'),
    });
  };

  describe('ThreadRepositoryPostgres', () => {
    it('should persist a thread and return AddedThread', async () => {
      await seedUser();
      const threadRepository = new ThreadRepositoryPostgres(pool, () => 'generated');
      const thread = await threadRepository.addThread(new NewThread({
        title: 'A new thread',
        body: 'Thread body',
      }), 'user-123');

      expect(thread).toEqual({
        id: 'thread-generated',
        title: 'A new thread',
        owner: 'user-123',
      });

      const persistedThreads = await ThreadsTableTestHelper.findThreadById('thread-generated');
      expect(persistedThreads).toHaveLength(1);
      expect(persistedThreads[0]).toMatchObject({
        id: 'thread-generated',
        title: 'A new thread',
        body: 'Thread body',
        owner: 'user-123',
      });
      expect(persistedThreads[0].date).toBeInstanceOf(Date);
    });

    it('should verify thread availability and throw if it does not exist', async () => {
      await seedUser();
      await seedThread();
      const threadRepository = new ThreadRepositoryPostgres(pool, () => 'unused');

      await expect(threadRepository.verifyThreadAvailability('thread-123')).resolves.toBeUndefined();
      await expect(threadRepository.verifyThreadAvailability('missing-thread'))
        .rejects.toThrowError(new NotFoundError('thread tidak ditemukan'));
    });

    it('should get thread data joined with its owner username', async () => {
      await seedUser();
      await seedThread();
      const threadRepository = new ThreadRepositoryPostgres(pool, () => 'unused');

      await expect(threadRepository.getThreadById('thread-123')).resolves.toMatchObject({
        id: 'thread-123',
        title: 'Thread title',
        body: 'Thread body',
        username: 'dicoding',
      });
    });

    it('should throw NotFoundError when getting a missing thread', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => 'unused');

      await expect(threadRepository.getThreadById('missing-thread'))
        .rejects.toThrowError(new NotFoundError('thread tidak ditemukan'));
    });
  });

  describe('CommentRepositoryPostgres', () => {
    it('should persist a comment and return AddedComment', async () => {
      await seedUser();
      await seedThread();
      const commentRepository = new CommentRepositoryPostgres(pool, () => 'generated');
      const comment = await commentRepository.addComment(
        'thread-123',
        'user-123',
        new NewComment({ content: 'A new comment' }),
      );

      expect(comment).toEqual({
        id: 'comment-generated',
        content: 'A new comment',
        owner: 'user-123',
      });

      const persistedComments = await CommentsTableTestHelper.findCommentById('comment-generated');
      expect(persistedComments).toHaveLength(1);
      expect(persistedComments[0]).toMatchObject({
        id: 'comment-generated',
        content: 'A new comment',
        'thread_id': 'thread-123',
        owner: 'user-123',
        'is_delete': false,
      });
      expect(persistedComments[0].date).toBeInstanceOf(Date);
    });

    it('should verify comment availability and throw if it does not exist', async () => {
      await seedUser();
      await seedThread();
      await seedComment();
      const commentRepository = new CommentRepositoryPostgres(pool, () => 'unused');

      await expect(commentRepository.verifyCommentAvailability('comment-123')).resolves.toBeUndefined();
      await expect(commentRepository.verifyCommentAvailability('missing-comment'))
        .rejects.toThrowError(new NotFoundError('komentar tidak ditemukan'));
    });

    it('should verify comment owner and reject a different owner', async () => {
      await seedUser();
      await seedUser('user-other', 'other');
      await seedThread();
      await seedComment();
      const commentRepository = new CommentRepositoryPostgres(pool, () => 'unused');

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.toBeUndefined();
      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-other'))
        .rejects.toThrowError(new AuthorizationError('anda tidak berhak mengakses resource ini'));
    });

    it('should soft delete a comment and preserve its content in retrieval results', async () => {
      await seedUser();
      await seedThread();
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Original comment',
        isDelete: false,
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => 'unused');

      await commentRepository.deleteCommentById('comment-123');

      const persistedComments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(persistedComments[0]).toMatchObject({
        content: 'Original comment',
        'is_delete': true,
      });
    });

    it('should return comments with deletion state ordered by date ascending', async () => {
      await seedUser();
      await seedThread();
      await CommentsTableTestHelper.addComment({
        id: 'comment-later',
        threadId: 'thread-123',
        content: 'Later comment',
        date: new Date('2026-01-03T00:00:00.000Z'),
        isDelete: true,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-earlier',
        threadId: 'thread-123',
        content: 'Earlier comment',
        date: new Date('2026-01-02T00:00:00.000Z'),
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => 'unused');

      const comments = await commentRepository.getCommentsByThreadId('thread-123');

      expect(comments.map(({ id }) => id)).toEqual(['comment-earlier', 'comment-later']);
      expect(comments[0]).toMatchObject({
        id: 'comment-earlier',
        content: 'Earlier comment',
        username: 'dicoding',
        'is_delete': false,
      });
      expect(comments[1]).toMatchObject({
        id: 'comment-later',
        content: 'Later comment',
        'is_delete': true,
      });
    });
  });

  describe('ReplyRepositoryPostgres', () => {
    it('should persist a reply and return AddedReply', async () => {
      await seedUser();
      await seedThread();
      await seedComment();
      const replyRepository = new ReplyRepositoryPostgres(pool, () => 'generated');
      const reply = await replyRepository.addReply(
        'comment-123',
        'user-123',
        new NewReply({ content: 'A new reply' }),
      );

      expect(reply).toEqual({
        id: 'reply-generated',
        content: 'A new reply',
        owner: 'user-123',
      });

      const persistedReplies = await RepliesTableTestHelper.findReplyById('reply-generated');
      expect(persistedReplies).toHaveLength(1);
      expect(persistedReplies[0]).toMatchObject({
        id: 'reply-generated',
        content: 'A new reply',
        'comment_id': 'comment-123',
        owner: 'user-123',
        'is_delete': false,
      });
      expect(persistedReplies[0].date).toBeInstanceOf(Date);
    });

    it('should verify reply availability and throw if it does not exist', async () => {
      await seedUser();
      await seedThread();
      await seedComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepository = new ReplyRepositoryPostgres(pool, () => 'unused');

      await expect(replyRepository.verifyReplyAvailability('reply-123')).resolves.toBeUndefined();
      await expect(replyRepository.verifyReplyAvailability('missing-reply'))
        .rejects.toThrowError(new NotFoundError('balasan tidak ditemukan'));
    });

    it('should verify reply owner and reject a different owner', async () => {
      await seedUser();
      await seedUser('user-other', 'other');
      await seedThread();
      await seedComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepository = new ReplyRepositoryPostgres(pool, () => 'unused');

      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.toBeUndefined();
      await expect(replyRepository.verifyReplyOwner('reply-123', 'user-other'))
        .rejects.toThrowError(new AuthorizationError('anda tidak berhak mengakses resource ini'));
    });

    it('should soft delete a reply', async () => {
      await seedUser();
      await seedThread();
      await seedComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepository = new ReplyRepositoryPostgres(pool, () => 'unused');

      await replyRepository.deleteReplyById('reply-123');

      const persistedReplies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(persistedReplies[0]).toMatchObject({
        content: 'Reply content',
        'is_delete': true,
      });
    });

    it('should return replies for a thread with raw deletion state and comment id ordered by date', async () => {
      await seedUser();
      await seedThread();
      await seedComment('comment-123');
      await RepliesTableTestHelper.addReply({
        id: 'reply-later',
        commentId: 'comment-123',
        content: 'Later reply',
        date: new Date('2026-01-04T00:00:00.000Z'),
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-earlier',
        commentId: 'comment-123',
        content: 'Earlier reply',
        date: new Date('2026-01-03T00:00:00.000Z'),
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, () => 'unused');

      const replies = await replyRepository.getRepliesByThreadId('thread-123');

      expect(replies.map(({ id }) => id)).toEqual(['reply-earlier', 'reply-later']);
      expect(replies[0]).toMatchObject({
        id: 'reply-earlier',
        content: 'Earlier reply',
        username: 'dicoding',
        'is_delete': false,
        'comment_id': 'comment-123',
      });
      expect(replies[1]).toMatchObject({
        id: 'reply-later',
        content: 'Later reply',
        'is_delete': true,
        'comment_id': 'comment-123',
      });
    });
  });
});
