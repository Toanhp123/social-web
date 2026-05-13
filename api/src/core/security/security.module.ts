import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class SecurityModule {}
