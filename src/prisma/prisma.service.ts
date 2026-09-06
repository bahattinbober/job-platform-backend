import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const logger = new Logger('PrismaService');

const connectionString = process.env.DATABASE_URL ?? '';
const dbUrl = new URL(connectionString);
const isRds = dbUrl.hostname.endsWith('rds.amazonaws.com');

logger.log(
  `Connecting to host="${dbUrl.hostname}" port="${dbUrl.port}" db="${dbUrl.pathname.slice(1)}"`,
);

const adapter = new PrismaPg({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 5432),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  ssl: isRds ? { rejectUnauthorized: false } : undefined,
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    logger.log('Disconnecting from database');
    await this.$disconnect();
  }
}
