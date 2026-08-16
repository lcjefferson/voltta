import { PrismaClient, RoleCode } from '@prisma/client';

/** Prefer `node prisma/seed.cjs` in production (no ts-node). */
const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.role.upsert({ where: { code: RoleCode.ADMIN }, update: { name: 'Administrador' }, create: { code: RoleCode.ADMIN, name: 'Administrador' } }),
    prisma.role.upsert({ where: { code: RoleCode.BARBEIRO }, update: { name: 'Profissional' }, create: { code: RoleCode.BARBEIRO, name: 'Profissional' } }),
    prisma.role.upsert({ where: { code: RoleCode.RECEPCIONISTA }, update: { name: 'Recepcionista' }, create: { code: RoleCode.RECEPCIONISTA, name: 'Recepcionista' } }),
  ]);
}
main().finally(() => prisma.$disconnect());
