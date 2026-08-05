import { PrismaClient } from '@prisma/client';
import seedData from '../../src/data/mockLeads';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock leads...');
  const INITIAL_LEADS = seedData.INITIAL_LEADS || seedData;
  for (const l of INITIAL_LEADS) {
    await prisma.lead.upsert({
      where: { placeId: l.placeId || '' },
      update: {},
      create: {
        id: l.id,
        name: l.name,
        category: l.category,
        phone: l.phone,
        website: l.website,
        profileUrl: l.profileUrl,
        placeId: l.placeId,
        rating: l.rating,
        reviewsCount: l.reviewsCount,
        address: l.address,
        neighborhood: l.neighborhood,
        city: l.city,
        state: l.state,
        description: l.description,
        photosCount: l.photosCount,
        hasHours: l.hasHours,
        hasServices: l.hasServices,
        hasProducts: l.hasProducts,
        score: l.score,
        stage: l.stage,
        dealValue: l.dealValue,
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
    const hash = await bcrypt.hash(password, 10);
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
