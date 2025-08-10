import { ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../lib/errors';

export function validate(schema: { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const parsed = schema.body.parse(req.body);
        req.body = parsed;
      }
      if (schema.query) {
        // Validate only; do not reassign to avoid type mismatch
        schema.query.parse(req.query);
      }
      if (schema.params) {
        // Validate only; do not reassign to avoid type mismatch
        schema.params.parse(req.params);
      }
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        next(new ApiError(400, 'Validation failed', e.issues));
      } else {
        next(e);
      }
    }
  };
}