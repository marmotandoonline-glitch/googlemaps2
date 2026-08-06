import { PrismaClient } from '@prisma/client';
import { INITIAL_LEADS } from '../src/data/mockLeads';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock leads...');
  for (const l of INITIAL_LEADS) {
    await prisma.lead.upsert({
      where: { placeId: l.placeId || '' },
      update: {},
      create: {
        id: l.id,
        name: l.name,
        category: l.category,
        phone: l.phone || '',
        website: l.website || '',
        profileUrl: l.profileUrl || '',
        placeId: l.placeId,
        rating: l.rating || 0,
        reviewsCount: l.reviewsCount || 0,
        address: l.address || '',
        neighborhood: l.neighborhood || '',
        city: l.city || '',
        state: l.state || '',
        description: l.description || '',
        photosCount: l.photosCount || 0,
        hasHours: Boolean(l.hasHours),
        hasServices: Boolean(l.hasServices),
        hasProducts: Boolean(l.hasProducts),
        score: l.score || 0,
        stage: l.stage || 'novo',
        dealValue: l.dealValue || 1200,
        clientPortalToken: l.clientPortalToken,
        createdAt: new Date(l.createdAt),
        updatedAt: new Date(l.updatedAt),
      },
    });
  }

  // create default agency + admin user for dev
  const agencyName = 'PerfilPro Agência (Dev)';
  let agency = await prisma.agency.findFirst({ where: { name: agencyName } });
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: agencyName } });
    console.log('Created agency', agency.id);
  }

  const adminEmail = 'admin@perfilpro.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 12);
    const created = await prisma.user.create({ data: { email: adminEmail, name: 'Admin PerfilPro', passwordHash: hash, role: 'ADMIN', agencyId: agency.id } });
    console.log('Created admin user', created.email);
  } else {
    console.log('Admin user already exists');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
