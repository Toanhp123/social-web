import { IsString, Length, Matches } from 'class-validator';

export class OAuthSessionDto {
  @IsString()
  @Length(32, 128)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  code!: string;
}
