import { AiService } from '../ai/ai.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
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
}
