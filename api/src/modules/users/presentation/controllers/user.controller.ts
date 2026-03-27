import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUserService } from '../../application/services/get-user.service.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { JwtAuthGuard } from './../../../auth/infrastructure/guards/jwt-auth.guard.js';

@Controller('users')
export class UserController {
  constructor(private readonly getUserService: GetUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserService.execute(id);
    return UserResponseDto.fromDomain(user);
  }
}
