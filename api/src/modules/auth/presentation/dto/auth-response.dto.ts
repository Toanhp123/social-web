import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose() accessToken!: string;

  static fromAccessToken(accessToken: string): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = accessToken;
    return dto;
  }
}
