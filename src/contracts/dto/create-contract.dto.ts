// src/contracts/dto/create-contract.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ContractType, ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsNotEmpty()
  @IsNumber()
  jobId: number;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  freelancerId: string;

  @IsNotEmpty()
  @IsNumber()
  proposalId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  agreed_price: number;

  @IsOptional()
  @IsEnum(ContractType)
  contract_type?: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  milestones?: Record<string, any>;
}
