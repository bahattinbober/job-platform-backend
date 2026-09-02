import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });

    if (!job) {
      throw new NotFoundException('İlan bulunamadı');
    }

    return this.prisma.application.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId: dto.jobId,
        },
      },
      create: {
        userId,
        jobId: dto.jobId,
        status: dto.status,
        notes: dto.notes,
      },
      update: {
        status: dto.status,
        notes: dto.notes,
      },
      include: { job: { include: { company: true } } },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { job: { include: { company: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } } },
    });

    if (!application) {
      throw new NotFoundException('Başvuru bulunamadı');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Bu başvuru size ait değil');
    }

    return application;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);

    return this.prisma.application.update({
      where: { id },
      data: dto,
      include: { job: { include: { company: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.application.delete({
      where: { id },
    });
  }
}