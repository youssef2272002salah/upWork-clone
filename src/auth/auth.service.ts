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

// import { Tokens } from './interfaces/tokens.interface';

@Injectable()
export class AuthService {
  constructor(
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
console.log(`Refresh Token: ${refreshToken}`);
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
    console.log("password before hash",signupDto.password)
    signupDto.password= await bcrypt.hash(signupDto.password,10)
    const newUser = await this.userService.createUser(signupDto);

    const verificationToken = await crypto.randomBytes(32).toString('hex');
    await this.userService.updateUser(newUser.id.toString(), {
      verificationToken,
    });
    
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    // await this.mailService.sendVerificationEmail(newUser.email, verificationLink);
    console.log(`Verification email sent to ${newUser.email} with link: ${verificationLink}`);
    
    const user = await this.createSendToken(newUser, res);
    console.log(`User signed up: ${JSON.stringify(user)}`);
    console.log("password after hash",newUser.password)
    return user;
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.userService.findByEmail(loginDto.email);
    console.log(loginDto.password , user.password)
    const match = await bcrypt.compare(loginDto.password, user.password);
    console.log(match)
    if (!user || !user.password || !( bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      const verificationToken = await crypto.randomBytes(32).toString('hex');
      await this.userService.updateUser(user.id.toString(), {
        verificationToken,
      });

      const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
      // await this.mailService.sendVerificationEmail(user.email, verificationLink);
      
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

    const resetToken = crypto.randomBytes(8).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.userService.updateUser(user.id.toString(), {
      passwordResetToken,
      passwordResetExpires,
    });

    await this.mailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: 'Password reset token sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, res: Response) {
    const hashedToken = crypto.createHash('sha256').update(resetPasswordDto.resetToken).digest('hex');
    const user = await this.userService.findByResetToken(hashedToken);
    
    if (!user) {
      throw new BadRequestException('Token is invalid or expired');
    }

    await this.userService.updatePassword(
      user.id.toString(),
      resetPasswordDto.password,
    );

    return this.createSendToken(user, res);
  }

  async updatePassword(userId: string, resetPasswordDto: ResetPasswordDto, res: Response){
    const user = await this.userService.getUserById(userId);
    if (!user.password || !(await bcrypt.compare(resetPasswordDto.password, user.password))) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.userService.updatePassword(
      userId,
      resetPasswordDto.password,
    );

    return this.createSendToken(user, res);
  }

  // async googleAuthCallback(req: Request, res: Response): Promise<void> {
  //   const user = req.user as User;
  //   const tokens = this.createSendToken(user, res);
  //   res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${tokens.accessToken}`);
  // }

  // async facebookAuthCallback(req: Request, res: Response): Promise<void> {
  //   const user = req.user as User;
  //   const tokens = this.createSendToken(user, res);
  //   res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${tokens.accessToken}`);
  // }
}