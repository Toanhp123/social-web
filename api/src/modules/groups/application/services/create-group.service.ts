import { Inject, Injectable } from '@nestjs/common';
import { GroupPrivacy } from '@/generated/prisma/client.js';
import { GROUP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';

export type CreateGroupServiceInput = {
  ownerId: string;
  name: string;
  description?: string | null;
  privacy?: GroupPrivacy;
};

@Injectable()
export class CreateGroupService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: CreateGroupServiceInput): Promise<Group> {
    const name = input.name.trim();
    const description = input.description?.trim() || null;

    if (!name) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Group name is required',
        400,
      );
    }

    if (name.length > 120) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Group name is too long',
        400,
        { maxLength: 120 },
      );
    }

    return this.groupRepository.create({
      ownerId: input.ownerId,
      name,
      description,
      privacy: input.privacy ?? GroupPrivacy.PUBLIC,
    });
  }
}
