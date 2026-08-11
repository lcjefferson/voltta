const { PrismaClient, RoleCode } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.role.upsert({
      where: { code: RoleCode.ADMIN },
      update: { name: 'Administrador' },
      create: { code: RoleCode.ADMIN, name: 'Administrador' },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.BARBEIRO },
      update: { name: 'Barbeiro' },
      create: { code: RoleCode.BARBEIRO, name: 'Barbeiro' },
    }),
    prisma.role.upsert({
      where: { code: RoleCode.RECEPCIONISTA },
      update: { name: 'Recepcionista' },
      create: { code: RoleCode.RECEPCIONISTA, name: 'Recepcionista' },
    }),
  ]);
  console.log('[voltta-api] Roles seeded (ADMIN, BARBEIRO, RECEPCIONISTA)');
}

main()
  .catch((e) => {
    console.error('[voltta-api] Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
