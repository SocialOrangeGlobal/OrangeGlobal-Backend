import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

@Injectable()
export class MaintenanceService implements OnModuleInit {
  private readonly logger = new Logger(MaintenanceService.name);
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const supabaseUrl = this.config.get<string>('supabase.url');
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');

    if (supabaseUrl && serviceRoleKey) {
      this.supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
        },
        realtime: {
          transport: ws as any,
        },
      });
    }
  }

  async onModuleInit() {
    if (!this.supabase) {
      this.logger.warn('Supabase client not initialized. Skipping bucket creation.');
      return;
    }

    const requiredBuckets = ['profile-pictures', 'resumes', 'talent-documents', 'companyLogo'];
    this.logger.log('Checking and initializing Supabase storage buckets...');

    try {
      const { data: existingBuckets, error: listError } = await this.supabase.storage.listBuckets();
      if (listError) {
        this.logger.error(`Failed to list buckets: ${listError.message}`);
        return;
      }

      const existingNames = existingBuckets?.map(b => b.name) || [];

      for (const bucket of requiredBuckets) {
        if (!existingNames.includes(bucket)) {
          this.logger.log(`Creating missing storage bucket: ${bucket}`);
          const { error: createError } = await this.supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          if (createError) {
            this.logger.error(`Failed to create bucket ${bucket}: ${createError.message}`);
          } else {
            this.logger.log(`Successfully created public bucket: ${bucket}`);
          }
        } else {
          this.logger.log(`Storage bucket already exists: ${bucket}`);
        }
      }

      this.logger.log('Configuring Storage Row-Level Security (RLS) policies for public access...');
      try {
        await this.prisma.$executeRawUnsafe(`
          DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
          DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
          DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
          DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

          CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT TO public WITH CHECK (true);
          CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO public USING (true);
          CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO public USING (true);
          CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO public USING (true);
        `);
        this.logger.log('Successfully configured Storage RLS policies.');
      } catch (sqlErr: any) {
        this.logger.error(`Failed to configure Storage RLS policies: ${sqlErr.message}`);
      }
    } catch (err: any) {
      this.logger.error(`Unexpected error initializing buckets: ${err.message}`);
    }
  }

  async resetAll(): Promise<{ message: string }> {
    this.logger.warn('RESSETING SYSTEM: Clearing database and storage...');

    try {
      // 1. Reset Database
      await this.resetDatabase();

      // 2. Reset Storage
      await this.resetStorage();

      return { message: 'System reset successfully. All database records and storage files have been cleared.' };
    } catch (error) {
      this.logger.error(`Failed to reset system: ${error.message}`);
      throw error;
    }
  }

  private async resetDatabase() {
    this.logger.log('Clearing database tables...');

    // Order matters due to foreign keys, or we can use truncate with cascade
    // In Prisma with Postgres, we can use a raw query to truncate all tables
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_migrations';`;

    const tables = tablenames
      .map(({ tablename }) => `"${tablename}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      this.logger.log('Database cleared successfully.');
    } catch (error) {
      this.logger.error(`Error truncating tables: ${error.message}`);
      throw error;
    }
  }

  private async resetStorage() {
    if (!this.supabase) {
      this.logger.warn('Supabase client not initialized. Skipping storage reset.');
      return;
    }

    const buckets = ['profile-pictures', 'resumes', 'talent-documents', 'companyLogo'];
    this.logger.log(`Clearing storage buckets: ${buckets.join(', ')}...`);

    for (const bucket of buckets) {
      try {
        // List all files in the bucket
        const { data: files, error: listError } = await this.supabase.storage
          .from(bucket)
          .list();

        if (listError) {
          this.logger.error(`Error listing files in bucket ${bucket}: ${listError.message}`);
          continue;
        }

        if (files && files.length > 0) {
          const filePaths = files.map((file) => file.name);
          const { error: deleteError } = await this.supabase.storage
            .from(bucket)
            .remove(filePaths);

          if (deleteError) {
            this.logger.error(`Error deleting files from bucket ${bucket}: ${deleteError.message}`);
          } else {
            this.logger.log(`Cleared ${files.length} files from bucket ${bucket}.`);
          }
        } else {
          this.logger.log(`Bucket ${bucket} is already empty.`);
        }
      } catch (error) {
        this.logger.error(`Unexpected error clearing bucket ${bucket}: ${error.message}`);
      }
    }
  }
}
