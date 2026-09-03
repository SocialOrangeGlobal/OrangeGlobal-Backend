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

async function inspectSpam() {
  console.log("🔍 Analyzing contact_messages in database...\n");

  const total = await prisma.contactMessage.count();
  console.log(`Total messages in database: ${total}`);

  // Fetch recent 50 messages to see patterns
  const recent = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log("\n--- Sample of Recent 20 Messages ---");
  for (const m of recent.slice(0, 20)) {
    console.log(
      `[${m.id.substring(0, 8)}] [${m.type}] Name: "${m.fullName}", Email: "${m.email}", Date: ${m.createdAt.toISOString()}`
    );
    console.log(`  Subject: "${m.subject}"`);
    console.log(`  Message: "${m.message.substring(0, 80)}..."\n`);
  }
}

inspectSpam()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
