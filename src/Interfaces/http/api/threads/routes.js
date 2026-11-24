import express from 'express';

const createThreadsRouter = (handler, authenticate) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticate, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);

  return router;
};

export default createThreadsRouter;
