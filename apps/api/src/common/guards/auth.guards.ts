import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { RoleCode } from '@prisma/client';
import {
  AuthUser,
  ALLOW_TRIAL_EXPIRED_KEY,
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from '../decorators/auth.decorators';
import { PrismaService } from '../../prisma/prisma.service';
import { isTrialExpired, TRIAL_EXPIRED_MESSAGE } from '../trial';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Não autenticado');
    }
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException();
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Permissão insuficiente');
    }
    return true;
  }
}

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user) throw new UnauthorizedException();
    if (!user.platformAdmin) {
      throw new ForbiddenException(
        'Acesso restrito à operação da plataforma',
      );
    }
    return true;
  }
}

@Injectable()
export class TrialLockGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const allowed = this.reflector.getAllAndOverride<boolean>(
      ALLOW_TRIAL_EXPIRED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowed) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user?.companyId) return true;
    if (user.platformAdmin) return true;

    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
      select: { status: true, trialEndsAt: true },
    });
    if (!company) return true;
    if (isTrialExpired(company.status, company.trialEndsAt)) {
      throw new ForbiddenException(TRIAL_EXPIRED_MESSAGE);
    }
    return true;
  }
}
