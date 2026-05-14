import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

export function mapPrismaError(error: unknown): DatabaseError {
  if (error instanceof PrismaClientKnownRequestError) {
    const metadata = {
      prismaCode: error.code,
      meta: error.meta,
    };

    if (error.code === 'P2002') {
      return new DatabaseError(
        'Duplicate field',
        metadata,
        ErrorCode.DUPLICATE_FIELD,
        409,
        error,
      );
    }

    if (error.code === 'P2003') {
      return new DatabaseError(
        'Foreign key constraint failed',
        metadata,
        ErrorCode.RESOURCE_CONFLICT,
        409,
        error,
      );
    }

    if (error.code === 'P2025') {
      return new DatabaseError(
        'Record not found',
        metadata,
        ErrorCode.RECORD_NOT_FOUND,
        404,
        error,
      );
    }

    return new DatabaseError(
      'Unknown database error',
      metadata,
      ErrorCode.DATABASE_ERROR,
      500,
      error,
    );
  }

  return new DatabaseError(
    'Unknown database error',
    undefined,
    ErrorCode.DATABASE_ERROR,
    500,
    error,
  );
}
