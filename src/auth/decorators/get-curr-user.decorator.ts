import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: keyof any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        
        // in case if we only need specific data from the user
        return data ? request.user?.[data] : request.user;
    },
);
