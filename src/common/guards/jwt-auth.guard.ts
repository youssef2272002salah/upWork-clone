import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Debugging: Log the token and secret
      console.log('Token:', token);
      const secret = this.configService.get<string>('JWT_SECRET');
      console.log('Secret:', secret);

      // Verify token with proper error handling
      const payload = await this.jwtService.verifyAsync(token, { 
        secret: secret,
        ignoreExpiration: false, // Ensure we check expiration
      });
      
      console.log('Payload:', payload);

      const user = await this.userService.getUserById(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.passwordChangedAt) {
        const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (payload.iat < changedTimestamp) {
          throw new UnauthorizedException('Password changed - please login again');
        }
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error('JWT Verification Error Details:', error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : request.cookies?.jwt;
  }
}