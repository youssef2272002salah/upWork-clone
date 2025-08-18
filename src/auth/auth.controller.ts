import { Controller, Post, Body, Res, Req, Get, Patch, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { use } from 'passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const user = await this.authService.signup(signupDto, res);
    console.log(`User signed `);
    res.json(user)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto, res);
    console.log(user)
    res.json({user})
    }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    return this.authService.resetPassword(resetPasswordDto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(@Req() req: Request, @Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    return this.authService.updatePassword((req.user as { id: string }).id, resetPasswordDto, res);
  }

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth() {}

  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
  //   return this.authService.googleAuthCallback(req, res);
  // }

  // @Get('facebook')
  // @UseGuards(AuthGuard('facebook'))
  // async facebookAuth() {}

  // @Get('facebook/callback')
  // @UseGuards(AuthGuard('facebook'))
  // async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
  //   return this.authService.facebookAuthCallback(req, res);
  // }
}