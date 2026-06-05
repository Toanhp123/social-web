import { IsIn } from 'class-validator';
import { ReactionType } from '@/generated/prisma/client.js';

export class SetPostReactionInputDto {
  @IsIn(Object.values(ReactionType))
  type!: ReactionType;
}
