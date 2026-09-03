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

// Bot message regex: a single string with no spaces and length >= 8
function isBotMessage(msg) {
  // If message is random single word of mixed characters with no spaces
  const singleRandomWord = /^[A-Za-z0-9]{8,}$/.test(msg.trim());
  return singleRandomWord;
}

// Bot name regex: single word without spaces
function isBotName(name) {
  return /^[A-Z][a-z]{3,}$/.test(name.trim()) && !name.includes(" ");
}

async function analyzeAll() {
  const allMessages = await prisma.contactMessage.findMany({
    include: {
      replies: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total messages in DB: ${allMessages.length}`);

  const botQueryEmails = new Set();
  const botMessageIds = [];
  const realMessages = [];

  for (const m of allMessages) {
    // If it has replies from admin/talent or attached to a registered user, it's real
    if (m.userId || m.replies.length > 0) {
      realMessages.push(m);
      continue;
    }

    // Check if it's a bot general query
    if (m.type === 'GENERAL_QUERY' && isBotMessage(m.message)) {
      botMessageIds.push(m.id);
      botQueryEmails.add(m.email.toLowerCase());
    } else if (m.type === 'NEWSLETTER') {
      // We will check if the newsletter is from a bot email
      // We'll evaluate in step 2
    } else {
      realMessages.push(m);
    }
  }

  // Now identify all newsletter entries that came from the identified bot emails
  const botNewsletterIds = [];
  for (const m of allMessages) {
    if (m.type === 'NEWSLETTER' && botQueryEmails.has(m.email.toLowerCase())) {
      botNewsletterIds.push(m.id);
    } else if (m.type === 'NEWSLETTER' && !botQueryEmails.has(m.email.toLowerCase())) {
      // Check if it's an isolated newsletter
      realMessages.push(m);
    }
  }

  const totalBotEntries = botMessageIds.length + botNewsletterIds.length;
  console.log(`\nDetected Bot General Queries: ${botMessageIds.length}`);
  console.log(`Detected Bot Paired Newsletters: ${botNewsletterIds.length}`);
  console.log(`Total Bot Entries to Clean: ${totalBotEntries}`);
  console.log(`Potential Real User Messages / Newsletters: ${allMessages.length - totalBotEntries}`);

  console.log("\n--- Real / Non-Bot Messages Found ---");
  for (const r of realMessages.filter(m => m.type !== 'NEWSLETTER')) {
    console.log(`[${r.id.substring(0, 8)}] [${r.type}] Name: "${r.fullName}", Email: "${r.email}"`);
    console.log(`  Message: "${r.message.substring(0, 100)}..."\n`);
  }
}

analyzeAll()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
