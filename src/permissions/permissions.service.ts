import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  // ✅ Bulk create
  async createBulk(createPermissionsDto: CreatePermissionDto[]) {
    const permissions = this.permissionRepository.create(createPermissionsDto);
    return this.permissionRepository.save(permissions);
  }

  async findAll() {
    return this.permissionRepository.find();
  }

  async findOne(id: number) {
    return this.permissionRepository.findOneBy({ id });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.permissionRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.permissionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
