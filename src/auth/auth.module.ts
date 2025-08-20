import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
// import { GoogleStrategy } from './strategies/google.strategy';
// import { FacebookStrategy } from './strategies/facebook.strategy';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { UserRepository } from 'src/users/user.repository';
import { FacebookStrategy } from 'src/common/strategies/facebook.strategy';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy
    , GoogleStrategy, FacebookStrategy,UserRepository
    ],
  exports: [AuthService],
})
export class AuthModule {}