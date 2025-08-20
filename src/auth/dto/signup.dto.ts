import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  ValidateIf,
  IsOptional,
  IsUUID,
  IsUrl,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Password must contain at least one uppercase, one lowercase letter, and one number',
  })
  password: string;

  @ValidateIf((o) => o.password === o.passwordConfirm)
  passwordConfirm: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'Phone number must be numeric' })
  phone?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  timezone?: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}
