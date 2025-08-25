import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    const permissions = permissionIds?.length
      ? await this.permissionRepository.findByIds(permissionIds)
      : [];

    const role = this.roleRepository.create({
      name,
      description,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    const { name, description, permissionIds } = updateRoleDto;

    if (name) role.name = name;
    if (description) role.description = description;

    if (permissionIds) {
      role.permissions = await this.permissionRepository.findByIds(permissionIds);
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.findByIds(permissionIds);

    role.permissions.push(...permissions);
    return this.roleRepository.save(role);
  }
  async removePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {  
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.findByIds(permissionIds);

    role.permissions = role.permissions.filter(
      (perm) => !permissions.some((p) => p.id === perm.id),
    );

    return this.roleRepository.save(role);
  }
}
