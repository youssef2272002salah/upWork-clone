import { Controller, Post, Body, Res, Req, Get, Patch, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { use } from 'passport';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const user = await this.authService.signup(signupDto, res);
    res.json(user)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto, res);
    res.json({user})
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
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
    const responce = await this.authService.resetPassword(resetPasswordDto, res);
    res.json(responce);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(@Req() req: Request, @Body() resetPasswordDto, @Res() res: Response) {
    const responce = await this.authService.updatePassword((req.user as { id: string }).id, resetPasswordDto, res);
    res.json(responce);
  }
  
  @Post('refresh')
    async refreshToken(@Req() req: Request, @Res() res: Response) {
      return this.authService.refreshToken(req, res);
  }
  

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.validateOAuthLogin(req.user);
      return res.json(result); // أو redirect مع JWT
    } catch (error) {
      console.error('Google login error:', error);
      return res.status(500).json({ message: 'Google login failed' });
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.validateOAuthLogin(req.user);
      return res.json(result); // أو redirect مع JWT
    } catch (error) {
      console.error('Google login error:', error);
      return res.status(500).json({ message: 'Google login failed' });
    }
  }

}