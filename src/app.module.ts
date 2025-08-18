import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CategoriesModule } from './categories/categories.module';
import { JobsModule } from './jobs/jobs.module';
import { User } from './users/entities/user.entity';
import { Job } from './jobs/entities/job.entity';
import { Category } from './categories/entities/category.entity';
import { ProposalsModule } from './proposals/proposals.module';
import { Proposal } from './proposals/entities/proposal.entity';
import { ContractsModule } from './contracts/contracts.module';
import { MessagesModule } from './messages/messages.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { Contract } from './contracts/entities/contract.entity';
import { Message } from './messages/entities/message.entity';
import { Review } from './reviews/entities/review.entity';
import { Transaction } from './transactions/entities/transaction.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '5432'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Job, Category,Proposal,Role,Permission,Contract,Message,Review,Transaction], // ✅ all your entities
        synchronize: true,
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    
    UsersModule,
    MailModule,
    AuthModule,
    CategoriesModule,
    JobsModule,
    ProposalsModule,
    ContractsModule,
     MessagesModule, ReviewsModule, TransactionsModule, RolesModule, PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
