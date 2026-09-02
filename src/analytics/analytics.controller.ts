import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getApplicationSummary(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getApplicationSummary(req.user.userId);
  }
}