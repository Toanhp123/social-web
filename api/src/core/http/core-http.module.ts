import { Module } from '@nestjs/common';
import { ClientIpResolver } from '@/core/http/client-ip.resolver.js';

@Module({
  providers: [ClientIpResolver],
  exports: [ClientIpResolver],
})
export class CoreHttpModule {}
