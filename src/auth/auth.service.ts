import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';

// import { Tokens } from './interfaces/tokens.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private signAccessToken(id: string): string {
    return this.jwtService.sign({ id }, { expiresIn: '15m',
      secret: process.env.JWT_SECRET,
     });
  }

  private signRefreshToken(id: string): string {
    return this.jwtService.sign({ id }, { 
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async createSendToken(user: User, res: Response) {
    const accessToken = await this.signAccessToken(user.id.toString());

    const refreshToken = await this.signRefreshToken(user.id.toString());

   await res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        // role: user.role,
      },
    };
  }

  async signup(signupDto: SignupDto, res: Response) {
    signupDto.password= await bcrypt.hash(signupDto.password,10)
    const newUser = await this.userService.createUser(signupDto);

    const verificationToken = await crypto.randomBytes(32).toString('hex');
    await this.userService.updateUser(newUser.id.toString(), {
      verificationToken,
    });
    
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    await this.mailService.sendVerificationEmail(newUser.email, verificationLink);
    console.log(`Verification email sent to ${newUser.email} with link: ${verificationLink}`);
    
    const user = await this.createSendToken(newUser, res);
    return user;
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user || !user.password || !( await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }


    if (!user.isVerified) {
      const verificationToken = await crypto.randomBytes(32).toString('hex');
      await this.userService.updateUser(user.id.toString(), {
        verificationToken,
      });

      const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
      await this.mailService.sendVerificationEmail(user.email, verificationLink);
      
      throw new UnauthorizedException('Email not verified. Verification email sent');
    }

    const result = await this.createSendToken(user, res);
    return result;
  }

  async logout(res: Response): Promise<void> {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'strict',
      path: '/',
    });
    res.json({ message: 'Logged out successfully' });
  }

  async refreshToken(req: Request, res: Response): Promise<string> {
    const token = (req as any).cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const decoded = this.jwtService.verify(token, {
      secret: process.env.REFRESH_SECRET,
    });
    const user = await this.userService.getUserById(decoded.id);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.signAccessToken(user.id.toString());
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userService.updateUser(user.id.toString(), {
      verificationToken: undefined,
      isVerified: true,
    });

    return { message: 'Email successfully verified' };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found or already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.userService.updateUser(user.id.toString(), {
      verificationToken,
    });

    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    await this.mailService.sendVerificationEmail(user.email, verificationLink);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordResetToken = crypto.randomBytes(8).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);


    await this.userService.updateUser(user.id.toString(), {
      passwordResetToken,
      passwordResetExpires,
    });

    await this.mailService.sendResetPasswordEmail(user.email, passwordResetToken);

    return { message: 'Password reset token sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, res: Response) {
    console.log(resetPasswordDto.resetToken)
    const user = await this.userService.findByResetToken(resetPasswordDto.resetToken);
    console.log(user)
    
    if (!user) {
      throw new BadRequestException('Token is invalid or expired');
    }
    resetPasswordDto.password = await bcrypt.hash(resetPasswordDto.password, 10);

    await this.userService.updatePassword(
      user.id.toString(),
      resetPasswordDto.password,
    );

    return this.createSendToken(user, res);
  }

  async updatePassword(userId: string, resetPasswordDto: ResetPasswordDto, res: Response){

    resetPasswordDto.password = await bcrypt.hash(resetPasswordDto.password, 10);
    const user = await this.userService.getUserById(userId);
    await this.userService.updatePassword(
      userId,
      resetPasswordDto.password,
    );

    return this.createSendToken(user, res);
  }

  

  async validateOAuthLogin(oAuthUser: any) {
    let user = await this.userRepository.findOne({ where: { email: oAuthUser.email } });
  
    if (!user) {
      user = this.userRepository.create({
        email: oAuthUser.email,
        username: oAuthUser.firstName || oAuthUser.email,
        profilePicture: oAuthUser.picture,
        googleId: oAuthUser.provider === 'google' ? oAuthUser.providerId : null,
        facebookId: oAuthUser.provider === 'facebook' ? oAuthUser.providerId : null,
        isVerified: true,
      });
      await this.userRepository.save(user);
    }
  
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET, // مهم هنا عشان ماترجعش error تاني
      }),
      user,
    };
  }
  
}