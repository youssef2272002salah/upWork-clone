import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';
import { RoleController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Module({
  controllers: [RoleController],
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
