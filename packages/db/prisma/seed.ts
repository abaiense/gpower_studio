import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  await prisma.$transaction(async (tx) => {
    // ─── Estúdio de teste ───────────────────────────────────────────────────
    const studio = await tx.studio.upsert({
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
    console.log(`✅ Estúdio criado: ${studio.name} (slug: ${studio.slug})`);

    // ─── Artista principal ──────────────────────────────────────────────────
    const artist = await tx.artist.upsert({
      where: { id: 'seed-artist-001' },
      update: {},
      create: {
        id: 'seed-artist-001',
        firstName: 'João',
        lastName: 'Tatuador',
        bio: 'Especialista em blackwork e realismo com 10 anos de experiência.',
        instagram: '@joaotattoo',
        styles: ['blackwork', 'realismo', 'fineline'],
        isActive: true,
        studioId: studio.id,
        commissionType: 'PERCENTAGE',
        commissionValue: 50,
      },
    });
    console.log(`✅ Artista criado: ${artist.firstName} ${artist.lastName}`);

    // ─── Horários do artista (seg–sex, 9h–18h) ─────────────────────────────
    const workDays = [1, 2, 3, 4, 5]; // segunda a sexta
    for (const dayOfWeek of workDays) {
      await tx.artistSchedule.upsert({
        where: { artistId_dayOfWeek: { artistId: artist.id, dayOfWeek } },
        update: {},
        create: {
          artistId: artist.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
        },
      });
    }
    console.log(`✅ Horários do artista configurados (seg–sex, 09:00–18:00)`);

    // ─── User owner ─────────────────────────────────────────────────────────
    const owner = await tx.user.upsert({
      where: { email: 'owner@gpowerstudio.com.br' },
      update: {},
      create: {
        email: 'owner@gpowerstudio.com.br',
        passwordHash: await hashPassword('Admin@123!'),
        firstName: 'Admin',
        lastName: 'GPower',
        role: 'OWNER',
        isActive: true,
        studioId: studio.id,
      },
    });
    console.log(`✅ User owner criado: ${owner.email}`);

    // ─── User artista (vinculado ao artista criado) ─────────────────────────
    const artistUser = await tx.user.upsert({
      where: { email: 'joao@gpowerstudio.com.br' },
      update: {},
      create: {
        email: 'joao@gpowerstudio.com.br',
        passwordHash: await hashPassword('Artist@123!'),
        firstName: 'João',
        lastName: 'Tatuador',
        role: 'ARTIST',
        isActive: true,
        studioId: studio.id,
        artistId: artist.id,
      },
    });
    console.log(`✅ User artista criado: ${artistUser.email}`);

    // ─── Serviços básicos ────────────────────────────────────────────────────
    const services = [
      {
        name: 'Tatuagem – Sessão (até 4h)',
        description: 'Sessão padrão de tatuagem de até 4 horas.',
        category: 'TATTOO' as const,
        durationMin: 240,
        basePrice: null,
      },
      {
        name: 'Tatuagem – Mini (até 1h)',
        description: 'Mini tatuagem de até 1 hora.',
        category: 'TATTOO' as const,
        durationMin: 60,
        basePrice: 200,
      },
      {
        name: 'Consulta / Orçamento',
        description: 'Consulta inicial para orçamento e planejamento do projeto.',
        category: 'CONSULTATION' as const,
        durationMin: 30,
        basePrice: 0,
      },
      {
        name: 'Retoque',
        description: 'Retoque de tatuagem anterior.',
        category: 'TOUCH_UP' as const,
        durationMin: 60,
        basePrice: 0,
      },
      {
        name: 'Piercing',
        description: 'Instalação de piercing com material incluso.',
        category: 'PIERCING' as const,
        durationMin: 15,
        basePrice: 150,
      },
    ];

    for (const svc of services) {
      await tx.service.upsert({
        where: {
          id: `seed-svc-${svc.category.toLowerCase()}-${svc.durationMin}`,
        },
        update: {},
        create: {
          id: `seed-svc-${svc.category.toLowerCase()}-${svc.durationMin}`,
          ...svc,
          isActive: true,
          studioId: studio.id,
        },
      });
    }
    console.log(`✅ ${services.length} serviços criados`);

    // ─── Cliente de exemplo ──────────────────────────────────────────────────
    const client = await tx.client.upsert({
      where: { id: 'seed-client-001' },
      update: {},
      create: {
        id: 'seed-client-001',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@exemplo.com',
        phone: '(11) 98888-7777',
        birthDate: new Date('1990-05-15'),
        notes: 'Cliente frequente. Prefere atendimento no período da tarde.',
        studioId: studio.id,
      },
    });
    console.log(`✅ Cliente exemplo criado: ${client.firstName} ${client.lastName}`);
  });

  console.log('\n✨ Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Owner:   owner@gpowerstudio.com.br / Admin@123!');
  console.log('   Artista: joao@gpowerstudio.com.br  / Artist@123!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
