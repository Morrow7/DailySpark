
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Monthly VIP',
      description: 'Unlock all premium features for 30 days.',
      price: 19.00,
      duration: 30,
      level: 'vip'
    },
    {
      name: 'Quarterly VIP',
      description: 'Unlock all premium features for 90 days. Save 10%.',
      price: 49.00,
      duration: 90,
      level: 'vip'
    },
    {
      name: 'Yearly VIP',
      description: 'Unlock all premium features for 365 days. Best Value!',
      price: 168.00,
      duration: 365,
      level: 'vip'
    },
    {
      name: 'Lifetime SVIP',
      description: 'Permanent access to all features.',
      price: 398.00,
      duration: 36500, // 100 years
      level: 'svip'
    }
  ];

  for (const plan of plans) {
    // Upsert based on name to avoid duplicates
    const existing = await prisma.membershipPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
        await prisma.membershipPlan.create({ data: plan });
        console.log(`Created plan: ${plan.name}`);
    } else {
        console.log(`Plan already exists: ${plan.name}`);
    }
  }

  console.log('Seeded membership plans');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
