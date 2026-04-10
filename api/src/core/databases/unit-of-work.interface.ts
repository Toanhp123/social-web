import { Prisma } from '../../generated/prisma/client.js';

export interface UnitOfWork {
  execute<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}
