import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from '../../common/constants/provider-token.constant.js';
import { PrismaUnitOfWork } from './prisma-unit-of-work.js';
import { PrismaService } from './prisma.service.js';

@Module({
  providers: [
    PrismaService,
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [PrismaService, UNIT_OF_WORK],
})
export class DatabaseModule {}
