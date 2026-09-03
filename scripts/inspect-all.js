const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inspectAll() {
  const all = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const summary = {
    total: all.length,
    byType: {},
  };

  for (const m of all) {
    summary.byType[m.type] = (summary.byType[m.type] || 0) + 1;
  }

  console.log("Breakdown by Type:", summary);

  console.log("\nSample 100 entries:");
  for (let i = 0; i < Math.min(all.length, 100); i++) {
    const m = all[i];
    console.log(`${i+1}. [${m.type}] Name: "${m.fullName}" | Email: "${m.email}" | Msg: "${m.message.replace(/\n/g, ' ').substring(0, 50)}"`);
  }
}

inspectAll()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
