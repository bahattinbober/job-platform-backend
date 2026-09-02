import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
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
    @InjectQueue('resumes-processing') private readonly resumesQueue: Queue,
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
      await this.resumesQueue.add('process-resume', {
        resumeId: resume.id,
        rawText,
      });
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