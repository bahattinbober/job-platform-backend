import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface JobMatch {
  id: string;
  title: string;
  location: string | null;
  distance: number;
}

@Injectable()
export class ResumesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async saveResume(userId: string, file: Express.Multer.File) {
    const rawText = await this.extractText(file.path, file.mimetype);

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        rawText,
      },
    });

    if (rawText) {
      const parsedSkills = await this.aiService.extractResumeSkills(rawText);
      const embedding = await this.aiService.generateEmbedding(rawText);
      const embeddingString = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        UPDATE "Resume"
        SET "embedding" = ${embeddingString}::vector,
            "parsedSkills" = ${JSON.stringify(parsedSkills)}::jsonb
        WHERE "id" = ${resume.id}
      `;

      return this.prisma.resume.findUnique({ where: { id: resume.id } });
    }

    return resume;
  }

  async findAllForUser(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteResume(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('CV bulunamadı');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('Bu CV size ait değil');
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    return this.prisma.resume.delete({
      where: { id: resumeId },
    });
  }

  async findMatchingJobs(resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('CV bulunamadı');
    }

    const matches = await this.prisma.$queryRaw<JobMatch[]>`
      SELECT j.id, j.title, j.location,
             j.embedding <=> r.embedding AS distance
      FROM "Job" j, "Resume" r
      WHERE r.id = ${resumeId}
        AND j.embedding IS NOT NULL
        AND r.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT 10
    `;

    return matches;
  }

  private async extractText(
    filePath: string,
    mimetype: string,
  ): Promise<string> {
    const buffer = fs.readFileSync(filePath);

    if (mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    }

    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    return '';
  }
}
