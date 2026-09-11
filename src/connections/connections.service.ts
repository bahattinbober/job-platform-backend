import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

interface CsvRow {
  'First Name'?: string;
  'Last Name'?: string;
  URL?: string;
  'Email Address'?: string;
  Company?: string;
  Position?: string;
  'Connected On'?: string;
}

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async importCsv(userId: string, fileBuffer: Buffer) {
    const csvText = fileBuffer.toString('utf-8');

    const records: CsvRow[] = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    let imported = 0;
    let skipped = 0;

    for (const row of records) {
      const firstName = row['First Name']?.trim();
      const lastName = row['Last Name']?.trim();

      if (!firstName || !lastName) {
        skipped++;
        continue;
      }

      const companyName = row['Company']?.trim() || null;
      const position = row['Position']?.trim() || null;
      const profileUrl = row['URL']?.trim() || null;
      const connectedAtRaw = row['Connected On']?.trim();
      const connectedAt = connectedAtRaw ? new Date(connectedAtRaw) : null;

      await this.prisma.connection.upsert({
        where: {
          userId_firstName_lastName_companyName: {
            userId,
            firstName,
            lastName,
            companyName: companyName ?? '',
          },
        },
        create: {
          userId,
          firstName,
          lastName,
          companyName,
          position,
          profileUrl,
          connectedAt:
            connectedAt && !isNaN(connectedAt.getTime()) ? connectedAt : null,
        },
        update: {
          position,
          profileUrl,
          connectedAt:
            connectedAt && !isNaN(connectedAt.getTime()) ? connectedAt : null,
        },
      });

      imported++;
    }

    return { imported, skipped, total: records.length };
  }
  async findConnectionsAtCompany(userId: string, companyName: string) {
    return this.prisma.connection.findMany({
      where: {
        userId,
        companyName: {
          equals: companyName.trim(),
          mode: 'insensitive',
        },
      },
      orderBy: { connectedAt: 'desc' },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.connection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
