import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EMAIL_SENDER } from '@/common/constants/provider-token.constant.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import { SmtpEmailSender } from '@/infrastructure/email/smtp-email-sender.js';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    {
      provide: EMAIL_SENDER,
      useClass: SmtpEmailSender,
    },
  ],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
