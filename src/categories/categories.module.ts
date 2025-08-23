import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/users/users.service';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService,JwtService, JwtAuthGuard,UserService],
  exports: [CategoriesService, JwtAuthGuard],
})
export class CategoriesModule {}
