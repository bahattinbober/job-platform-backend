import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { ConnectionsModule } from '../connections/connections.module';
import { JobsProcessor } from './jobs.processor';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    ConnectionsModule,
    BullModule.registerQueue({
      name: 'jobs-processing',
    }),
  ],
  providers: [JobsService, JobsProcessor],
  controllers: [JobsController],
})
export class JobsModule {}