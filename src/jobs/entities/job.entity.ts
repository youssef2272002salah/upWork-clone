import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';

export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
}

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number; // SERIAL PRIMARY KEY
/*
Without @JoinColumn
TypeORM will auto-generate a foreign key column name like:
userId (camelCase) in the entity
userId in the DB by default

With @JoinColumn({ name: 'user_id' })
TypeORM will use the specified name for the foreign key column in the DB.

*/
  @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // user_id REFERENCES users(id)

  @ManyToOne(() => Category, (category) => category.jobs)
  @JoinColumn({ name: 'category_id' })
  category: Category; // category_id REFERENCES categories(id)

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  // Budget
  @Column({
    type: 'text',
    enum: BudgetType,
    default: BudgetType.FIXED,
  })
  budgetType: BudgetType;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  // Project details
  @Column({ type: 'text', nullable: true })
  durationEstimate: string; // e.g., '1-3 months'

  @Column({
    type: 'text',
    enum: ExperienceLevel,
    nullable: true,
  })
  experienceLevel: ExperienceLevel;

  // Status and metadata
  @Column({
    type: 'text',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[]; // Array of programming languages/skills

  @Column({ type: 'text', array: true, nullable: true })
  attachments: string[]; // Array of file URLs

  // Freelancer requirements
  @Column({ type: 'text', array: true, nullable: true })
  requiredSkills: string[];

  @Column({ type: 'text', nullable: true })
  preferredQualifications: string;

  // Relationships
  @OneToMany(() => Proposal, (proposal) => proposal.job)
  proposals: Proposal[];

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deadline: Date;
}

