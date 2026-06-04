import { Expose } from 'class-transformer';

export class RequestPasswordResetResponseDto {
  @Expose() sent!: true;

  static create(): RequestPasswordResetResponseDto {
    const dto = new RequestPasswordResetResponseDto();

    dto.sent = true;

    return dto;
  }
}
