import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job as BullJob } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface JobEmbeddingData {
  jobId: string;
  description: string;
}

@Processor('jobs-processing')
export class JobsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: BullJob<JobEmbeddingData>): Promise<void> {
    const { jobId, description } = job.data;

    const embedding = await this.aiService.generateEmbedding(description);
    const embeddingString = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      UPDATE "Job"
      SET "embedding" = ${embeddingString}::vector
      WHERE "id" = ${jobId}
    `;
  }
}