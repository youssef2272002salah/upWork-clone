import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const user = await this.userRepository.findOne({ where: { id: createJobDto.userId.toString() } });
    if (!user) throw new NotFoundException(`User with id ${createJobDto.userId} not found`);

    const category = await this.categoryRepository.findOne({ where: { id: createJobDto.categoryId } });
    if (!category) throw new NotFoundException(`Category with id ${createJobDto.categoryId} not found`);

    const job = this.jobRepository.create({
      ...createJobDto,
      user,
      category,
    });

    return await this.jobRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobRepository.find({
      relations: ['user', 'category', 'proposals'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'proposals'],
    });
    if (!job) throw new NotFoundException(`Job with id ${id} not found`);
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);

    if (updateJobDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateJobDto.userId.toString() } });
      if (!user) throw new NotFoundException(`User with id ${updateJobDto.userId} not found`);
      job.user = user;
    }

    if (updateJobDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateJobDto.categoryId } });
      if (!category) throw new NotFoundException(`Category with id ${updateJobDto.categoryId} not found`);
      job.category = category;
    }

    Object.assign(job, updateJobDto);

    return await this.jobRepository.save(job);
  }

  async remove(id: number): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }
}
