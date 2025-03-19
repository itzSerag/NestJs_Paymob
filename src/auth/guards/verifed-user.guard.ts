import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {

        // Check if the route is public (skip verification) -- > @Public()
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('You must be logged in');
        }

        if (!user.isVerified) {
            throw new ForbiddenException('Your account is not verified. Please verify your email.');
        }

        return true;
    }
}
