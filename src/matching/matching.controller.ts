import { Controller, Get, Param } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':resumeId/:jobId')
  calculateMatchScore(
    @Param('resumeId') resumeId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.matchingService.calculateMatchScore(resumeId, jobId);
  }
}
