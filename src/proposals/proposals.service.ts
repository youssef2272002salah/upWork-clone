import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateProposalDto): Promise<Proposal> {
    const job = await this.jobRepository.findOne({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException(`Job #${dto.jobId} not found`);

    const freelancer = await this.userRepository.findOne({ where: { id: dto.freelancerId.toString() } });
    if (!freelancer) throw new NotFoundException(`User #${dto.freelancerId} not found`);

    const proposal = this.proposalRepository.create({
      ...dto,
      job,
      freelancer,
    });
    return this.proposalRepository.save(proposal);
  }

  async findAll(): Promise<Proposal[]> {
    return this.proposalRepository.find({
      relations: ['job', 'freelancer'],
    });
  }

  async findOne(id: number): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['job', 'freelancer'],
    });
    if (!proposal) throw new NotFoundException(`Proposal #${id} not found`);
    return proposal;
  }

  async update(id: number, dto: UpdateProposalDto): Promise<Proposal> {
    const proposal = await this.findOne(id);
    Object.assign(proposal, dto);
    return this.proposalRepository.save(proposal);
  }

  async remove(id: number): Promise<void> {
    const proposal = await this.findOne(id);
    await this.proposalRepository.remove(proposal);
  }

  async updateStatus(id: number, status: ProposalStatus): Promise<Proposal> {
    const proposal = await this.findOne(id);
    proposal.status = status;
    return this.proposalRepository.save(proposal);
  }
}
