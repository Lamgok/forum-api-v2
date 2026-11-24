import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';

const createAuthenticateMiddleware = (container) => async (req, res, next) => {
  const authorization = req.get('authorization');
  const match = authorization?.match(/^Bearer (\S+)$/);

  if (!match) {
    next(new AuthenticationError('Missing authentication'));
    return;
  }

  try {
    const [, token] = match;
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    await tokenManager.verifyAccessToken(token);
    req.auth = await tokenManager.decodePayload(token);
    next();
  } catch (error) {
    next(error);
  }
};

export default createAuthenticateMiddleware;
