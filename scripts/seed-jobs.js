/**
 * seed-jobs.js
 * -----------------------------------------------------------------------
 * Bulk-inserts the 10 jobs from jobs-data.js into your Postgres database
 * via Prisma, so you don't have to click through the "Post a New Job"
 * modal 10 times.
 *
 * SETUP (one-time):
 *   1. Copy this file and jobs-data.js into your Next.js/Prisma project
 *      root (wherever prisma/schema.prisma lives), e.g. /scripts/
 *   2. npm install (if @prisma/client isn't already installed)
 *   3. npx prisma generate   (make sure client is up to date)
 *   4. Adjust FIELD_MAP below to match your actual `Job` model's field
 *      names — open prisma/schema.prisma and compare.
 *
 * RUN:
 *   node scripts/seed-jobs.js
 *
 * SAFE TO RE-RUN:
 *   Uses upsert on (jobTitle + companyName + targetRegion) so running it
 *   twice updates existing rows instead of duplicating them. Adjust the
 *   `where` clause in upsertJob() if your schema has a proper unique
 *   constraint (e.g. a slug field) instead.
 * -----------------------------------------------------------------------
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

// Pass a data file as an argument, e.g.:
//   node scripts/seed-jobs.js jobs-data-batch2.js
// Defaults to jobs-data.js if no argument is given.
const dataFile = process.argv[2] || "./jobs-data";
const { jobs } = require(dataFile.startsWith(".") || dataFile.startsWith("/") ? dataFile : `./${dataFile}`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * FIELD_MAP
 * ---------
 * Left side  = key name used in jobs-data.js (don't change these)
 * Right side = the actual field name in YOUR Prisma `Job` model
 *
 * Example: if your schema has `title` instead of `jobTitle`, change
 * the line below to:  jobTitle: "title",
 *
 * If a field doesn't exist in your schema yet, either:
 *   (a) add it to schema.prisma + run `npx prisma migrate dev`, or
 *   (b) remove that line here and it'll be skipped on insert.
 */
const FIELD_MAP = {
  jobTitle: "title",
  companyName: "company",
  industry: "industry",
  jobCategory: "category",
  location: "location",
  workMode: "mode",
  positionType: "type",
  vacancies: "vacancies",
  salaryMin: "salaryMin",
  salaryMax: "salaryMax",
  currency: "salaryCurrency",
  // targetRegion and anzscoCode don't exist in the schema — skipped
  description: "description",
  requirements: "requirements", // expects a Json column
  benefits: "benefits", // expects a Json column
  publish: "isPublished",
};

/**
 * If your `requirements` / `benefits` columns are plain Postgres text[]
 * (Prisma: String[]), leave STRINGIFY_ARRAYS = false.
 * If they're stored as a single JSON/text blob instead, set this to true
 * and they'll be joined into one string before insert.
 */
const STRINGIFY_ARRAYS = false;

function mapJobToPrismaData(job) {
  const data = {};
  for (const [sourceKey, targetField] of Object.entries(FIELD_MAP)) {
    if (!(sourceKey in job)) continue;
    let value = job[sourceKey];

    if (STRINGIFY_ARRAYS && Array.isArray(value)) {
      value = value.join("\n");
    }

    data[targetField] = value;
  }
  return data;
}

async function upsertJob(job) {
  const data = mapJobToPrismaData(job);

  // Adjust this `where` clause to match a real unique constraint in your
  // schema if you have one (e.g. a `slug` field). This composite lookup
  // is a reasonable fallback if you don't.
  const existing = await prisma.job.findFirst({
    where: {
      title: job.jobTitle,
      company: job.companyName,
    },
  });

  if (existing) {
    await prisma.job.update({
      where: { id: existing.id },
      data,
    });
    console.log(`Updated: ${job.jobTitle} (${job.targetRegion})`);
  } else {
    await prisma.job.create({ data });
    console.log(`Created: ${job.jobTitle} (${job.targetRegion})`);
  }
}

async function main() {
  console.log(`Seeding ${jobs.length} jobs from ${dataFile}...\n`);

  for (const job of jobs) {
    try {
      await upsertJob(job);
    } catch (err) {
      console.error(`Failed on "${job.jobTitle}" (${job.targetRegion}):`, err.message);
    }
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
