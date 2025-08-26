// src/contracts/contracts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Proposal } from '../proposals/entities/proposal.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Proposal)
    private readonly proposalRepo: Repository<Proposal>,
  ) {}

  async create(dto: CreateContractDto): Promise<Contract> {
    const job = await this.jobRepo.findOneBy({ id: dto.jobId });
    const client = await this.userRepo.findOneBy({ id: dto.clientId.toString() });
    const freelancer = await this.userRepo.findOneBy({ id: dto.freelancerId.toString() });
    const proposal = await this.proposalRepo.findOneBy({ id: dto.proposalId });

    if (!job || !client || !freelancer || !proposal) {
      throw new NotFoundException('Job, client, freelancer, or proposal not found');
    }

    const contract = this.contractRepo.create({
      ...dto,
      job,
      client,
      freelancer,
      proposal,
    });

    return this.contractRepo.save(contract);
  }

  async findAll(): Promise<Contract[]> {
    return this.contractRepo.find({
      relations: ['job', 'client', 'freelancer', 'proposal'],
    });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['job', 'client', 'freelancer', 'proposal'],
    });
    if (!contract) throw new NotFoundException(`Contract #${id} not found`);
    return contract;
  }

  async update(id: number, dto: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);
    Object.assign(contract, dto);
    return this.contractRepo.save(contract);
  }

  async remove(id: number): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractRepo.remove(contract);
  }
}
