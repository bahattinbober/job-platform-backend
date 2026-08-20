import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async extractResumeSkills(
    rawText: string,
  ): Promise<Record<string, string[]>> {
    const prompt = `Aşağıda bir CV'nin ham metni var. Bu metni analiz et ve içindeki teknik yetenekleri şu kategorilere ayırarak SADECE JSON formatında döndür, başka hiçbir açıklama ekleme:

{
  "programming_languages": [],
  "backend": [],
  "frontend": [],
  "databases": [],
  "devops": [],
  "cloud": [],
  "ai_ml": []
}

Eğer bir kategoride hiçbir şey bulamazsan, o kategoriyi boş dizi olarak bırak. Sadece CV metninde açıkça geçen teknolojileri listele, tahmin yürütme.

CV metni:
"""
${rawText}
"""`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';

    try {
      return JSON.parse(responseText) as Record<string, string[]>;
    } catch {
      return {};
    }
  }
}
