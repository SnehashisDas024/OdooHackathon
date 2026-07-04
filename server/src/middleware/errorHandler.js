import { AppError } from '../errors/index.js';

/**
 * Centralized error handler — last middleware in the chain.
 * Formats all errors into the response envelope.
 */
export function errorHandler(err, req, res, next) {
  // Log the error (use pino in production)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${err.statusCode || 500} ${req.method} ${req.path}:`, err.message);
    if (!err.isOperational) console.error(err.stack);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Unknown/programming errors — don't leak details
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our end. Please try again.',
    },
  });
}

/**
 * Sends a standardized success response.
 */
export function success(res, data, message = '', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}
