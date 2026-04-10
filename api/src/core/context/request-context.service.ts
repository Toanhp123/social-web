// core/context/request-context.service.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextData {
  requestId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}
