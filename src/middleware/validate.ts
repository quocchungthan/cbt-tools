import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../lib/errors';

export function validate(schema: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
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