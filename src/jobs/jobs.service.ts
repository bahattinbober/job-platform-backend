import { AiService } from '../ai/ai.service';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ConnectionsService } from '../connections/connections.service';

export interface ResumeMatch {
  id: string;
  fileName: string;
  distance: number;
}

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  async create(dto: CreateJobDto) {
    const { companyName, ...jobData } = dto;

    const company = await this.prisma.company.upsert({
      where: { name: companyName },
      create: { name: companyName },
      update: {},
    });

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        companyId: company.id,
      },
    });

    try {
      const embedding = await this.aiService.generateEmbedding(dto.description);

      if (embedding.length > 0) {
        const embeddingString = `[${embedding.join(',')}]`;
        await this.prisma.$executeRaw`
          UPDATE "Job"
          SET "embedding" = ${embeddingString}::vector
          WHERE "id" = ${job.id}
        `;
      } else {
        console.warn(
          `Job ${job.id} için embedding üretilemedi, boş bırakıldı.`,
        );
      }
    } catch (error) {
      console.error(`Job ${job.id} embedding hatası:`, error);
      // Embedding başarısız olsa da job oluşturma işlemi devam eder
    }

    return this.prisma.job.findUnique({
      where: { id: job.id },
      include: { company: true },
    });
  }

  async findAll(filters: {
    location?: string;
    remoteType?: string;
    search?: string;
  }) {
    return this.prisma.job.findMany({
      where: {
        location: filters.location
          ? { contains: filters.location, mode: 'insensitive' }
          : undefined,
        remoteType: filters.remoteType,
        title: filters.search
          ? { contains: filters.search, mode: 'insensitive' }
          : undefined,
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('İlan bulunamadı');
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.findOne(id);

    return this.prisma.job.update({
      where: { id },
      data: dto,
      include: { company: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.job.delete({
      where: { id },
    });
  }

  async findMatchingResumes(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('İlan bulunamadı');
    }

    const matches = await this.prisma.$queryRaw<ResumeMatch[]>`
    SELECT r.id, r."fileName",
           r.embedding <=> j.embedding AS distance
    FROM "Resume" r, "Job" j
    WHERE j.id = ${jobId}
      AND r.embedding IS NOT NULL
      AND j.embedding IS NOT NULL
    ORDER BY distance ASC
    LIMIT 10
  `;

    return matches;
  }
  async findNetworkAtJob(userId: string, jobId: string) {
    const job = await this.findOne(jobId);

    const connections = await this.connectionsService.findConnectionsAtCompany(
      userId,
      job.company.name,
    );

    return {
      companyName: job.company.name,
      connectionCount: connections.length,
      connections,
    };
  }
  async generateReferralMessage(
    userId: string,
    jobId: string,
    connectionId: string,
  ) {
    const job = await this.findOne(jobId);

    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Bağlantı bulunamadı');
    }

    if (connection.userId !== userId) {
      throw new ForbiddenException('Bu bağlantı size ait değil');
    }

    const resume = await this.prisma.resume.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const skillsObject = resume?.parsedSkills as Record<string, unknown> | null;
    const userSkills = skillsObject
      ? ['programming_languages', 'backend', 'frontend']
          .flatMap((category) =>
            Array.isArray(skillsObject[category])
              ? (skillsObject[category] as string[])
              : [],
          )
          .slice(0, 5)
      : [];

    const message = await this.aiService.generateReferralMessage({
      connectionFirstName: connection.firstName,
      companyName: job.company.name,
      jobTitle: job.title,
      userSkills,
    });

    return { message };
  }
}
