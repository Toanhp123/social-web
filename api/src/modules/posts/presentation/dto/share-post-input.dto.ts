import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostVisibility } from '@/generated/prisma/client.js';

export class SharePostInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsIn(Object.values(PostVisibility))
  visibility?: PostVisibility;
}
