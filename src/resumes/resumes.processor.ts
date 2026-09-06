import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface ResumeProcessingData {
  resumeId: string;
  rawText: string;
}

@Processor('resumes-processing')
export class ResumesProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumesProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: Job<ResumeProcessingData>): Promise<void> {
    const { resumeId, rawText } = job.data;
    this.logger.log(`Processing resume ${resumeId} (bull job ${job.id})`);

    try {
      const parsedSkills = await this.aiService.extractResumeSkills(rawText);
      const embedding = await this.aiService.generateEmbedding(rawText);
      const embeddingString = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        UPDATE "Resume"
        SET "embedding" = ${embeddingString}::vector,
            "parsedSkills" = ${JSON.stringify(parsedSkills)}::jsonb
        WHERE "id" = ${resumeId}
      `;

      this.logger.log(
        `Resume ${resumeId} processed: embedding ${embedding.length} dimensions, skills extracted`,
      );
    } catch (error) {
      this.logger.error(
        `Resume processing failed for ${resumeId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}