import { vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import AddCommentUseCase from '../AddCommentUseCase.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/comments/entities/DetailComment.js';
import DetailReply from '../../../Domains/replies/entities/DetailReply.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import ToggleCommentLikeUseCase from '../ToggleCommentLikeUseCase.js';

describe('AddThreadUseCase', () => {
  it('should validate and add a thread', async () => {
    const newThread = { title: 'A title', body: 'A body' };
    const owner = 'user-123';
    const addedThread = { id: 'thread-123' };
    const threadRepository = {
      addThread: vi.fn().mockResolvedValue(addedThread),
    };
    const useCase = new AddThreadUseCase({ threadRepository });

    await expect(useCase.execute(newThread, owner)).resolves.toBe(addedThread);

    expect(threadRepository.addThread).toHaveBeenCalledWith(new NewThread(newThread), owner);
  });

  it('should reject invalid input without calling the repository', async () => {
    const threadRepository = {
      addThread: vi.fn(),
    };
    const useCase = new AddThreadUseCase({ threadRepository });

    await expect(useCase.execute({ title: 123, body: 'A body' }, 'user-123'))
      .rejects.toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');

    expect(threadRepository.addThread).not.toHaveBeenCalled();
  });
});

describe('GetThreadDetailUseCase', () => {
  it('should build thread detail with mapped comments and replies', async () => {
    const threadId = 'thread-123';
    const threadRecord = {
      id: threadId,
      title: 'A title',
      body: 'A body',
      date: new Date('2026-01-01T00:00:00.000Z'),
      username: 'thread-owner',
    };
    const commentRecords = [
      {
        id: 'comment-1',
        username: 'commenter',
        date: new Date('2026-01-02T00:00:00.000Z'),
        content: 'A comment',
        'is_delete': false,
      },
      {
        id: 'comment-2',
        username: 'commenter-two',
        date: '2026-01-03T00:00:00.000Z',
        content: 'Deleted comment content',
        'is_delete': true,
      },
    ];
    const replyRecords = [
      {
        id: 'reply-1',
        'comment_id': 'comment-1',
        username: 'replier',
        date: new Date('2026-01-02T01:00:00.000Z'),
        content: 'A reply',
        'is_delete': false,
      },
      {
        id: 'reply-2',
        'comment_id': 'comment-1',
        username: 'replier-two',
        date: '2026-01-02T02:00:00.000Z',
        content: 'Deleted reply content',
        'is_delete': true,
      },
    ];
    const threadRepository = {
      getThreadById: vi.fn().mockResolvedValue(threadRecord),
    };
    const commentRepository = {
      getCommentsByThreadId: vi.fn().mockResolvedValue(commentRecords),
    };
    const replyRepository = {
      getRepliesByThreadId: vi.fn().mockResolvedValue(replyRecords),
    };
    const useCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    const detail = await useCase.execute(threadId);

    expect(detail).toEqual(new DetailThread({
      id: threadId,
      title: 'A title',
      body: 'A body',
      date: '2026-01-01T00:00:00.000Z',
      username: 'thread-owner',
      comments: [
        new DetailComment({
          id: 'comment-1',
          username: 'commenter',
          date: '2026-01-02T00:00:00.000Z',
          content: 'A comment',
          isDelete: false,
          replies: [
            new DetailReply({
              id: 'reply-1',
              username: 'replier',
              date: '2026-01-02T01:00:00.000Z',
              content: 'A reply',
              isDelete: false,
            }),
            new DetailReply({
              id: 'reply-2',
              username: 'replier-two',
              date: '2026-01-02T02:00:00.000Z',
              content: '**balasan telah dihapus**',
              isDelete: true,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-2',
          username: 'commenter-two',
          date: '2026-01-03T00:00:00.000Z',
          content: '**komentar telah dihapus**',
          isDelete: true,
          replies: [],
        }),
      ],
    }));

    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(replyRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);
    expect(detail).toBeInstanceOf(DetailThread);
  });

  it('should return empty comments when repositories return no comments or replies', async () => {
    const threadId = 'thread-empty';
    const threadRepository = {
      getThreadById: vi.fn().mockResolvedValue({
        id: threadId,
        title: 'Empty thread',
        body: 'No discussion yet',
        date: '2026-02-01T00:00:00.000Z',
        username: 'owner',
      }),
    };
    const commentRepository = {
      getCommentsByThreadId: vi.fn().mockResolvedValue([]),
    };
    const replyRepository = {
      getRepliesByThreadId: vi.fn().mockResolvedValue([]),
    };
    const useCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    const detail = await useCase.execute(threadId);

    expect(detail).toEqual(new DetailThread({
      id: threadId,
      title: 'Empty thread',
      body: 'No discussion yet',
      date: '2026-02-01T00:00:00.000Z',
      username: 'owner',
      comments: [],
    }));
    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(replyRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);
  });
});

describe('AddCommentUseCase', () => {
  it('should validate, verify its thread, and add a comment', async () => {
    const threadId = 'thread-123';
    const owner = 'user-123';
    const payload = { content: 'A comment' };
    const addedComment = { id: 'comment-123' };
    const threadRepository = {
      verifyThreadAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentRepository = {
      addComment: vi.fn().mockResolvedValue(addedComment),
    };
    const useCase = new AddCommentUseCase({ threadRepository, commentRepository });

    await expect(useCase.execute(threadId, owner, payload)).resolves.toBe(addedComment);

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(commentRepository.addComment).toHaveBeenCalledWith(
      threadId,
      owner,
      new NewComment(payload),
    );
  });
});

describe('DeleteCommentUseCase', () => {
  it('should verify the thread, comment, and owner before deleting', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';
    const threadRepository = {
      verifyThreadAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentRepository = {
      verifyCommentAvailability: vi.fn().mockResolvedValue(undefined),
      verifyCommentOwner: vi.fn().mockResolvedValue(undefined),
      deleteCommentById: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new DeleteCommentUseCase({ threadRepository, commentRepository });

    await expect(useCase.execute(threadId, commentId, owner)).resolves.toBeUndefined();

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId, threadId);
    expect(commentRepository.verifyCommentOwner).toHaveBeenCalledWith(commentId, owner);
    expect(commentRepository.deleteCommentById).toHaveBeenCalledWith(commentId);
  });
});

describe('AddReplyUseCase', () => {
  it('should validate, verify the thread and comment, then add a reply', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';
    const payload = { content: 'A reply' };
    const addedReply = { id: 'reply-123' };
    const threadRepository = {
      verifyThreadAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentRepository = {
      verifyCommentAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const replyRepository = {
      addReply: vi.fn().mockResolvedValue(addedReply),
    };
    const useCase = new AddReplyUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    await expect(useCase.execute(threadId, commentId, owner, payload)).resolves.toBe(addedReply);

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId, threadId);
    expect(replyRepository.addReply).toHaveBeenCalledWith(commentId, owner, new NewReply(payload));
  });
});

describe('DeleteReplyUseCase', () => {
  it('should verify thread, comment, reply, and owner before deleting', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const owner = 'user-123';
    const threadRepository = {
      verifyThreadAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentRepository = {
      verifyCommentAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const replyRepository = {
      verifyReplyAvailability: vi.fn().mockResolvedValue(undefined),
      verifyReplyOwner: vi.fn().mockResolvedValue(undefined),
      deleteReplyById: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new DeleteReplyUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    await expect(useCase.execute(threadId, commentId, replyId, owner)).resolves.toBeUndefined();

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId, threadId);
    expect(replyRepository.verifyReplyAvailability).toHaveBeenCalledWith(replyId, commentId);
    expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith(replyId, owner);
    expect(replyRepository.deleteReplyById).toHaveBeenCalledWith(replyId);
  });
});

describe('ToggleCommentLikeUseCase', () => {
  it('should verify the thread and comment before toggling the user like', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';
    const threadRepository = {
      verifyThreadAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentRepository = {
      verifyCommentAvailability: vi.fn().mockResolvedValue(undefined),
    };
    const commentLikeRepository = {
      toggleLike: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new ToggleCommentLikeUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository,
    });

    await expect(useCase.execute(threadId, commentId, userId)).resolves.toBeUndefined();

    expect(threadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(commentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId, threadId);
    expect(commentLikeRepository.toggleLike).toHaveBeenCalledWith(commentId, userId);
  });
});
