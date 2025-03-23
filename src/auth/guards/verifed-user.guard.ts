import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {

        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublic) return true;

        // Get the current request and user from the context
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // If the user is not authenticated, throw ForbiddenException
        if (!user) {
            throw new ForbiddenException('You must be logged in');
        }

        // Check if the route is 'verify-otp' (no need to check verification for this route)
        const isVerifyOtpRoute = request.url.includes('verify-otp');
        if (isVerifyOtpRoute) {
            return true;  // Allow access to the verify-otp route regardless of the verification status
        }

        // Enforce that the user is verified for all other routes
        if (!user.isVerified) {
            throw new ForbiddenException('Your account is not verified. Please verify your email.');
        }

        return true;
    }
}
