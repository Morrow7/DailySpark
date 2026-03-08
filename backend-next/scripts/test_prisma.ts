import { PrismaClient } from '@prisma/client';

console.log('Instantiating PrismaClient...');
try {
  const prisma = new PrismaClient({
    log: ['info']
  });
  console.log('Success!');
  prisma.$disconnect();
} catch (e) {
  console.error('Failed:', e);
}
