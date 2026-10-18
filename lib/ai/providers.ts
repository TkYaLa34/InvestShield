/*-------------------------------------------------------------------------
  AI Research Assistant — Provider-Agnostic Layer

  ออกแบบให้สลับ Model / Provider ได้ยืดหยุ่น โดยกำหนดอินเทอร์เฟซ
  ร่วม (`AIProvider`) จากนั้น Implement ต่อ provider แต่ละราย
  (ตัวอย่างเริ่มต้น: Mistral AI)
-------------------------------------------------------------------------*/

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  chat(messages: AIMessage[]): Promise<string>;
}

/*-------------------------------------------------------------------------
  Mistral AI Provider
  https://docs.mistral.ai/
-------------------------------------------------------------------------*/
export class MistralProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(options: AIProviderOptions = {}) {
    this.apiKey = options.apiKey || process.env.MISTRAL_API_KEY!;
    this.baseUrl = options.baseUrl || "https://api.mistral.ai/v1";
    this.model = options.model || "mistral-small-latest";
    this.temperature = options.temperature ?? 0.4;
    this.maxTokens = options.maxTokens ?? 1000;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "MISTRAL_API_KEY not configured. Set it in .env.local"
      );
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Mistral API error (${res.status}): ${errorText || res.statusText}`
      );
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

/*-------------------------------------------------------------------------
  Factory — สร้าง provider ตามตัวแปรแวดล้อม
  ตัวอย่าง: AI_PROVIDER=mistral (ค่าเริ่มต้น mistral)
-------------------------------------------------------------------------*/
export function createAIProvider(options: AIProviderOptions = {}): AIProvider {
  const providerName =
    options.apiKey ? "mistral" : (process.env.AI_PROVIDER ?? "mistral");

  switch (providerName) {
    case "mistral":
      return new MistralProvider(options);
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}
