import { Injectable } from '@nestjs/common';

interface OpenRouterResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

@Injectable()
export class AiService {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly model = 'nvidia/nemotron-3.5-lightning:free';

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

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    const data = (await response.json()) as OpenRouterResponse;
    const responseText = data.choices?.[0]?.message?.content ?? '{}';

    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as Record<string, string[]>;
    } catch {
      return {};
    }
  }
}
