import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { LoggerService } from '@/core/logger/logger.service.js';
import {
  EmailSender,
  SendEmailInput,
} from '@/modules/auth/application/ports/email-sender.port.js';

@Injectable()
export class SmtpEmailSender implements EmailSender {
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.from =
      this.configService.get<string>('email.from') ??
      'Social Web <no-reply@localhost>';
    this.transporter = this.createTransporter();
  }

  async send(input: SendEmailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('SMTP is not configured; email was not sent', {
        context: 'SmtpEmailSender',
        to: input.to,
        subject: input.subject,
        preview: input.text,
      });
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }

  private createTransporter(): Transporter | null {
    const host = this.configService.get<string>('email.host');

    if (!host) {
      return null;
    }

    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.pass');

    return nodemailer.createTransport({
      host,
      port: this.configService.get<number>('email.port') ?? 587,
      secure: this.configService.get<boolean>('email.secure') ?? false,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
}
