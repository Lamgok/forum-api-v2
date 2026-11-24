import request from 'supertest';
import { vi } from 'vitest';
import AuthenticationTokenManager from '../../../../../Applications/security/AuthenticationTokenManager.js';
import AddThreadUseCase from '../../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadDetailUseCase from '../../../../../Applications/use_case/GetThreadDetailUseCase.js';
import AddCommentUseCase from '../../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../../Applications/use_case/DeleteCommentUseCase.js';
import AddReplyUseCase from '../../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../../Applications/use_case/DeleteReplyUseCase.js';
import createServer from '../../../../../Infrastructures/http/createServer.js';

describe('threads HTTP routes', () => {
  const createTestApp = async () => {
    const services = {
      [AuthenticationTokenManager.name]: {
        verifyAccessToken: vi.fn().mockResolvedValue(undefined),
        decodePayload: vi.fn().mockResolvedValue({ id: 'user-123' }),
      },
      [AddThreadUseCase.name]: {
        execute: vi.fn().mockResolvedValue({ id: 'thread-123' }),
      },
      [GetThreadDetailUseCase.name]: {
        execute: vi.fn().mockResolvedValue({ id: 'thread-123', comments: [] }),
      },
      [AddCommentUseCase.name]: {
        execute: vi.fn().mockResolvedValue({ id: 'comment-123' }),
      },
      [DeleteCommentUseCase.name]: {
        execute: vi.fn().mockResolvedValue(undefined),
      },
      [AddReplyUseCase.name]: {
        execute: vi.fn().mockResolvedValue({ id: 'reply-123' }),
      },
      [DeleteReplyUseCase.name]: {
        execute: vi.fn().mockResolvedValue(undefined),
      },
    };
    const container = {
      getInstance: vi.fn((key) => services[key]),
    };
    const app = await createServer(container);

    return { app, services, container };
  };

  it('should dispatch the six thread, comment, and reply routes', async () => {
    const { app, services, container } = await createTestApp();
    const token = 'Bearer valid-access-token';

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', token)
      .send({ title: 'Title', body: 'Body' });
    expect(threadResponse.status).toBe(201);
    expect(services[AddThreadUseCase.name].execute)
      .toHaveBeenCalledWith({ title: 'Title', body: 'Body' }, 'user-123');

    const detailResponse = await request(app).get('/threads/thread-123');
    expect(detailResponse.status).toBe(200);
    expect(services[GetThreadDetailUseCase.name].execute).toHaveBeenCalledWith('thread-123');

    const commentResponse = await request(app)
      .post('/threads/thread-123/comments')
      .set('Authorization', token)
      .send({ content: 'Comment' });
    expect(commentResponse.status).toBe(201);
    expect(services[AddCommentUseCase.name].execute)
      .toHaveBeenCalledWith('thread-123', 'user-123', { content: 'Comment' });

    const deleteCommentResponse = await request(app)
      .delete('/threads/thread-123/comments/comment-123')
      .set('Authorization', token);
    expect(deleteCommentResponse.status).toBe(200);
    expect(services[DeleteCommentUseCase.name].execute)
      .toHaveBeenCalledWith('thread-123', 'comment-123', 'user-123');

    const replyResponse = await request(app)
      .post('/threads/thread-123/comments/comment-123/replies')
      .set('Authorization', token)
      .send({ content: 'Reply' });
    expect(replyResponse.status).toBe(201);
    expect(services[AddReplyUseCase.name].execute)
      .toHaveBeenCalledWith('thread-123', 'comment-123', 'user-123', { content: 'Reply' });

    const deleteReplyResponse = await request(app)
      .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
      .set('Authorization', token);
    expect(deleteReplyResponse.status).toBe(200);
    expect(services[DeleteReplyUseCase.name].execute)
      .toHaveBeenCalledWith('thread-123', 'comment-123', 'reply-123', 'user-123');
    expect(services[AuthenticationTokenManager.name].verifyAccessToken)
      .toHaveBeenCalledWith('valid-access-token');
    expect(services[AuthenticationTokenManager.name].decodePayload)
      .toHaveBeenCalledWith('valid-access-token');
    expect(container.getInstance).toHaveBeenCalledWith(AuthenticationTokenManager.name);
    expect(container.getInstance).toHaveBeenCalledWith(AddThreadUseCase.name);
    expect(container.getInstance).toHaveBeenCalledWith(GetThreadDetailUseCase.name);
    expect(container.getInstance).toHaveBeenCalledWith(AddCommentUseCase.name);
    expect(container.getInstance).toHaveBeenCalledWith(DeleteCommentUseCase.name);
    expect(container.getInstance).toHaveBeenCalledWith(AddReplyUseCase.name);
    expect(container.getInstance).toHaveBeenCalledWith(DeleteReplyUseCase.name);
  });

  it('should require a bearer access token on restricted routes', async () => {
    const { app, services } = await createTestApp();

    const response = await request(app)
      .post('/threads')
      .send({ title: 'Title', body: 'Body' });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(services[AddThreadUseCase.name].execute).not.toHaveBeenCalled();
  });
});
