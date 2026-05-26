import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration, { validationSchema } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TalentModule } from './talent/talent.module';
import { EmployerModule } from './employer/employer.module';
import { PrismaModule } from './prisma/prisma.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ContactModule } from './contact/contact.module';
import { JobsModule } from './jobs/jobs.module';
import { AtsModule } from './ats/ats.module';
import { ApplicationsModule } from './applications/applications.module';
import { DashboardModule } from './dashboard/dashboard.module';


@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
    }),

    // ─── Database (Prisma / Supabase) ────────────────────────────────────────
    PrismaModule,

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),

    // ─── Feature Modules ──────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    TalentModule,
    EmployerModule,
    MaintenanceModule,
    ContactModule,
    JobsModule,
    AtsModule,
    ApplicationsModule,
    DashboardModule,
  ],
})
export class AppModule { }