import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService,
        private readonly userRepository: UserRepository, // Assuming you have a UserRepository to fetch user data
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
        });
    }
    
    async validate(payload: any) {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role', 'role.permissions'], // 👈 load permissions
      });

      console.log('JWT Strategy - User:', user);
      return user;
    }
       
}