import { IsEmail, IsOptional, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^\+\d{1,4}$/)
  phoneCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  bio?: string;

  
  @ApiProperty({ required: false })
  @IsOptional()
  role?: string; // Assuming role is a string, you might want to use an enum for roles




}