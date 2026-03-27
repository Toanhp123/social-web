import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err) {
      throw new UnauthorizedException('Token is invalid');
    }

    if (!user) {
      throw new UnauthorizedException('User not found or token expired');
    }

    return user; // Đây là object { userId, email, ... } từ JwtStrategy
  }
}
