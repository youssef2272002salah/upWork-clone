import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { SignupDto } from '../auth/dto/signup.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Email Verification',
      html: this.generateVerificationEmail(verificationLink),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.configService.get('BASE_URL')}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Password Reset Request',
      html: this.generateResetPasswordEmail(resetLink, resetToken),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generateVerificationEmail(verificationLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
           color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `;
  }

  private generateResetPasswordEmail(resetLink: string, resetToken: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password. Here's your reset token:</p>
        
        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; margin: 20px 0;">
          <strong>Reset Token:</strong> ${resetToken}
        </div>
        
        <p>Or click the button below to reset your password:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
           color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">
          This token will expire in 10 minutes.
        </p>
      </div>
    `;
  }

  async sendWelcomeEmail(user: SignupDto): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: user.email,
      subject: 'Welcome to Our Service',
      html: this.generateWelcomeEmail(user.username),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generateWelcomeEmail(fullName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${fullName}!</h2>
        <p>Thank you for joining our service. We're excited to have you on board.</p>
        <p>Here are some things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Invite your friends</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">
          This is an automated message. Please do not reply directly.
        </p>
      </div>
    `;
  }

  async sendLoginNotification(email: string, loginData: LoginDto): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'New Login Detected',
      html: this.generateLoginNotification(loginData),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generateLoginNotification(loginData: LoginDto): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Login Detected</h2>
        <p>A new login was detected for your account:</p>
        <p><strong>Email:</strong> ${loginData.email}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you didn't log in, please reset your password immediately and contact support.</p>
        
        <a href="${this.configService.get('BASE_URL')}/auth/forgot-password" 
           style="display: inline-block; padding: 10px 20px; background-color: #f44336; 
           color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
      </div>
    `;
  }

  async sendPasswordChangedEmail(email: string, resetData: ResetPasswordDto): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Password Changed Successfully',
      html: this.generatePasswordChangedNotification(),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generatePasswordChangedNotification(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed</h2>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">
          This is an automated security notification.
        </p>
      </div>
    `;
  }
}