const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '.prisma', 'client'));
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const studio = await prisma.studio.upsert({
    where: { slug: 'gpower-demo' },
    update: {},
    create: {
      name: 'GPower Studio Demo',
      slug: 'gpower-demo',
      email: 'contato@gpowerstudio.com.br',
      phone: '(11) 99999-0000',
      address: 'Rua das Artes, 123',
      city: 'São Paulo',
      state: 'SP',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      isActive: true,
    },
  });
  console.log(`✅ Estúdio criado: ${studio.name}`);

  const adminPassword = await bcrypt.hash('Admin@123!', 10);
  const artistPassword = await bcrypt.hash('Artist@123!', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@gpowerstudio.com.br' },
    update: {},
    create: {
      email: 'owner@gpowerstudio.com.br',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'GPower',
      role: 'OWNER',
      isActive: true,
      studioId: studio.id,
    },
  });
  console.log(`✅ Admin criado: ${owner.email} / Admin@123!`);

  console.log('\n✨ Seed concluído!');
  console.log('\n📋 Credenciais:');
  console.log('   Admin:  owner@gpowerstudio.com.br / Admin@123!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
