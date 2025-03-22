import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    const request = context.switchToHttp().getRequest();
    const user = request.user;


    // if this route is public then return true
    if (this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ])) {
      return true;
    }

    if (!user) {
      return false; // User is not authenticated
    }

    // If no specific roles are required, allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has one of the required roles
    return requiredRoles.includes(user.role);
  }
}
