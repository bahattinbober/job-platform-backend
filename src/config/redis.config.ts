import { Logger } from '@nestjs/common';
import type { ConnectionOptions } from 'bullmq';

const logger = new Logger('RedisConfig');

export function buildRedisConnection(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    const parsed = new URL(redisUrl);

    const connection: ConnectionOptions = {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
    };

    if (parsed.username) {
      connection.username = decodeURIComponent(parsed.username);
    }
    if (parsed.password) {
      connection.password = decodeURIComponent(parsed.password);
    }
    if (parsed.protocol === 'rediss:') {
      connection.tls = {};
    }

    logger.log(
      `Redis connection using REDIS_URL (host=${connection.host}, port=${connection.port})`,
    );

    return connection;
  }

  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = Number(process.env.REDIS_PORT ?? 6379);

  const connection: ConnectionOptions = { host, port };

  if (process.env.REDIS_PASSWORD) {
    connection.password = process.env.REDIS_PASSWORD;
  }

  logger.log(
    `Redis connection using REDIS_HOST/REDIS_PORT (host=${host}, port=${port})`,
  );

  return connection;
}
