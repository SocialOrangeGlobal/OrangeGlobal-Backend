# Orange Global — Bulk Job Seeder

Adds all 10 trending IT roles (5 Japan → Australia, 5 China → Australia) to your database in one run, instead of using the "Post a New Job" modal 10 times.

## Files

- `jobs-data.js` — first batch (10 jobs): Full-Stack/Software Developer, Cloud/DevOps Engineer, AI/ML Engineer, Site Reliability Engineer, Cybersecurity Engineer/Analyst (Japan) + ICT Business Analyst, Data Scientist, Cybersecurity Specialist, QA/Test Automation Engineer, Cloud Solutions Architect, UX/UI Designer (China).
- `jobs-data-batch2.js` — second batch (10 new jobs, no overlap with batch 1): Data Engineer, Blockchain Developer, IT Project Manager, Embedded Systems Engineer, Frontend Engineer (Japan) + BI Developer, Salesforce Developer/Admin, ERP/SAP Consultant, Database Administrator, Network Engineer (China).
- `seed-jobs.js` — Prisma script that reads a jobs-data file and upserts each job into your `Job` table. Defaults to `jobs-data.js`; pass a filename to target a different batch.

## Setup (one-time)

1. Copy both files into your Hire Platform's repo, e.g. into a `/scripts` folder next to `prisma/schema.prisma`.
2. Open `prisma/schema.prisma` and find your `Job` model.
3. Open `seed-jobs.js` and edit the `FIELD_MAP` object near the top — the left side is fixed (matches `jobs-data.js`), the right side should match your actual column names. For example, if your schema uses `title` instead of `jobTitle`, change:
   ```js
   jobTitle: "jobTitle",
   ```
   to:
   ```js
   jobTitle: "title",
   ```
4. If `requirements` / `benefits` are stored as a Postgres `String[]` in Prisma, leave `STRINGIFY_ARRAYS = false`. If they're stored as a single text/JSON field instead, set it to `true`.
5. If you don't track `targetRegion` or `anzscoCode` as columns, just delete those two lines from `FIELD_MAP` — they'll be skipped automatically.

## Run it

```bash
npx prisma generate
node scripts/seed-jobs.js
```

To run the second batch (10 new roles, distinct from what's already published):

```bash
node scripts/seed-jobs.js jobs-data-batch2.js
```

You'll see one line per job:

```
Created: Full-Stack / Software Developer (Japan)
Created: Cloud / DevOps Engineer (Japan)
...
Created: UX/UI Designer (Product Design) (China)

Done.
```

## Re-running

Safe to run again — it looks up each job by `jobTitle + companyName + targetRegion` and updates it instead of duplicating. If your schema has a proper unique field (like a `slug`), swap that into the `where` clause inside `upsertJob()` in `seed-jobs.js` for a cleaner match.

## Adding more jobs later

Just add another object to the `jobs` array in `jobs-data.js` following the same shape, then re-run the script.
