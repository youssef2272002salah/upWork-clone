import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Job } from 'src/jobs/entities/job.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // SERIAL PRIMARY KEY

  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  @Exclude()
  password: string; // password_hash

  @Column({ type: 'text', nullable: true })
  @Exclude()
  passwordChangedAt: Date; // password_changed_at

  @Column({ type: 'text', nullable: true })
  verificationToken: string; // verification_token

  @Column({ type: 'text', nullable: true })
  passwordResetToken: string; // password_reset_token

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpires: Date; // password_reset_expires

  @Column({ type: 'text', unique: true, nullable: true })
  googleId: string; // google_id

  @Column({ type: 'text', unique: true, nullable: true })
  facebookId: string; // facebook_id

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  // Freelancer specific fields
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'text', array: true, default: [] })
  skills: string[];

  @Column({ type: 'text', nullable: true })
  portfolioUrl: string;

  // Location
  @Column({ type: 'text', nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  city: string;

  @Column({ type: 'text', nullable: true })
  timezone: string;

  // Financial
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  balance: number;

  // Relationships
  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];

  @OneToMany(() => Proposal, (proposal) => proposal.freelancer)
  proposals: Proposal[];

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLogin: Date;
}
