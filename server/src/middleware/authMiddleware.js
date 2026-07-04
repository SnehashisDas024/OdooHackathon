import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import jwt from 'jsonwebtoken';

// ── Auth middleware — verifies access token from cookie ─────
export function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError('No session found. Please sign in.');

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Your session expired. Please sign in again.'));
    }
    next(new UnauthorizedError());
  }
}

// ── Role middleware — restricts access by role ──────────────
export function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("You don't have permission to access this resource."));
    }
    next();
  };
}
