import {
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
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../../common/decorators/auth.decorators';

class ServiceDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  returnIntervalDays?: number | null;
}

class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  returnIntervalDays?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
class ServicesService {
  constructor(private prisma: PrismaService) {}

  list(companyId: string, activeOnly = false) {
    return this.prisma.service.findMany({
      where: { companyId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  create(companyId: string, dto: ServiceDto) {
    return this.prisma.service.create({ data: { companyId, ...dto } });
  }

  async update(companyId: string, id: string, dto: UpdateServiceDto) {
    const result = await this.prisma.service.updateMany({
      where: { id, companyId },
      data: dto,
    });
    if (!result.count) throw new NotFoundException('Serviço não encontrado');
    return this.prisma.service.findUniqueOrThrow({ where: { id } });
  }

  async deactivate(companyId: string, id: string) {
    const result = await this.prisma.service.updateMany({
      where: { id, companyId },
      data: { isActive: false },
    });
    if (!result.count) throw new NotFoundException('Serviço não encontrado');
    return { message: 'Serviço desativado' };
  }
}

@Controller('services')
class ServicesController {
  constructor(private service: ServicesService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.service.list(u.companyId);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: ServiceDto) {
    return this.service.create(u.companyId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.service.update(u.companyId, id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.deactivate(u.companyId, id);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
