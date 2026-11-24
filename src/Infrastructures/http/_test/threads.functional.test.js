import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

describe('Forum HTTP functional tests', () => {
  let app;
  let ownerToken;
  let otherOwnerToken;

  const cleanTables = async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  };

  const createToken = async (id, username) => {
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    return tokenManager.createAccessToken({ id, username });
  };

  const addUserFixtures = async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'owner',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'other-owner',
    });
    ownerToken = await createToken('user-123', 'owner');
    otherOwnerToken = await createToken('user-456', 'other-owner');
  };

  const addThreadFixture = async (id = 'thread-123', owner = 'user-123') => {
    await ThreadsTableTestHelper.addThread({
      id,
      owner,
      date: new Date('2026-01-01T00:00:00.000Z'),
    });
  };

  const addCommentFixture = async ({
    id = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'Comment content',
    date = new Date('2026-01-02T00:00:00.000Z'),
    isDelete = false,
  } = {}) => {
    await CommentsTableTestHelper.addComment({
      id,
      threadId,
      owner,
      content,
      date,
      isDelete,
    });
  };

  const addReplyFixture = async ({
    id = 'reply-123',
    commentId = 'comment-123',
    owner = 'user-123',
    content = 'Reply content',
    date = new Date('2026-01-03T00:00:00.000Z'),
    isDelete = false,
  } = {}) => {
    await RepliesTableTestHelper.addReply({
      id,
      commentId,
      owner,
      content,
      date,
      isDelete,
    });
  };

  const registerUser = async (username = 'functional-user') => request(app)
    .post('/users')
    .send({
      username,
      password: 'secret-password',
      fullname: 'Functional User',
    });

  beforeAll(async () => {
    app = await createServer(container);
  });

  afterEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /users', () => {
    it('should register and persist a user', async () => {
      const response = await registerUser();

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          addedUser: {
            username: 'functional-user',
            fullname: 'Functional User',
          },
        },
      });

      const users = await UsersTableTestHelper.findUsersById(response.body.data.addedUser.id);
      expect(users).toHaveLength(1);
      expect(users[0].password).not.toBe('secret-password');
    });

    it('should reject a restricted or already registered username', async () => {
      const restrictedUsername = await request(app)
        .post('/users')
        .send({
          username: 'invalid username',
          password: 'secret-password',
          fullname: 'Functional User',
        });
      expect(restrictedUsername.status).toBe(400);
      expect(restrictedUsername.body.message)
        .toBe('tidak dapat membuat user baru karena username mengandung karakter terlarang');

      await registerUser();
      const duplicateUsername = await registerUser();
      expect(duplicateUsername.status).toBe(400);
      expect(duplicateUsername.body.message).toBe('username tidak tersedia');
    });

    it('should reject an invalid payload', async () => {
      const response = await request(app)
        .post('/users')
        .send({ username: 'functional-user', password: 123, fullname: 'Functional User' });

      expect(response.status).toBe(400);
    });
  });

  describe('Authentications endpoints', () => {
    it('should log in and persist a refresh token', async () => {
      await registerUser();

      const response = await request(app)
        .post('/authentications')
        .send({ username: 'functional-user', password: 'secret-password' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
      expect(await AuthenticationsTableTestHelper.findToken(response.body.data.refreshToken))
        .toHaveLength(1);
    });

    it('should reject an unknown username and an incorrect password', async () => {
      const unknownUser = await request(app)
        .post('/authentications')
        .send({ username: 'unknown-user', password: 'secret-password' });
      expect(unknownUser.status).toBe(400);

      await registerUser();
      const incorrectPassword = await request(app)
        .post('/authentications')
        .send({ username: 'functional-user', password: 'wrong-password' });
      expect(incorrectPassword.status).toBe(401);
    });

    it('should refresh an access token and reject an invalid refresh token', async () => {
      await registerUser();
      const login = await request(app)
        .post('/authentications')
        .send({ username: 'functional-user', password: 'secret-password' });

      const refreshed = await request(app)
        .put('/authentications')
        .send({ refreshToken: login.body.data.refreshToken });
      expect(refreshed.status).toBe(200);
      expect(refreshed.body.data.accessToken).toEqual(expect.any(String));

      const invalid = await request(app)
        .put('/authentications')
        .send({ refreshToken: 'invalid-refresh-token' });
      expect(invalid.status).toBe(400);
      expect(invalid.body.message).toBe('refresh token tidak valid');
    });

    it('should delete a refresh token and report unknown tokens', async () => {
      await registerUser();
      const login = await request(app)
        .post('/authentications')
        .send({ username: 'functional-user', password: 'secret-password' });
      const { refreshToken } = login.body.data;

      const deleted = await request(app)
        .delete('/authentications')
        .send({ refreshToken });
      expect(deleted.status).toBe(200);
      expect(deleted.body).toEqual({ status: 'success' });
      expect(await AuthenticationsTableTestHelper.findToken(refreshToken)).toHaveLength(0);

      const unknown = await request(app)
        .delete('/authentications')
        .send({ refreshToken: 'not-in-database' });
      expect(unknown.status).toBe(400);
      expect(unknown.body.message).toBe('refresh token tidak ditemukan di database');
    });
  });

  describe('POST /threads', () => {
    it('should create and persist a thread with an authenticated owner', async () => {
      await addUserFixtures();

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'A new thread', body: 'Thread body' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedThread).toMatchObject({
        title: 'A new thread',
        owner: 'user-123',
      });

      const threads = await ThreadsTableTestHelper.findThreadById(response.body.data.addedThread.id);
      expect(threads).toHaveLength(1);
      expect(threads[0]).toMatchObject({
        title: 'A new thread',
        body: 'Thread body',
        owner: 'user-123',
      });
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .post('/threads')
        .send({ title: 'A new thread', body: 'Thread body' });

      expect(response.status).toBe(401);
    });

    it.each([
      [{ body: 'Thread body' }],
      [{ title: 'A title', body: 123 }],
    ])('should reject an invalid payload', async (payload) => {
      await addUserFixtures();

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).not.toBe('');
    });

  });

  describe('POST /threads/:threadId/comments', () => {
    it('should create and persist a comment', async () => {
      await addUserFixtures();
      await addThreadFixture();

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A new comment' });

      expect(response.status).toBe(201);
      expect(response.body.data.addedComment).toMatchObject({
        content: 'A new comment',
        owner: 'user-123',
      });

      const comments = await CommentsTableTestHelper.findCommentById(response.body.data.addedComment.id);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toMatchObject({
        content: 'A new comment',
        'thread_id': 'thread-123',
        owner: 'user-123',
        'is_delete': false,
      });
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'A comment' });

      expect(response.status).toBe(401);
    });

    it('should return 404 when the thread does not exist', async () => {
      await addUserFixtures();

      const response = await request(app)
        .post('/threads/missing-thread/comments')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A comment' });

      expect(response.status).toBe(404);
    });

    it('should reject an invalid comment payload', async () => {
      await addUserFixtures();
      await addThreadFixture();

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).not.toBe('');
    });

  });

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    it('should soft delete a comment and persist its deletion state', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
      expect(comments[0].content).toBe('Comment content');
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123');

      expect(response.status).toBe(401);
    });

    it('should reject deletion by a non-owner', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${otherOwnerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 when the thread does not exist', async () => {
      await addUserFixtures();

      const response = await request(app)
        .delete('/threads/missing-thread/comments/comment-123')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 when the comment does not exist', async () => {
      await addUserFixtures();
      await addThreadFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/missing-comment')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should create and persist a reply', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A new reply' });

      expect(response.status).toBe(201);
      expect(response.body.data.addedReply).toMatchObject({
        content: 'A new reply',
        owner: 'user-123',
      });

      const replies = await RepliesTableTestHelper.findReplyById(response.body.data.addedReply.id);
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        content: 'A new reply',
        'comment_id': 'comment-123',
        owner: 'user-123',
        'is_delete': false,
      });
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'A reply' });

      expect(response.status).toBe(401);
    });

    it('should return 404 when the thread does not exist', async () => {
      await addUserFixtures();

      const response = await request(app)
        .post('/threads/missing-thread/comments/comment-123/replies')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A reply' });

      expect(response.status).toBe(404);
    });

    it('should return 404 when the comment does not exist', async () => {
      await addUserFixtures();
      await addThreadFixture();

      const response = await request(app)
        .post('/threads/thread-123/comments/missing-comment/replies')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A reply' });

      expect(response.status).toBe(404);
    });

    it('should reject an invalid reply payload', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).not.toBe('');
    });

    it('should return 404 when the comment belongs to a different thread', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addThreadFixture('thread-other');
      await addCommentFixture({ id: 'comment-other', threadId: 'thread-other' });

      const response = await request(app)
        .post('/threads/thread-123/comments/comment-other/replies')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'A reply' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should soft delete a reply and persist its deletion state', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();
      await addReplyFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
      expect(replies[0].content).toBe('Reply content');
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123');

      expect(response.status).toBe(401);
    });

    it('should reject deletion by a non-owner', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();
      await addReplyFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${otherOwnerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 when the thread does not exist', async () => {
      await addUserFixtures();

      const response = await request(app)
        .delete('/threads/missing-thread/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 when the comment does not exist', async () => {
      await addUserFixtures();
      await addThreadFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/missing-comment/replies/reply-123')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 when the reply does not exist', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/missing-reply')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /threads/:threadId', () => {
    it('should return thread details with comments and replies ordered by date, including deleted messages', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture({
        id: 'comment-later',
        content: 'Deleted comment content',
        date: new Date('2026-01-03T00:00:00.000Z'),
        isDelete: true,
      });
      await addCommentFixture({
        id: 'comment-earlier',
        content: 'Earlier comment content',
        date: new Date('2026-01-02T00:00:00.000Z'),
      });
      await addReplyFixture({
        id: 'reply-later',
        commentId: 'comment-earlier',
        content: 'Deleted reply content',
        date: new Date('2026-01-02T02:00:00.000Z'),
        isDelete: true,
      });
      await addReplyFixture({
        id: 'reply-earlier',
        commentId: 'comment-earlier',
        content: 'Earlier reply content',
        date: new Date('2026-01-02T01:00:00.000Z'),
      });
      await addReplyFixture({
        id: 'reply-for-deleted-comment',
        commentId: 'comment-later',
        content: 'Reply on deleted comment',
        date: new Date('2026-01-04T00:00:00.000Z'),
      });

      const response = await request(app).get('/threads/thread-123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.thread).toMatchObject({
        id: 'thread-123',
        title: 'Thread title',
        body: 'Thread body',
        username: 'owner',
      });

      const { comments } = response.body.data.thread;
      expect(comments.map(({ id }) => id)).toEqual(['comment-earlier', 'comment-later']);
      expect(comments[0]).toMatchObject({
        content: 'Earlier comment content',
      });
      expect(comments[0].replies.map(({ id }) => id)).toEqual(['reply-earlier', 'reply-later']);
      expect(comments[0].replies[0]).toMatchObject({
        content: 'Earlier reply content',
      });
      expect(comments[0].replies[1]).toMatchObject({
        content: '**balasan telah dihapus**',
      });
      expect(comments[1]).toMatchObject({
        content: '**komentar telah dihapus**',
      });
      expect(comments[1].replies[0]).toMatchObject({
        id: 'reply-for-deleted-comment',
        content: 'Reply on deleted comment',
      });
    });

    it('should return 404 when the thread does not exist', async () => {
      const response = await request(app).get('/threads/missing-thread');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /threads/:threadId/comments/:commentId/likes', () => {
    it('should toggle a like and include its count in thread details', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addCommentFixture();

      const firstResponse = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toEqual({ status: 'success' });
      expect(await CommentLikesTableTestHelper.findLikesByCommentId('comment-123'))
        .toHaveLength(1);

      const detailWithLike = await request(app).get('/threads/thread-123');
      expect(detailWithLike.body.data.thread.comments[0].likeCount).toBe(1);

      const secondResponse = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(secondResponse.status).toBe(200);
      expect(await CommentLikesTableTestHelper.findLikesByCommentId('comment-123'))
        .toHaveLength(0);

      const detailWithoutLike = await request(app).get('/threads/thread-123');
      expect(detailWithoutLike.body.data.thread.comments[0].likeCount).toBe(0);
    });

    it('should reject a request without an access token', async () => {
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Missing authentication');
    });

    it('should return 404 when the thread or comment does not exist', async () => {
      await addUserFixtures();

      const missingThread = await request(app)
        .put('/threads/missing-thread/comments/comment-123/likes')
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(missingThread.status).toBe(404);

      await addThreadFixture();
      const missingComment = await request(app)
        .put('/threads/thread-123/comments/missing-comment/likes')
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(missingComment.status).toBe(404);
    });

    it('should return 404 when the comment belongs to a different thread', async () => {
      await addUserFixtures();
      await addThreadFixture();
      await addThreadFixture('thread-other');
      await addCommentFixture({ id: 'comment-other', threadId: 'thread-other' });

      const response = await request(app)
        .put('/threads/thread-123/comments/comment-other/likes')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
