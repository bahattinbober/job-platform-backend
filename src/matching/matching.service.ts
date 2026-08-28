import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SemanticResult {
  distance: number;
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateMatchScore(resumeId: string, jobId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) {
      throw new NotFoundException('CV bulunamadı');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('İlan bulunamadı');
    }

    const semanticScore = await this.getSemanticScore(resumeId, jobId);
    const skillScore = this.getSkillScore(resume.parsedSkills, job.skills);
    const experienceScore = this.getExperienceScore(
      resume.parsedSkills,
      job.experienceLevel,
    );

    const overallScore = Math.round(
      semanticScore * 0.5 + skillScore * 0.35 + experienceScore * 0.15,
    );

    return {
      resumeId,
      jobId,
      overallScore,
      breakdown: {
        semanticScore,
        skillScore,
        experienceScore,
      },
    };
  }

  private async getSemanticScore(
    resumeId: string,
    jobId: string,
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<SemanticResult[]>`
      SELECT r.embedding <=> j.embedding AS distance
      FROM "Resume" r, "Job" j
      WHERE r.id = ${resumeId} AND j.id = ${jobId}
        AND r.embedding IS NOT NULL AND j.embedding IS NOT NULL
    `;

    if (result.length === 0) {
      return 0;
    }

    const distance = result[0].distance;
    const similarity = 1 - distance;
    return Math.max(0, Math.round(similarity * 100));
  }

  private getSkillScore(parsedSkills: unknown, jobSkills: string[]): number {
    if (!parsedSkills || jobSkills.length === 0) {
      return 0;
    }

    const skillCategories = [
      'programming_languages',
      'backend',
      'frontend',
      'databases',
      'devops',
      'cloud',
      'ai_ml',
    ];

    const skillsObject = parsedSkills as Record<string, unknown>;
    const resumeSkillsFlat = skillCategories
      .flatMap((category) =>
        Array.isArray(skillsObject[category])
          ? (skillsObject[category] as string[])
          : [],
      )
      .map((skill) => skill.toLowerCase());

    const jobSkillsLower = jobSkills.map((skill) => skill.toLowerCase());

    const matchedSkills = jobSkillsLower.filter((skill) =>
      resumeSkillsFlat.includes(skill),
    );

    return Math.round((matchedSkills.length / jobSkillsLower.length) * 100);
  }

  private getExperienceScore(
    parsedSkills: unknown,
    jobExperienceLevel: string | null,
  ): number {
    if (!jobExperienceLevel) {
      return 100;
    }

    if (!parsedSkills) {
      return 50;
    }

    const skillsObject = parsedSkills as { experience_level?: string };
    const resumeLevel = skillsObject.experience_level;

    if (!resumeLevel) {
      return 50;
    }

    const levelRank: Record<string, number> = {
      Entry: 0,
      Junior: 1,
      Mid: 2,
      Senior: 3,
    };

    const resumeRank = levelRank[resumeLevel] ?? 0;
    const jobRank = levelRank[jobExperienceLevel] ?? 0;

    if (resumeRank === jobRank) {
      return 100;
    }

    const difference = Math.abs(resumeRank - jobRank);

    if (difference === 1) {
      return 60;
    }

    return 20;
  }
}
