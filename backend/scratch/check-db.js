const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const propertyCount = await prisma.property.count();
    const fiscalPeriodCount = await prisma.fiscalPeriod.count();

    console.log('--- DB Connection Check ---');
    console.log('Users:', userCount);
    console.log('Accounts:', accountCount);
    console.log('Properties:', propertyCount);
    console.log('Fiscal Periods:', fiscalPeriodCount);

    if (accountCount === 0) {
      console.log('Warning: No accounts found. Seeding is required.');
    }
  } catch (error) {
    console.error('Error connecting to DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
