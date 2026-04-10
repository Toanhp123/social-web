// core/logger/logger.service.ts
import { getRequestId } from '../context/request-context.service.js';

export class LoggerService {
  log(message: string, meta?: unknown) {
    console.log(
      JSON.stringify({
        level: 'log',
        requestId: getRequestId(),
        message,
        meta,
      }),
    );
  }

  error(message: string, meta?: unknown) {
    console.error(
      JSON.stringify({
        level: 'error',
        requestId: getRequestId(),
        message,
        meta,
      }),
    );
  }
}
