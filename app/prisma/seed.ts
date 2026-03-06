import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.engagement.upsert({
    where: { id: "seed-engagement-demo" },
    update: {},
    create: {
      id: "seed-engagement-demo",
      orgId: "seed-org",
      createdByUserId: "seed-user",
      clientName: "Quarterhill",
      objective:
        "Surface hidden workload, quantify effort, and identify automation opportunities.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
