import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginService } from '../../application/services/login.service.js';
import { LoginDto } from '../dto/login.dto.js';
import type { Response } from 'express';
import { RegisterService } from '../../application/services/register.service.js';
import { RegisterDto } from '../dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
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

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.registerService.execute(registerDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return accessToken;
  }
}
