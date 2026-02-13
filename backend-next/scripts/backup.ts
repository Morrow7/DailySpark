
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://root:1234@localhost:3306/dailyspark",
    },
  },
});

async function backup() {
  console.log('Starting backup...');
  
  try {
    const users = await prisma.user.findMany();
    const words = await prisma.word.findMany();
    const articles = await prisma.article.findMany();

    const data = {
      timestamp: new Date().toISOString(),
      users,
      words,
      articles
    };

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(path.join(backupDir, filename), JSON.stringify(data, null, 2));
    
    console.log(`Backup saved to backups/${filename}`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
