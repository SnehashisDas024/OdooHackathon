import { ValidationError } from '../errors/index.js';

/**
 * Validates req.body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Invalid input — check the fields below.', details));
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Invalid query parameters.', details));
    }
    req.validatedQuery = result.data;
    next();
  };
}
