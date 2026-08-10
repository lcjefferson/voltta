import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import { RoleCode } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthUser,
  CurrentUser,
  Roles,
} from '../../common/decorators/auth.decorators';

class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(RoleCode)
  role?: RoleCode;

  @IsOptional()
  @IsBoolean()
  isProfessional?: boolean;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RoleCode)
  role?: RoleCode;

  @IsOptional()
  @IsBoolean()
  isProfessional?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  isProfessional: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, code: true, name: true } },
} as const;

@Injectable()
class UsersService {
  constructor(private prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: userSelect,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  private async assertProfessionalLimit(
    companyId: string,
    excludeUserId?: string,
  ) {
    const count = await this.prisma.user.count({
      where: {
        companyId,
        isProfessional: true,
        isActive: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
    if (count >= 2) {
      throw new BadRequestException(
        'Limite de 2 profissionais ativos atingido no plano atual',
      );
    }
  }

  async create(companyId: string, dto: CreateUserDto) {
    const roleCode = dto.role ?? RoleCode.BARBEIRO;
    const isProfessional = dto.isProfessional ?? roleCode === RoleCode.BARBEIRO;

    if (isProfessional) {
      await this.assertProfessionalLimit(companyId);
    }

    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) throw new BadRequestException('Papel inválido');

    try {
      return await this.prisma.user.create({
        data: {
          companyId,
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(dto.password, 12),
          roleId: role.id,
          isProfessional,
        },
        select: userSelect,
      });
    } catch {
      throw new BadRequestException('E-mail já cadastrado nesta empresa');
    }
  }

  async update(companyId: string, id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    const nextIsProfessional = dto.isProfessional ?? existing.isProfessional;
    const nextIsActive = dto.isActive ?? existing.isActive;
    const becomingActiveProfessional =
      nextIsProfessional &&
      nextIsActive &&
      (!existing.isProfessional || !existing.isActive);

    if (becomingActiveProfessional) {
      await this.assertProfessionalLimit(companyId, id);
    }

    let roleId: string | undefined;
    if (dto.role) {
      const role = await this.prisma.role.findUnique({ where: { code: dto.role } });
      if (!role) throw new BadRequestException('Papel inválido');
      roleId = role.id;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.isProfessional !== undefined
          ? { isProfessional: dto.isProfessional }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(roleId ? { roleId } : {}),
        ...(dto.password
          ? { passwordHash: await bcrypt.hash(dto.password, 12) }
          : {}),
      },
      select: userSelect,
    });
  }

  async deactivate(companyId: string, id: string) {
    const result = await this.prisma.user.updateMany({
      where: { id, companyId },
      data: { isActive: false },
    });
    if (!result.count) throw new NotFoundException('Usuário não encontrado');
    return { message: 'Usuário desativado' };
  }
}

@Controller('users')
class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.service.list(u.companyId);
  }

  @Roles(RoleCode.ADMIN)
  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateUserDto) {
    return this.service.create(u.companyId, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(u.companyId, id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.deactivate(u.companyId, id);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
