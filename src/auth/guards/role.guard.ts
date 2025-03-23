import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the route is public
    if (this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ])) {
      return true;
    }

    // If the user is not authenticated, throw UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // If no specific roles are required, allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // If the user does not have the required role, throw ForbiddenException
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User does not have the required role');
    }

    return true;
  }
}
