import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { FacebookStrategy } from 'src/common/strategies/facebook.strategy';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1500000000m' },
    }),
    
  ],
  controllers: [AuthController],
  providers: [AuthService,
               JwtStrategy,
               JwtAuthGuard,
               GoogleStrategy,
               FacebookStrategy,
    ],
  exports: [AuthService,
           JwtModule,
           PassportModule,
           ],
})
export class AuthModule {}