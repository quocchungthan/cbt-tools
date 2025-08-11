import { NextFunction, Request, Response } from 'express';
import { ApiError, toErrorResponse } from '../lib/errors';

// 4 parameters to let express understands this is an errorHandler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const body = toErrorResponse(err);
  res.status(status).json(body);
}