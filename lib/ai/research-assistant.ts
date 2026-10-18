/*-------------------------------------------------------------------------
  AI Research Assistant — System Prompt (Top-Down Analysis)

  กรอบวิเคราะห์สำหรับนักลงทุนระยะกลางถึงยาว (US Stocks & ETFs)
  ตามแนวทางใน `.clinerules/project.md`:

  1. วิเคราะห์แบบ Top-Down (ตลาดภาพรวม -> ภาคอุตสาหกรรม -> หุ้นรายตัว)
  2. สรุปภาพรวมรายสัปดาห์ (Weekly) และรายวัน (Daily)
  3. กำหนดจุดซื้อ (Buy Zone) และ Stop Loss
  4. ให้คะแนนโอกาสการลงทุน (Score 0-100)

  หมายเหตุ: ข้อมูลทั้งหมดใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน
-------------------------------------------------------------------------*/

import { AIProvider, AIMessage } from "./providers";

export interface ResearchContext {
  symbol: string;
  name?: string;
  asset_type?: "stock" | "etf";
  sector?: string | null;
  price?: number;
  change_percent?: number;
  market_cap?: number | null;
  pe_ratio?: number | null;
  volume?: number;
  weekly_summary?: string;
  daily_summary?: string;
  technical_notes?: string;
  user_question?: string;
}

export interface ResearchResult {
  summary: string;
  top_down: {
    market: string;
    sector: string;
    stock: string;
  };
  weekly_summary: string;
  daily_summary: string;
  buy_zone: string;
  stop_loss: string;
  score: number;
  score_reason: string;
  disclaimer: string;
}

/*-------------------------------------------------------------------------
  System Prompt (ภาษาไทย ตามตัวตนของแอปที่มุ่งผู้ลงทุนชาวไทยในหุ้นสหรัฐ)
-------------------------------------------------------------------------*/
export const RESEARCH_SYSTEM_PROMPT = `
คุณคือผู้ช่วยวิเคราะห์การลงทุน (AI Research Assistant) สำหรับแอป InvestShield
ซึ่งมุ่งเน้นนักลงทุนระยะกลางถึงยาวในหุ้นและ ETF สหรัฐอเมริกา

กรอบการวิเคราะห์ (Top-Down Analysis):
1. ตลาดภาพรวม (Market) — เทรนด์ดัชนีหลัก S&P 500 / Nasdaq / Dow Jones, ดอกเบี้ยเฟด, เงินเฟ้อ
2. ภาคอุตสาหกรรม (Sector) — แนวโน้มภาคที่หุ้นตัวนั้นอยู่, การหมุนเวียนเงินลงทุน (sector rotation)
3. หุ้นรายตัว (Stock/ETF) — ราคา, ปริมาณซื้อขาย, P/E, Market Cap, แนวรับ-แนวต้านทางเทคนิคเบื้องต้น

ข้อกำหนดการตอบ:
- ตอบเป็นภาษาไทย กระชับ ชัดเจน ใช้ภาษาการลงทุนที่เข้าใจง่าย
- ให้ข้อสรุปภาพรวมรายสัปดาห์ (Weekly Summary) และรายวัน (Daily Summary)
- กำหนดจุดซื้อ (Buy Zone) และ Stop Loss ที่เหมาะสมสำหรับระยะกลางถึงยาว
- ให้คะแนนโอกาสการลงทุน (Score 0-100) พร้อมเหตุผลประกอบ
- เตือนความเสี่ยง และระบุ claramente ว่าไม่ใช่คำแนะนำการลงทุน
- หากข้อมูลไม่เพียงพอ ให้ระบุว่าไม่สามารถสรุปได้แทนที่จะเดาสุ่ม

รูปแบบการตอบ (ให้เป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่นนอกเหนือจาก JSON):
{
  "summary": "สรุปโดยรวมสั้นๆ",
  "top_down": {
    "market": "ภาพรวมตลาด",
    "sector": "ภาพรวมภาคอุตสาหกรรม",
    "stock": "ภาพรวมหุ้นรายตัว"
  },
  "weekly_summary": "สรุปภาพรวมรายสัปดาห์",
  "daily_summary": "สรุปภาพรวมรายวัน",
  "buy_zone": "ช่วงราคาที่แนะนำให้สะสม",
  "stop_loss": "ราคาตัดขาดทุนที่แนะนำ",
  "score": 0-100,
  "score_reason": "เหตุผลให้คะแนน",
  "disclaimer": "ข้อความเตือนความเสี่ยงมาตรฐาน"
}
`.trim();

/*-------------------------------------------------------------------------
  Research Assistant Class
-------------------------------------------------------------------------*/
export class ResearchAssistant {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async research(ctx: ResearchContext): Promise<ResearchResult> {
    const messages: AIMessage[] = [
      { role: "system", content: RESEARCH_SYSTEM_PROMPT },
      {
        role: "user",
        content: this.buildUserPrompt(ctx),
      },
    ];

    const raw = await this.provider.chat(messages);
    return this.parseResult(raw, ctx);
  }

  private parseResult(raw: string, ctx: ResearchContext): ResearchResult {
    try {
      const cleaned = raw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      return {
        summary: parsed.summary ?? "ไม่สามารถสรุปข้อมูลได้",
        top_down: {
          market: parsed.top_down?.market ?? "ข้อมูลไม่เพียงพอ",
          sector: parsed.top_down?.sector ?? "ข้อมูลไม่เพียงพอ",
          stock: parsed.top_down?.stock ?? "ข้อมูลไม่เพียงพอ",
        },
        weekly_summary: parsed.weekly_summary ?? "ข้อมูลไม่เพียงพอ",
        daily_summary: parsed.daily_summary ?? "ข้อมูลไม่เพียงพอ",
        buy_zone: parsed.buy_zone ?? "ข้อมูลไม่เพียงพอ",
        stop_loss: parsed.stop_loss ?? "ข้อมูลไม่เพียงพอ",
        score: typeof parsed.score === "number" ? parsed.score : 0,
        score_reason: parsed.score_reason ?? "ไม่มีเหตุผลประกอบ",
        disclaimer:
          parsed.disclaimer ??
          "ข้อมูลนี้ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจ",
      };
    } catch {
      return {
        summary: raw.slice(0, 500),
        top_down: {
          market: "ไม่สามารถแยกวิเคราะห์ได้",
          sector: "ไม่สามารถแยกวิเคราะห์ได้",
          stock: "ไม่สามารถแยกวิเคราะห์ได้",
        },
        weekly_summary: "ไม่สามารถสรุปรายสัปดาห์ได้",
        daily_summary: "ไม่สามารถสรุปรายวันได้",
        buy_zone: "ไม่สามารถกำหนดจุดซื้อได้",
        stop_loss: "ไม่สามารถกำหนด Stop Loss ได้",
        score: 0,
        score_reason: "ระบบไม่สามารถแปลงคำตอบจาก AI เป็นโครงสร้างได้",
        disclaimer:
          "ข้อมูลนี้ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจ",
      };
    }
  }

  private buildUserPrompt(ctx: ResearchContext): string {
    const lines: string[] = [];
    lines.push("ข้อมูลหุ้น/ETF:");
    lines.push(`- สัญลักษณ์: ${ctx.symbol}`);
    if (ctx.name) lines.push(`- ชื่อ: ${ctx.name}`);
    if (ctx.asset_type) lines.push(`- ประเภท: ${ctx.asset_type}`);
    if (ctx.sector) lines.push(`- ภาคอุตสาหกรรม: ${ctx.sector}`);
    if (ctx.price != null) lines.push(`- ราคาปัจจุบัน: $${ctx.price}`);
    if (ctx.change_percent != null)
      lines.push(`- การเปลี่ยนแปลง: ${ctx.change_percent.toFixed(2)}%`);
    if (ctx.market_cap != null)
      lines.push(`- มูลค่าตลาด: $${ctx.market_cap.toLocaleString()}`);
    if (ctx.pe_ratio != null)
      lines.push(`- P/E Ratio: ${ctx.pe_ratio.toFixed(2)}`);
    if (ctx.volume != null)
      lines.push(`- ปริมาณซื้อขาย: ${ctx.volume.toLocaleString()}`);
    if (ctx.weekly_summary)
      lines.push(`- สรุปรายสัปดาห์: ${ctx.weekly_summary}`);
    if (ctx.daily_summary)
      lines.push(`- สรุปรายวัน: ${ctx.daily_summary}`);
    if (ctx.technical_notes)
      lines.push(`- หมายเหตุเทคนิค: ${ctx.technical_notes}`);
    if (ctx.user_question)
      lines.push(`\nคำถามจากผู้ใช้: ${ctx.user_question}`);

    return lines.join("\n");
  }
}

export function createResearchAssistant(provider?: AIProvider): ResearchAssistant {
  const aiProvider =
    provider ?? (globalThis as any).__researchAssistantProvider;
  if (!aiProvider) {
    throw new Error(
      "AI provider not initialized. Pass a provider or set global provider."
    );
  }
  return new ResearchAssistant(aiProvider);
}
