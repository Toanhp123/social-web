import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DatabaseError } from '../exceptions/database.exception.js';

export function mapPrismaError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new DatabaseError('Duplicate field', {
        target: error.meta?.target,
      });
    }

    if (error.code === 'P2025') {
      return new DatabaseError('Record not found');
    }
  }

  return new DatabaseError('Unknown database error');
}
