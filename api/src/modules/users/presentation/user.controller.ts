import { Controller, Get, Param } from '@nestjs/common';
import { GetUserService } from '../application/services/get-user.service.js';
import { UserResponseDto } from './dto/user-response.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserService.execute(id);
    return UserResponseDto.fromDomain(user);
  }
}
