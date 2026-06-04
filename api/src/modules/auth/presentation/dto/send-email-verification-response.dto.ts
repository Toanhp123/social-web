import { Expose } from 'class-transformer';

export class SendEmailVerificationResponseDto {
  @Expose() sent!: boolean;
  @Expose() expiresAt?: string;

  static fromResult(input: {
    sent: boolean;
    expiresAt?: Date;
  }): SendEmailVerificationResponseDto {
    const dto = new SendEmailVerificationResponseDto();

    dto.sent = input.sent;
    dto.expiresAt = input.expiresAt?.toISOString();

    return dto;
  }
}
