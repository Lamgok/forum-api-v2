import express from 'express';
import replies from '../replies/index.js';

const createCommentsRouter = (handler, container, authenticate) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticate, handler.postCommentHandler);
  router.delete('/:commentId', authenticate, handler.deleteCommentHandler);
  router.put('/:commentId/likes', authenticate, handler.putCommentLikeHandler);
  router.use('/:commentId/replies', replies(container, authenticate));

  return router;
};

export default createCommentsRouter;
