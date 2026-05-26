import { Module } from '@nestjs/common';
import { AtsService } from './ats.service';
import { ResumeParserService } from './resume-parser.service';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming PrismaModule is in src/prisma/

@Module({
  imports: [PrismaModule],
  providers: [AtsService, ResumeParserService],
  exports: [AtsService],
})
export class AtsModule { }
