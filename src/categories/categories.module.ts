import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  // here we user auth module cause in category service we use jwt service to decode token and inside
  //  jwt service we use user service to get user by id 
  // AND we use user module to use user service


  
  imports: [AuthModule,UsersModule, TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
