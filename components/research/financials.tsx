"use client";

import { formatCurrency, formatLargeNumber } from "@/lib/utils";

interface FinancialsProps {
  symbol: string;
  market_cap: number | null;
  pe_ratio: number | null;
  volume: number;
}

export function FinancialsCard({
  symbol,
  market_cap,
  pe_ratio,
  volume,
}: FinancialsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </span>
        <h3 className="text-sm font-semibold">ตัวเลขทางการเงิน</h3>
      </div>

      <div className="space-y-3">
        <FinancialRow
          label="มูลค่าตลาด (Market Cap)"
          value={formatLargeNumber(market_cap)}
          hint="มูลค่ารวมของหุ้นทั้งหมดในตลาด"
        />
        <FinancialRow
          label="อัตราส่วน P/E"
          value={pe_ratio != null ? pe_ratio.toFixed(2) : "—"}
          hint="ราคาหุ้นต่อกำไรต่อหุ้น"
        />
        <FinancialRow
          label="ปริมาณซื้อขาย (Volume)"
          value={formatLargeNumber(volume)}
          hint="จำนวนหุ้นที่มีการซื้อขายในวันล่าสุด"
        />
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          ข้อมูลอ้างอิงสำหรับ {symbol} ดึงมาจากระบบแคชตลาดหลักทรัพย์
          (market data cache) ซึ่งอาจมีความล่าช้าเล็กน้อย ไม่ควรใช้เป็น
          คำชี้นำในการลงทุนเพียงอย่างเดียว โปรดศึกษาข้อมูลเพิ่มเติมก่อน
          ตัดสินใจลงทุน
        </p>
      </div>
    </div>
  );
}

interface FinancialRowProps {
  label: string;
  value: string;
  hint: string;
}

function FinancialRow({ label, value, hint }: FinancialRowProps) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <div>
        <p className="text-muted-foreground text-[11px]">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <p className="text-[10px] text-muted-foreground text-right">{hint}</p>
    </div>
  );
}
