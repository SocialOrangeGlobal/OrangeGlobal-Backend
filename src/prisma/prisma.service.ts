import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const pool = new Pool({
      connectionString: config.get<string>('database.url'),
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: config.get<string>('env') === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Auto-seed admin user if not present
    const adminEmail = 'admin@orangeglobal.co';
    const adminUser = await this.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      const passwordHash = await bcrypt.hash('admin@123', 12);
      await this.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: UserRole.ADMIN,
          isEmailVerified: true,
          isActive: true,
          adminProfile: {
            create: {
              firstName: "Orange",
              lastName: "Global",
              phone: "+09 363 398 46",
              bio: "Super Administrator",
              country: "Australia",
              cityState: "Melbourne, Victoria",
              postalCode: "3000",
              taxId: "TAX987654"
            }
          }
        },
      });
      console.log('Successfully seeded default admin user and profile: admin@orangeglobal.co');
    } else {
      const existingProfile = await this.adminProfile.findUnique({
        where: { userId: adminUser.id },
      });
      if (!existingProfile) {
        await this.adminProfile.create({
          data: {
            userId: adminUser.id,
            firstName: "Orange",
            lastName: "Global",
            phone: "+09 363 398 46",
            bio: "Super Administrator",
            country: "Australia",
            cityState: "Melbourne, Victoria",
            postalCode: "3000",
            taxId: "TAX987654"
          }
        });
        console.log('Successfully seeded admin profile for existing admin user');
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
