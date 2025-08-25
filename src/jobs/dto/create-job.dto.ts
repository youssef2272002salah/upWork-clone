import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsArray,
    IsDateString,
    Min,
  } from 'class-validator';
  import { BudgetType, ExperienceLevel, JobStatus } from '../entities/job.entity';
  
  export class CreateJobDto {
    @IsString()
    title: string;
  
    @IsString()
    description: string;
  
    @IsEnum(BudgetType)
    budgetType: BudgetType;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    budgetMin?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    budgetMax?: number;
  
    @IsOptional()
    @IsString()
    durationEstimate?: string;
  
    @IsOptional()
    @IsEnum(ExperienceLevel)
    experienceLevel?: ExperienceLevel;
  
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredSkills?: string[];
  
    @IsOptional()
    @IsString()
    preferredQualifications?: string;
  
    @IsOptional()
    @IsDateString()
    deadline?: Date;
  
    // Relations
    @IsString()
    userId: string;
  
    @IsNumber()
    categoryId: number;
  }
  