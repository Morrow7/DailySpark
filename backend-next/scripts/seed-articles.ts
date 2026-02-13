import 'dotenv/config';
import { prisma } from '../src/lib/db';

const ARTICLES = [
  {
    title: 'The Secret Life of Rabbits',
    content: `Rabbits are small mammals in the family Leporidae of the order Lagomorpha. They are found in several parts of the world. 
    
    Rabbits are famous for their reproductive speed. A female rabbit can have many babies in a year. They live in groups called warrens, which are underground tunnels.
    
    Rabbits are herbivores, which means they eat plants. They love grass, leafy weeds, and vegetables. Their long ears help them detect predators from far away.`,
    category: 'Nature',
    level: 'Beginner',
    readTime: '3 min'
  },
  {
    title: 'Cloud Computing Basics',
    content: `Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.
    
    Large clouds often have functions distributed over multiple locations, each of which is a data center. Cloud computing relies on sharing of resources to achieve coherence and economies of scale.`,
    category: 'Technology',
    level: 'Intermediate',
    readTime: '5 min'
  },
  {
    title: 'The History of Tea',
    content: `Tea is an aromatic beverage prepared by pouring hot or boiling water over cured or fresh leaves of Camellia sinensis, an evergreen shrub native to East Asia.
    
    After water, it is the most widely consumed drink in the world. There are many different types of tea; some, like Darjeeling and Chinese greens, have a cooling, slightly bitter, and astringent flavour, while others have vastly different profiles that include sweet, nutty, floral, or grassy notes.`,
    category: 'Culture',
    level: 'Advanced',
    readTime: '4 min'
  }
];

async function main() {
  console.log('Seeding articles...');
  
  // Ensure we have a user to attribute articles to (usually admin)
  let admin = await prisma.user.findFirst({ where: { email: 'admin@dailyspark.com' } });
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@dailyspark.com',
        password: 'hashed_password_placeholder', // Not used for real login in this context
        name: 'Admin'
      }
    });
  }

  for (const article of ARTICLES) {
    await prisma.article.create({
      data: {
        ...article,
        authorId: admin.id
      }
    });
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
