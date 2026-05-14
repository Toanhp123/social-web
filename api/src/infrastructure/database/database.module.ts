import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from '../../common/constants/provider-token.constant.js';
import { PrismaTransactionContext } from './prisma-transaction-context.js';
import { PrismaUnitOfWork } from './prisma-unit-of-work.js';
import { PrismaService } from './prisma.service.js';

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
