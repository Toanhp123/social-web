import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportPostInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
