import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

@Injectable()
export class GetUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new DomainError(
        ErrorCode.USER_NOT_FOUND,
        `User with id ${id} not found`,
        404,
        { id },
      );
    }
    return user;
  }
}
