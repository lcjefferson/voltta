import { Body, Controller, Get, Injectable, Module, Patch, Post, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { RoleCode, Prisma } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { Public, CurrentUser, AuthUser } from '../../common/decorators/auth.decorators';
import { DEFAULT_BUSINESS_HOURS } from '../../common/business-hours';
import { MailService } from '../../providers/mail/mail.service';

class SignupDto { @IsString() name!: string; @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; @IsString() companyName!: string; }
class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
class RefreshDto { @IsString() refreshToken!: string; }
class ForgotDto { @IsEmail() email!: string; }
class ResetDto { @IsString() token!: string; @IsString() @MinLength(6) password!: string; }
class ChangeDto { @IsString() currentPassword!: string; @IsString() @MinLength(6) newPassword!: string; }
class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
    });
  }

  validate(payload: {
    userId?: string;
    companyId?: string;
    email?: string;
    role?: RoleCode;
    sub?: string;
  }): AuthUser {
    if (!payload?.userId || !payload?.companyId || !payload?.role || !payload?.email) {
      throw new UnauthorizedException('Não autenticado');
    }
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email,
      role: payload.role,
    };
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}
  private slug(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  private async tokens(user: { id: string; companyId: string; email: string; role: { code: RoleCode }; company: { name: string; slug: string } }) {
    const payload: AuthUser = { userId: user.id, companyId: user.companyId, email: user.email, role: user.role.code };
    const accessToken = await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret', expiresIn: '12h' });
    const refreshToken = await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret', expiresIn: '30d' });
    await this.prisma.refreshToken.create({ data: { companyId: user.companyId, userId: user.id, tokenHash: await bcrypt.hash(refreshToken, 10), expiresAt: new Date(Date.now() + 30 * 86400000) } });
    return { accessToken, refreshToken, user: { id: user.id, name: (user as unknown as { name: string }).name, email: user.email, role: user.role.code, companyId: user.companyId, companyName: user.company.name, companySlug: user.company.slug } };
  }
  async signup(dto: SignupDto) {
    const base = this.slug(dto.companyName) || 'empresa';
    let slug = base; let n = 1;
    while (await this.prisma.company.findUnique({ where: { slug } })) slug = `${base}-${++n}`;
    const admin = await this.prisma.role.findUnique({ where: { code: RoleCode.ADMIN } });
    if (!admin) throw new BadRequestException('Papéis não inicializados. Execute o seed.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        slug,
        trialEndsAt: new Date(Date.now() + 7 * 86400000),
        businessHours: DEFAULT_BUSINESS_HOURS as unknown as Prisma.InputJsonValue,
        users: {
          create: {
            name: dto.name,
            email: dto.email.toLowerCase(),
            passwordHash,
            roleId: admin.id,
            isProfessional: true,
          },
        },
        automationRules: { create: defaultRules() },
        settings: { create: { key: 'onboarding', value: { completed: false } } },
      },
      include: { users: { include: { role: true } } },
    });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: company.users[0].id }, include: { role: true, company: true } });
    return this.tokens(user);
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), isActive: true, company: { status: { not: 'SUSPENDED' } } }, include: { role: true, company: true }, orderBy: { createdAt: 'asc' } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('E-mail ou senha inválidos');
    return this.tokens(user);
  }
  async refresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(token, { secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret' });
      const records = await this.prisma.refreshToken.findMany({ where: { userId: payload.userId, revokedAt: null, expiresAt: { gt: new Date() } } });
      if (!(await Promise.all(records.map((r) => bcrypt.compare(token, r.tokenHash)))).some(Boolean)) throw new Error();
      await this.prisma.refreshToken.updateMany({ where: { userId: payload.userId, revokedAt: null }, data: { revokedAt: new Date() } });
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: payload.userId }, include: { role: true, company: true } }); return this.tokens(user);
    } catch { throw new UnauthorizedException('Token de atualização inválido'); }
  }
  async logout(userId: string) { await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); return { message: 'Sessão encerrada' }; }

  async forgot(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), isActive: true },
    });
    if (user) {
      const token = await this.jwt.signAsync(
        { userId: user.id, purpose: 'password-reset' },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret',
          expiresIn: '1h',
        },
      );
      await this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: await bcrypt.hash(token, 10),
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      const webUrl = (
        this.config.get<string>('WEB_URL') || 'http://localhost:3000'
      ).replace(/\/$/, '');
      const resetUrl = `${webUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await this.mail.sendPasswordReset(user.email, resetUrl);
    }
    return { message: 'Se o e-mail existir, enviaremos as instruções.' };
  }

  async reset(dto: ResetDto) {
    const items = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });
    const found = (
      await Promise.all(
        items.map(async (x) => ({
          x,
          ok: await bcrypt.compare(dto.token, x.tokenHash),
        })),
      )
    ).find((x) => x.ok);
    if (!found) throw new BadRequestException('Token inválido ou expirado');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: found.x.userId },
        data: { passwordHash: await bcrypt.hash(dto.password, 12) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: found.x.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: found.x.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    this.logger.log(`Senha redefinida para user ${found.x.userId}`);
    return { message: 'Senha alterada com sucesso' };
  }

  async change(userId: string, dto: ChangeDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Senha atual inválida');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) },
    });
    return { message: 'Senha alterada com sucesso' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: true, company: true },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.code,
      companyId: user.companyId,
      companyName: user.company.name,
      companySlug: user.company.slug,
      companyPhone: user.company.phone,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: true, company: true },
    });

    const nextName = dto.name?.trim();
    const nextEmail = dto.email?.toLowerCase().trim();
    const emailChanging =
      !!nextEmail && nextEmail !== user.email.toLowerCase();

    if (emailChanging) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Informe a senha atual para alterar o e-mail',
        );
      }
      if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
        throw new BadRequestException('Senha atual inválida');
      }
      const taken = await this.prisma.user.findFirst({
        where: {
          email: nextEmail,
          id: { not: userId },
          isActive: true,
        },
      });
      if (taken) {
        throw new BadRequestException('Este e-mail já está em uso');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(nextName ? { name: nextName } : {}),
        ...(emailChanging ? { email: nextEmail } : {}),
      },
      include: { role: true, company: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role.code,
      companyId: updated.companyId,
      companyName: updated.company.name,
      companySlug: updated.company.slug,
      companyPhone: updated.company.phone,
    };
  }
}
const defaultRules = () => [
  {
    name: 'A1 Confirmação',
    trigger: 'A1',
    actions: [
      {
        type: 'whatsapp',
        template:
          'Olá {{nome}}\nSeu horário está confirmado para {{data}} às {{hora}}.',
      },
    ],
  },
  {
    name: 'A2 Lembrete 24h',
    trigger: 'A2',
    actions: [
      {
        type: 'whatsapp',
        template:
          'Olá {{nome}}\nLembrete: seu horário é amanhã, {{data}} às {{hora}}.',
      },
    ],
  },
  {
    name: 'A3 Lembrete 2h',
    trigger: 'A3',
    actions: [
      {
        type: 'whatsapp',
        template:
          'Olá {{nome}}\nSeu horário é hoje às {{hora}}. Te esperamos!',
      },
    ],
  },
  {
    name: 'A4 Retorno',
    trigger: 'A4',
    actions: [
      {
        type: 'whatsapp',
        template:
          'Olá {{nome}}\nEstá na hora de renovar seu visual.\nClique aqui: {{link}}',
      },
    ],
  },
  {
    name: 'A5 Aniversário',
    trigger: 'A5',
    actions: [
      {
        type: 'whatsapp',
        template:
          'Olá {{nome}}\nFeliz aniversário! Que tal agendar um horário especial? {{link}}',
      },
    ],
  },
];

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @Public() @Post('signup') signup(@Body() dto: SignupDto) { return this.service.signup(dto); }
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.service.login(dto); }
  @Public() @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.service.refresh(dto.refreshToken); }
  @Post('logout') logout(@CurrentUser() user: AuthUser) { return this.service.logout(user.userId); }
  @Public() @Post('forgot-password') forgot(@Body() dto: ForgotDto) { return this.service.forgot(dto.email); }
  @Public() @Post('reset-password') reset(@Body() dto: ResetDto) { return this.service.reset(dto); }
  @Post('change-password') change(@CurrentUser() user: AuthUser, @Body() dto: ChangeDto) { return this.service.change(user.userId, dto); }
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.service.me(user.userId); }
  @Patch('me') updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) { return this.service.updateProfile(user.userId, dto); }
}
@Module({ imports: [PrismaModule, PassportModule, JwtModule.register({})], controllers: [AuthController], providers: [AuthService, JwtStrategy, MailService], exports: [AuthService] })
export class AuthModule {}
