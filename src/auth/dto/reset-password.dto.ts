import { IsNotEmpty, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'NewPassword123',
    description: 'The new password',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Password confirmation (must match password)',
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @ValidateIf((o) => o.password === o.passwordConfirm, {
    message: 'Passwords do not match',
  })
  passwordConfirm: string;

  @ApiProperty({
    example: 'abc123xyz',
    description: 'The reset token received via email',
  })
  @IsNotEmpty({ message: 'Reset token is required' })
  resetToken: string;
}