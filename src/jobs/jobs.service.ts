import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobDto) {
    const { companyName, ...jobData } = dto;

    const company = await this.prisma.company.upsert({
      where: { name: companyName },
      create: { name: companyName },
      update: {},
    });

    return this.prisma.job.create({
      data: {
        ...jobData,
        companyId: company.id,
      },
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
