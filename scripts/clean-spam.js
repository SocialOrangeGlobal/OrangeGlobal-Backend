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

const isDryRun = !process.argv.includes("--confirm");

// Check if a message body is the characteristic bot random string
function isBotMessageBody(msg) {
  if (!msg) return false;
  const trimmed = msg.trim();
  // Single continuous token without spaces and length >= 6
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) && !trimmed.includes(" ");
}

async function cleanSpam() {
  console.log("====================================================");
  console.log(
    isDryRun
      ? "       🔍 SPAM CLEANUP PREVIEW (DRY RUN)           "
      : "       🗑️  EXECUTING LIVE SPAM CLEANUP              "
  );
  console.log("====================================================\n");

  const allMessages = await prisma.contactMessage.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const botIds = new Set();
  const botEmails = new Set();
  const realMessages = [];

  // Pass 1: Identify bot enquiries
  for (const m of allMessages) {
    // Preserve any real candidate Direct Messages or registered user messages
    if (m.userId || m.type === "DIRECT_MESSAGE") {
      realMessages.push(m);
      continue;
    }

    // Check for bot random string message
    if (isBotMessageBody(m.message)) {
      botIds.add(m.id);
      botEmails.add(m.email.toLowerCase().trim());
    } else if (m.type !== "NEWSLETTER") {
      realMessages.push(m);
    }
  }

  // Pass 2: Identify paired bot newsletter subscriptions
  for (const m of allMessages) {
    if (m.userId || m.type === "DIRECT_MESSAGE") {
      continue;
    }

    if (m.type === "NEWSLETTER") {
      if (botEmails.has(m.email.toLowerCase().trim())) {
        botIds.add(m.id);
      } else {
        realMessages.push(m);
      }
    }
  }

  console.log(`Total messages in Database:     ${allMessages.length}`);
  console.log(`Identified Bot Spam to delete:   ${botIds.size}`);
  console.log(`Preserved Real Inquiries/Chats:  ${allMessages.length - botIds.size}\n`);

  console.log("📋 Sample of Preserved Real Human Inquiries & Chats:");
  const realSample = realMessages.slice(0, 15);
  for (const r of realSample) {
    console.log(
      `  • [${r.type}] "${r.fullName}" (${r.email}): "${r.message.replace(/\n/g, " ").substring(0, 65)}..."`
    );
  }

  console.log("\n📋 Sample of Bot Spam Records to be Deleted:");
  const botSample = allMessages.filter((m) => botIds.has(m.id)).slice(0, 10);
  for (const b of botSample) {
    console.log(
      `  • [${b.type}] "${b.fullName}" (${b.email}): "${b.message.substring(0, 40)}"`
    );
  }

  if (isDryRun) {
    console.log("\n====================================================");
    console.log("⚠️  DRY RUN COMPLETED — NO DATA WAS DELETED.");
    console.log(
      "👉 To execute the cleanup, run:\n   node scripts/clean-spam.js --confirm"
    );
    console.log("====================================================\n");
  } else {
    console.log("\n⏳ Deleting identified bot spam records from database...");

    const deleteResult = await prisma.contactMessage.deleteMany({
      where: {
        id: { in: Array.from(botIds) },
      },
    });

    console.log(`\n🎉 CLEANUP COMPLETE!`);
    console.log(`Deleted ${deleteResult.count} bot spam records.`);
    const remaining = await prisma.contactMessage.count();
    console.log(`Clean database count: ${remaining} real inquiries and messages.`);
  }
}

cleanSpam()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
