import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResumesModule } from './resumes/resumes.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';
import { MatchingModule } from './matching/matching.module';
import { ConnectionsModule } from './connections/connections.module';
import { ApplicationsModule } from './applications/applications.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
     BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    BullModule.registerQueue(
      { name: 'jobs-processing' },
      { name: 'resumes-processing' },
    ),
    PrismaModule,
    AuthModule,
    UsersModule,
    ResumesModule,
    AiModule,
    JobsModule,
    MatchingModule,
    ConnectionsModule,
    ApplicationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
