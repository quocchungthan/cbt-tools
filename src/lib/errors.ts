export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toErrorResponse(err: unknown): { error: string; message: string; details?: unknown } {
  if (err instanceof ApiError) {
    return { error: 'ApiError', message: err.message, details: err.details };
  }
  if (err instanceof Error) {
    return { error: 'Error', message: err.message };
  }
  return { error: 'Unknown', message: 'Unknown error' };
}