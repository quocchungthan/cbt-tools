import { Request, Response } from 'express';
import { ApiError, toErrorResponse } from '../lib/errors';

export function errorHandler(err: unknown, _req: Request, res: Response) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const body = toErrorResponse(err);
  res.status(status).json(body);
}