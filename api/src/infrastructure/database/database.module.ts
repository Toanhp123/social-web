import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from '@/common/constants/provider-token.constant.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { PrismaUnitOfWork } from '@/infrastructure/database/prisma-unit-of-work.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';

@Module({
  providers: [
    PrismaService,
    PrismaTransactionContext,
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [PrismaService, PrismaTransactionContext, UNIT_OF_WORK],
})
export class DatabaseModule {}
