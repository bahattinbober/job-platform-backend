import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job as BullJob } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface JobEmbeddingData {
  jobId: string;
  description: string;
}

@Processor('jobs-processing')
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: BullJob<JobEmbeddingData>): Promise<void> {
    const { jobId, description } = job.data;
    this.logger.log(`Processing embedding for job ${jobId} (bull job ${job.id})`);

    try {
      const embedding = await this.aiService.generateEmbedding(description);
      const embeddingString = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        UPDATE "Job"
        SET "embedding" = ${embeddingString}::vector
        WHERE "id" = ${jobId}
      `;

      this.logger.log(
        `Embedding stored for job ${jobId}: ${embedding.length} dimensions`,
      );
    } catch (error) {
      this.logger.error(
        `Embedding generation failed for job ${jobId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}