import { IsString, MaxLength } from 'class-validator';

export class CreateCommentInputDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}
