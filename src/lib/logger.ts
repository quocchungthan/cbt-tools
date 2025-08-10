import pino from 'pino';

function createLogger() {
  const level = process.env.LOG_LEVEL || 'info';
  if (process.env.NODE_ENV !== 'production') {
    try {
      const transport = pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      });
      return pino({ level }, transport);
    } catch {
      // Fallback to plain JSON if pretty transport is unavailable
      return pino({ level });
    }
  }
  return pino({ level });
}

export const logger = createLogger();