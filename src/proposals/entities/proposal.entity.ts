import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum ProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('proposals')
@Unique(['job', 'freelancer']) // Prevent duplicate proposals
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number; // SERIAL PRIMARY KEY

  @ManyToOne(() => Job, (job) => job.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job; // job_id INT REFERENCES jobs(id)

  @ManyToOne(() => User, (user) => user.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: User; // freelancer_id INT REFERENCES users(id)

  @Column({ type: 'text' })
  coverLetter: string; // cover_letter TEXT NOT NULL

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  proposedPrice: number; // proposed_price NUMERIC(10, 2) NOT NULL

  @Column({ type: 'int', nullable: true })
  deliveryTime: number; // delivery_time in days

  @Column({
    type: 'text',
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  status: ProposalStatus;
/*
  proposal.milestones = {
  phase1: { task: 'Design', dueDate: '2025-08-20', payment: 500 },
  phase2: { task: 'Development', dueDate: '2025-09-10', payment: 1000 }
};
 */
  // Additional proposal details
  @Column({ type: 'jsonb', nullable: true })
  milestones: Record<string, any>; // JSONB for complex projects

  @Column({ type: 'text', array: true, nullable: true })
  attachments: string[]; // Array of file URLs / portfolio items

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;
}
