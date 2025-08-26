import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsEnum, IsInt } from 'class-validator';
import { ProposalStatus } from '../entities/proposal.entity';

export class CreateProposalDto {
  @IsNotEmpty()
  @IsNumber()
  jobId: number;

  @IsNotEmpty()
  @IsString()
  freelancerId: string;

  @IsNotEmpty()
  @IsString()
  coverLetter: string;

  @IsNotEmpty()
  @IsNumber()
  proposedPrice: number;

  @IsOptional()
  @IsInt()
  deliveryTime?: number;

  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @IsOptional()
  milestones?: Record<string, any>;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}
