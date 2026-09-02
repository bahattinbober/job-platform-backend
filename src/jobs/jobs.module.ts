import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
  imports: [PrismaModule, AiModule, ConnectionsModule],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
