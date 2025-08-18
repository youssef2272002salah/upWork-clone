import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Job } from '../../jobs/entities/job.entity';
  import { User } from '../../users/entities/user.entity';
  import { Proposal } from '../../proposals/entities/proposal.entity';
  
  export enum ContractType {
    FIXED = 'fixed',
    HOURLY = 'hourly',
  }
  
  export enum ContractStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISPUTED = 'disputed',
  }
  
  @Entity('contracts')
  export class Contract {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Job, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'job_id' })
    job: Job;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client: User;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'freelancer_id' })
    freelancer: User;
  
    @ManyToOne(() => Proposal)
    @JoinColumn({ name: 'proposal_id' })
    proposal: Proposal;
  
    @Column({ type: 'text' })
    title: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'numeric', precision: 10, scale: 2 })
    agreed_price: number;
  
    @Column({
      type: 'enum',
      enum: ContractType,
      default: ContractType.FIXED,
    })
    contract_type: ContractType;
  
    @Column({
      type: 'enum',
      enum: ContractStatus,
      default: ContractStatus.ACTIVE,
    })
    status: ContractStatus;
  
    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    start_date: Date;
  
    @Column({ type: 'timestamptz', nullable: true })
    end_date: Date;
  
    @Column({ type: 'timestamptz', nullable: true })
    deadline: Date;
  
    @Column({ type: 'text', nullable: true })
    payment_terms: string;
  
    @Column({ type: 'jsonb', nullable: true })
    milestones: Record<string, any>;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
  }
  