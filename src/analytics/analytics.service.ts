import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '../../generated/prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicationSummary(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      select: { status: true },
    });

    const total = applications.length;

    const statusCounts = applications.reduce(
      (counts, app) => {
        counts[app.status] = (counts[app.status] ?? 0) + 1;
        return counts;
      },
      {} as Record<ApplicationStatus, number>,
    );

    const respondedStatuses: ApplicationStatus[] = [
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
      ApplicationStatus.REJECTED,
    ];

    const responded = applications.filter((app) =>
      respondedStatuses.includes(app.status),
    ).length;

    const interviews = statusCounts[ApplicationStatus.INTERVIEW] ?? 0;
    const offers = statusCounts[ApplicationStatus.OFFER] ?? 0;
    const applied = applications.filter(
      (app) => app.status !== ApplicationStatus.SAVED,
    ).length;

    return {
      total,
      byStatus: statusCounts,
      applied,
      responseRate: applied > 0 ? Math.round((responded / applied) * 100) : 0,
      interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      offers,
    };
  }
}
