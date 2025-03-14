import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    // If no specific data is requested, return the entire user object
    if (!data) {
      return request.user;
    }

    // Return a specific property of the user object
    return request.user[data];
  },
);
