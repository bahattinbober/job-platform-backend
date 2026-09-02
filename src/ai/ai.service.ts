import { Injectable } from '@nestjs/common';

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
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly chatModel = 'liquid/lfm-2.5-2.6b:free';
  private readonly embeddingModel = 'liquid/lfm-2.5-embedding-350m:free';

  async extractResumeSkills(
    rawText: string,
  ): Promise<Record<string, string[]>> {
    const prompt = `Aşağıda bir CV'nin ham metni var. Bu metni analiz et ve içindeki teknik yetenekleri ve deneyim bilgisini şu şekilde SADECE JSON formatında döndür, başka hiçbir açıklama ekleme:

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

Kurallar:
- Teknoloji kategorilerinde, eğer hiçbir şey bulamazsan, o kategoriyi boş dizi olarak bırak. Sadece CV metninde açıkça geçen teknolojileri listele, tahmin yürütme.
- "experience_level" alanına şu değerlerden birini yaz: "Entry", "Junior", "Mid", "Senior". CV'deki toplam iş deneyimi süresine ve unvanlara bakarak en uygun olanı seç. Belirleyemiyorsan "Entry" yaz.
- "years_of_experience" alanına, CV'de belirtilen toplam profesyonel deneyim yılını bir sayı olarak yaz (örneğin "2 yıl deneyim" yazıyorsa 2). Belirleyemiyorsan 0 yaz.

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
          model: this.chatModel,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    const data = (await response.json()) as OpenRouterResponse;
    console.log('OpenRouter tam cevabı:', JSON.stringify(data));
    const responseText = data.choices?.[0]?.message?.content ?? '{}';

    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      console.log('AI ham cevabı:', responseText);
      return JSON.parse(cleaned) as Record<string, string[]>;
    } catch (error) {
      console.error('JSON parse hatası, ham cevap:', responseText);
      console.error('Hata detayı:', error);
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
      console.error('OpenRouter embedding error:', response.status, data);
    }

    return data.data?.[0]?.embedding ?? [];
  }
  async generateReferralMessage(params: {
    connectionFirstName: string;
    companyName: string;
    jobTitle: string;
    userSkills: string[];
  }): Promise<string> {
    const { connectionFirstName, companyName, jobTitle, userSkills } = params;

    const prompt = `Bir kullanıcı, LinkedIn bağlantısına göndermek üzere kısa, samimi ve profesyonel bir mesaj yazmanı istiyor.

Bağlam:
- Bağlantının adı: ${connectionFirstName}
- Bağlantının çalıştığı şirket: ${companyName}
- Kullanıcının başvurmak istediği pozisyon: ${jobTitle}
- Kullanıcının öne çıkan becerileri: ${userSkills.join(', ')}

Kurallar:
- Mesaj Türkçe olsun.
- 3-4 cümleyi geçmesin.
- Doğrudan referral/tavsiye istemek yerine, pozisyon ve ekip hakkında kısa bir sohbet talep eden, samimi bir ton kullan.
- Aşırı resmi veya kalıplaşmış olmasın, doğal bir dille yazılsın.
- Sadece mesajın kendisini döndür, başka hiçbir açıklama ekleme.

Mesajı yaz:`;

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
