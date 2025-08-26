import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import { Proposal } from './entities/proposal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';


// authmoule is imported to use jwt service to decode token and get user from token
// user module is imported to use user service to get user by id
@Module({
  imports:[AuthModule,UsersModule, TypeOrmModule.forFeature([Job,User,Proposal])],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
