import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // no permissions required
    }

    const { user } = context.switchToHttp().getRequest();
    console.log(user)

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // user.role comes from your JWT payload or eager-loaded entity
    const userPermissions = (user.role as Role).permissions?.map((p) => p.name) || [];
    console.log(userPermissions)

    // check if user has ALL required permissions
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
