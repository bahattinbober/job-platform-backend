import { Injectable, Logger } from '@nestjs/common';

interface OpenRouterResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

interface OpenRouterEmbeddingResponse {
  data?: {
    embedding?: number[];
  }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly chatModel = 'liquid/lfm-2.5-2.6b:free';
  private readonly embeddingModel = 'liquid/lfm-2.5-embedding-350m:free';

  async extractResumeSkills(
    rawText: string,
  ): Promise<Record<string, string[]>> {
    const prompt = `Below is the raw text of a resume. Analyze it and return the technical skills and experience information it contains STRICTLY as JSON, with no other explanation:

{
  "programming_languages": [],
  "backend": [],
  "frontend": [],
  "databases": [],
  "devops": [],
  "cloud": [],
  "ai_ml": [],
  "experience_level": "",
  "years_of_experience": 0
}

Rules:
- If you can't find anything for a technology category, leave that category as an empty array. Only list technologies that are explicitly mentioned in the resume text, don't guess.
- For "experience_level", write one of: "Entry", "Junior", "Mid", "Senior". Choose the best fit based on the total work experience and job titles in the resume. If you can't determine it, write "Entry".
- For "years_of_experience", write the total years of professional experience stated in the resume as a number (e.g. if it says "2 years of experience", write 2). If you can't determine it, write 0.

Resume text:
"""
${rawText}
"""`;

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.chatModel,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    const data = (await response.json()) as OpenRouterResponse;
    const responseText = data.choices?.[0]?.message?.content ?? '{}';

    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as Record<string, string[]>;
      this.logger.log('Resume skills extraction completed');
      return parsed;
    } catch (error) {
      this.logger.error(`JSON parse hatası, ham cevap: ${responseText}`);
      this.logger.error('Hata detayı:', error);
      return {};
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text,
      }),
    });

    const data = (await response.json()) as OpenRouterEmbeddingResponse & {
      error?: unknown;
    };

    if (!response.ok || data.error) {
      this.logger.error(
        `OpenRouter embedding error: status=${response.status} ${JSON.stringify(data)}`,
      );
      return [];
    }

    const embedding = data.data?.[0]?.embedding ?? [];
    this.logger.log(`Embedding request completed, ${embedding.length} dimensions`);
    return embedding;
  }
  private formatConnectionDuration(connectedAt: Date | null): string {
    if (!connectedAt) {
      return 'an unspecified amount of time';
    }

    const diffDays =
      (Date.now() - connectedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 30) {
      return 'a few weeks';
    }

    if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `about ${months} month${months === 1 ? '' : 's'}`;
    }

    const years = Math.floor(diffDays / 365);
    return `about ${years} year${years === 1 ? '' : 's'}`;
  }

  async generateReferralMessage(params: {
    connectionFirstName: string;
    connectionPosition: string | null;
    companyName: string;
    jobTitle: string;
    overlappingSkills: string[];
    connectedAt: Date | null;
  }): Promise<string> {
    const {
      connectionFirstName,
      connectionPosition,
      companyName,
      jobTitle,
      overlappingSkills,
      connectedAt,
    } = params;

    const connectionDuration = this.formatConnectionDuration(connectedAt);

    const prompt = `You're writing a short, warm message for a user to send to one of their LinkedIn connections, asking that connection to refer them for a job.

Context:
- Connection's first name: ${connectionFirstName}
- Connection's position at the company: ${connectionPosition ?? 'not known - just refer to them as working there'}
- Company: ${companyName}
- Job the user wants to apply for: ${jobTitle}
- The user's skills that overlap with what the job requires: ${overlappingSkills.length > 0 ? overlappingSkills.join(', ') : 'a relevant technical background for the role'}
- How long the user and this connection have been connected: ${connectionDuration}

Rules:
- Write the message in English.
- 4-6 sentences.
- The message must actually ask for something: ask the connection to refer the user for the role, or to point them to whoever is hiring - don't just ask to "catch up" or "chat" about the team.
- Reference the specific overlap between the user's background and the role.
- Name the job title and the company.
- End with a clear, direct ask.
- Keep the tone direct and warm - not formal, not templated, like a real person actually wrote it.
- Return only the message itself, no other explanation.

Write the message:`;

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.chatModel,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    const data = (await response.json()) as OpenRouterResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }
}
