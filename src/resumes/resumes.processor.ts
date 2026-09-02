import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface ResumeProcessingData {
  resumeId: string;
  rawText: string;
}

@Processor('resumes-processing')
export class ResumesProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: Job<ResumeProcessingData>): Promise<void> {
    const { resumeId, rawText } = job.data;

    const parsedSkills = await this.aiService.extractResumeSkills(rawText);
    const embedding = await this.aiService.generateEmbedding(rawText);
    const embeddingString = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      UPDATE "Resume"
      SET "embedding" = ${embeddingString}::vector,
          "parsedSkills" = ${JSON.stringify(parsedSkills)}::jsonb
      WHERE "id" = ${resumeId}
    `;
  }
}