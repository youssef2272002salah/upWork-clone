import { Role } from 'src/roles/entities/role.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  passwordChangedAt?: Date;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  facebookId?: string;
  isVerified: boolean;
  role: Role;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  phone?: string;
  hourlyRate?: number;
  skills: string[];
  portfolioUrl?: string;
  country?: string;
  city?: string;
  timezone?: string;
  balance: number;
  jobs?: Job[];
  proposals?: Proposal[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
