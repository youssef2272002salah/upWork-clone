import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not found in request.');
    }

    // ✅ Role check
    if (requiredRoles && !requiredRoles.includes(user.role.name)) {
      throw new ForbiddenException('You do not have the required role.');
    }

    // ✅ Permission check
    if (requiredPermissions) {
      const userPermissions = user.role?.permissions?.map(p => p.name) || [];
      const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

      if (!hasAllPermissions) {
        throw new ForbiddenException('You do not have the required permissions.');
      }
    }

    return true;
  }
}
