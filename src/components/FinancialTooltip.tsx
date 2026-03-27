import { useState } from "react";
import { X } from "lucide-react";

const glossary: Record<string, { definition: string; example: string }> = {
  SIP: { definition: "A monthly investment plan where you invest a fixed amount regularly into mutual funds, like a recurring deposit but with potentially higher returns.", example: "If you invest ₹2,000/month in an index fund at 12% growth, it becomes ₹4.7 lakh in 10 years." },
  "ELSS": { definition: "A type of mutual fund that invests in stocks AND saves you tax. It has a 3-year lock-in period — the shortest among tax-saving options.", example: "Investing ₹1.5 lakh in ELSS saves you up to ₹46,800 in tax (30% bracket) while your money grows." },
  "XIRR": { definition: "Your actual yearly returns on investments, accounting for when you put money in and took it out. Think of it as the 'real' return rate.", example: "If your mutual fund shows 15% XIRR, it means your money grew at 15% per year on average." },
  "LTCG": { definition: "Tax you pay on profits from investments you held for more than 1 year (stocks/mutual funds). Currently 12.5% on gains above ₹1.25 lakh.", example: "If you made ₹2 lakh profit on shares held for 2 years, you pay 12.5% tax on ₹75,000 (₹2L - ₹1.25L exemption) = ₹9,375." },
  "STCG": { definition: "Tax on profits from investments sold within 1 year. Currently 20% for stocks and equity mutual funds.", example: "Sold shares within 6 months and made ₹50,000 profit? You pay ₹10,000 (20%) as short-term capital gains tax." },
  "80C": { definition: "A tax rule that lets you subtract up to ₹1,50,000 from your taxable income by investing in things like EPF, PPF, ELSS, life insurance, or children's school fees.", example: "If you earn ₹10 lakh and invest ₹1.5 lakh under 80C, you only pay tax on ₹8.5 lakh — saving you ₹30,000-45,000." },
  "80D": { definition: "Tax deduction for health insurance premiums. You can deduct up to ₹25,000 for yourself and ₹25,000-50,000 for parents.", example: "Paying ₹20,000/year for health insurance? That entire amount reduces your taxable income." },
  NPS: { definition: "National Pension System — a government retirement savings plan. Your money is invested in a mix of stocks, bonds, and government securities.", example: "Putting ₹50,000 in NPS gives you an EXTRA tax deduction over the ₹1.5 lakh 80C limit. Most people miss this." },
  HRA: { definition: "House Rent Allowance — if you get HRA as part of your salary and pay rent, you can claim a tax deduction on a portion of it.", example: "Paying ₹15,000/month rent in a metro city? You could save ₹25,000-60,000 in tax depending on your salary." },
  EPF: { definition: "Employee Provident Fund — a retirement savings account where both you and your employer contribute 12% of your basic salary every month.", example: "On ₹30,000 basic salary, ₹3,600/month goes to EPF from you + ₹3,600 from employer. That's ₹86,400/year growing at 8.25%." },
  PPF: { definition: "Public Provident Fund — a government savings scheme with guaranteed returns (currently 7.1%) and complete tax-free status on maturity.", example: "₹1,000/month in PPF for 15 years at 7.1% gives you ₹3.25 lakh — all tax-free." },
  corpus: { definition: "The total amount of money you need to save up for a specific goal — like retirement or your child's education.", example: "If you need ₹50,000/month after retirement, your 'corpus' (total savings needed) would be about ₹1.5 crore." },
  surcharge: { definition: "An extra tax on top of your regular income tax, applicable only if your income exceeds ₹50 lakh per year.", example: "Earning ₹55 lakh? You pay a 10% surcharge on your tax amount — an additional cost of ignoring tax planning." },
  CAGR: { definition: "Compound Annual Growth Rate — the average yearly growth rate of your investment over a period, smoothing out the ups and downs.", example: "If ₹1 lakh became ₹2 lakh in 6 years, the CAGR is about 12% — meaning it grew 12% per year on average." },
};

export function FinancialTerm({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const info = glossary[term];
  if (!info) return <span>{children || term}</span>;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline decoration-dotted decoration-primary/50 underline-offset-2 cursor-help text-foreground hover:text-primary transition-colors"
      >
        {children || term}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-2xl p-6 shadow-elevated animate-in slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-primary mb-1">{term}</div>
            <p className="text-sm text-foreground mb-3">{info.definition}</p>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Example:</span> {info.example}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function jargonFree(text: string, simpleMode: boolean): string {
  if (!simpleMode) return text;
  const replacements: Record<string, string> = {
    "XIRR": "your actual yearly returns",
    "corpus": "total savings you'll need",
    "LTCG": "profit tax on long-term investments",
    "STCG": "profit tax on short-term investments",
    "CAGR": "average yearly growth rate",
    "SIP": "SIP (monthly investment plan)",
    "ELSS": "ELSS (tax-saving mutual fund)",
    "NPS": "NPS (government pension plan)",
    "EPF": "EPF (provident fund from employer)",
    "PPF": "PPF (government savings scheme)",
    "HRA": "HRA (rent tax benefit)",
  };
  let result = text;
  for (const [jargon, simple] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\b${jargon}\\b`, 'g'), simple);
  }
  return result;
}
