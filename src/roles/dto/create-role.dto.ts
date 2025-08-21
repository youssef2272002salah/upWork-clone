// src/roles/dto/create-role.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string; // e.g., 'admin', 'freelancer', 'client', 'support'

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true }) // ensure every item is an integer (permission id)
  permissionIds?: number[];
}
