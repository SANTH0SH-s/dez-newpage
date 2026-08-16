import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("1. CHECK ADMIN ACCOUNT DATA");
  try {
    const admins = await prisma.adminAccount.findMany();
    console.log(`AdminAccount count: ${admins.length}`);
    if (admins.length > 0) {
      console.log("Admin emails:");
      admins.forEach(a => console.log(`- ${a.email} (Role: ${a.role})`));
    }
  } catch (err: any) {
    console.log(`Error reading AdminAccount: ${err.message}`);
  }

  console.log("\n3. CHECK WHETHER REQUIRED SEEDED DATA EXISTS");
  const models = [
    'service', 'package', 'packageFeature', 'pricingComponent',
    'question', 'questionOption', 'validationRule', 'multiplier',
    'fAQItem', 'globalSettings', 'estimate', 'enquiry', 'auditLog'
  ];

  for (const model of models) {
    try {
      const count = await (prisma as any)[model].count();
      console.log(`${model}: ${count}`);
    } catch (err: any) {
      console.log(`${model}: Error - ${err.message}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
