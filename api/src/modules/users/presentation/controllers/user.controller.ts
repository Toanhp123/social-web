import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUserService } from '@/modules/users/application/services/get-user.service.js';
import { UserResponseDto } from '@/modules/users/presentation/dto/user-response.dto.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';

@Controller('users')
export class UserController {
  constructor(private readonly getUserService: GetUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.getUserService.execute(id, currentUser);
    return UserResponseDto.fromDomain(user);
  }
}
