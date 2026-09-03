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

async function checkReplies() {
  const msg = await prisma.contactMessage.findFirst({
    where: { fullName: "Yommxlkzb" },
    include: { replies: true },
  });

  console.log("Message id:", msg.id);
  console.log("UserId:", msg.userId);
  console.log("Replies count:", msg.replies.length);
  console.log("Replies:", msg.replies);

  const totalReplies = await prisma.contactReply.count();
  console.log("Total replies in DB:", totalReplies);
}

checkReplies()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
