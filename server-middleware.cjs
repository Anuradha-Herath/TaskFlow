/**
 * Optional middleware for json-server: returns 401 Unauthorized for protected
 * routes when the request has no Authorization Bearer header. Use with:
 *   json-server --watch db.json --port 3000 --middlewares server-middleware.cjs
 * This is for demo only; it does not validate the token.
 */
const protectedPaths = ['/projects', '/tasks', '/users'];
const allowedPaths = ['/login', '/register'];

function isProtected(path) {
  if (allowedPaths.some((p) => path === p || path.startsWith(p + '?'))) return false;
  return protectedPaths.some((p) => path === p || path.startsWith(p + '/'));
}

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (!isProtected(req.path)) return next();
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    return;
  }
  next();
};
