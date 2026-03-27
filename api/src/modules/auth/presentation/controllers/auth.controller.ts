import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from '../../application/services/login.service.js';
import { LoginDto } from '../dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    // private registerService: RegisterService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginService.execute(loginDto.email, loginDto.password);
  }
}
