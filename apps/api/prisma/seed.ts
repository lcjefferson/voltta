import { PrismaClient, RoleCode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.role.upsert({ where: { code: RoleCode.ADMIN }, update: { name: 'Administrador' }, create: { code: RoleCode.ADMIN, name: 'Administrador' } }),
    prisma.role.upsert({ where: { code: RoleCode.BARBEIRO }, update: { name: 'Barbeiro' }, create: { code: RoleCode.BARBEIRO, name: 'Barbeiro' } }),
    prisma.role.upsert({ where: { code: RoleCode.RECEPCIONISTA }, update: { name: 'Recepcionista' }, create: { code: RoleCode.RECEPCIONISTA, name: 'Recepcionista' } }),
  ]);
}
main().finally(() => prisma.$disconnect());
