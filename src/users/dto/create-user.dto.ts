import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  Matches, 
  ValidateIf, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsString, 
  IsUrl, 
  IsNumber 
} from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsNotEmpty()
  @ValidateIf((o) => o.password === o.passwordConfirm)
  passwordConfirm: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'Phone number must be numeric' })
  phone?: string;

  @IsOptional()
  @Matches(/^\+\d{1,4}$/, { message: 'Invalid phone code format (e.g., +1, +44)' })
  phoneCode?: string;

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
  bio?: string;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
