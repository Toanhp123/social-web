import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/auth-infrastructure.module.js';
import { RealtimeGateway } from '@/core/realtime/realtime.gateway.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';

@Module({
  imports: [JwtModule.register({}), AuthInfrastructureModule],
  providers: [RealtimeGateway, RealtimePublisher],
  exports: [RealtimePublisher],
})
export class RealtimeModule {}
