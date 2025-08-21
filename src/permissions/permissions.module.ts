import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { permission } from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService], // Exporting the service for use in other modules
  imports: [TypeOrmModule.forFeature([Permission])], // Import any other modules if needed, e.g., TypeOrmModule for database access
})
export class PermissionsModule {}
