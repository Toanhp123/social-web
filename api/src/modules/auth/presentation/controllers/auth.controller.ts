import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginService } from '../../application/services/login.service.js';
import { LoginDto } from '../dto/login.dto.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    // private registerService: RegisterService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.loginService.execute(
      loginDto.email,
      loginDto.password,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return accessToken;
  }
}
