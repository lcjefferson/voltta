import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { RoleCode } from '@prisma/client';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ALLOW_TRIAL_EXPIRED_KEY = 'allowTrialExpired';
export const AllowTrialExpired = () => SetMetadata(ALLOW_TRIAL_EXPIRED_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);

export class AuthUser {
  userId!: string;
  companyId!: string;
  role!: RoleCode;
  email!: string;
  platformAdmin?: boolean;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
