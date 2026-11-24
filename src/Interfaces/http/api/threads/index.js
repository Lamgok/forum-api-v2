import createAuthenticateMiddleware from '../middleware/authenticate.js';
import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
import comments from '../comments/index.js';

export default (container) => {
  const authenticate = createAuthenticateMiddleware(container);
  const router = createThreadsRouter(new ThreadsHandler(container), authenticate);

  router.use('/:threadId/comments', comments(container, authenticate));

  return router;
};
