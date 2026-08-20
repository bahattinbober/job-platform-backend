import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async createTestUser(email: string) {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash: 'temp-not-real-hash',
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}