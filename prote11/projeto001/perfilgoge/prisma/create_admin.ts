import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@perfilpro.com';
  const password = 'AdminPassword2026!';
  
  console.log('Verificando se usuário admin já existe...');
  const existing = await prisma.user.findUnique({ where: { email } });
  
  let agency = await prisma.agency.findFirst();
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: 'Agência Principal PerfilPro' } });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, agencyId: agency.id }
    });
    console.log('Usuário admin atualizado com sucesso!');
  } else {
    await prisma.user.create({
      data: {
        email,
        name: 'Administrador PerfilPro',
        passwordHash,
        role: 'ADMIN',
        agencyId: agency.id
      }
    });
    console.log('Usuário admin criado com sucesso!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
