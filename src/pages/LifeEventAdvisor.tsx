import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, CheckCircle2, AlertTriangle, FileText, ArrowRight } from "lucide-react";

const lifeEvents = [
  { id: "bonus", label: "💰 Received a Bonus", emoji: "💰" },
  { id: "marriage", label: "💍 Getting Married", emoji: "💍" },
  { id: "baby", label: "👶 Having a Baby", emoji: "👶" },
  { id: "job_change", label: "💼 Changing Jobs", emoji: "💼" },
  { id: "property", label: "🏠 Buying Property", emoji: "🏠" },
  { id: "inheritance", label: "🎁 Received Inheritance", emoji: "🎁" },
];

interface Advice {
  immediateActions: string[];
  allocation: string[];
  taxImpact: string[];
  risks: string[];
  documents: string[];
}

function getAdvice(eventId: string, amount: number): Advice {
  const a = amount;
  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const advice: Record<string, Advice> = {
    bonus: {
      immediateActions: [
        `Park ${formatINR(Math.round(a * 0.2))} (20%) in emergency fund if not already 6 months`,
        `Invest ${formatINR(Math.round(a * 0.5))} (50%) in equity mutual funds via lump sum + STP`,
        `Use ${formatINR(Math.round(a * 0.15))} (15%) for 80C investments (ELSS/NPS)`,
        `Keep ${formatINR(Math.round(a * 0.15))} (15%) for personal goals/lifestyle`,
      ],
      allocation: ["50% Equity MF (Index funds)", "20% Emergency fund", "15% Tax-saving ELSS", "15% Personal use"],
      taxImpact: ["Bonus is taxed as salary income at your slab rate", "TDS will be deducted by employer", "Invest in ELSS/NPS to reduce tax on bonus"],
      risks: ["Don't splurge the entire bonus", "Avoid lump-sum in volatile markets — use STP"],
      documents: ["Updated Form 16", "Investment receipts for 80C proof"],
    },
    marriage: {
      immediateActions: [
        "Set a realistic wedding budget (industry avg: ₹10-25L)",
        "Open a joint savings account for household expenses",
        "Update nominee in all insurance policies and investments",
        `Allocate ${formatINR(Math.round(a * 0.6))} for wedding, save rest`,
      ],
      allocation: ["60% Wedding expenses", "20% Emergency fund boost", "10% Insurance (term + health)", "10% Joint investments"],
      taxImpact: ["Gifts from relatives are tax-free", "Gifts from non-relatives above ₹50,000 are taxable", "Combine incomes for better tax planning", "Claim HRA if renting together"],
      risks: ["Avoid personal loans for wedding", "Don't break existing investments", "Insurance is more critical now"],
      documents: ["Marriage certificate", "Joint bank account docs", "Updated nominations", "Insurance policy updates"],
    },
    baby: {
      immediateActions: [
        "Get/upgrade health insurance with maternity cover",
        "Start a Sukanya Samriddhi or PPF in child's name",
        "Increase term life insurance to 15-20x income",
        `Set aside ${formatINR(Math.round(a * 0.3))} for immediate baby expenses`,
      ],
      allocation: ["30% Immediate expenses (first year)", "30% Child education fund (equity SIP)", "20% Insurance upgrade", "20% Emergency buffer"],
      taxImpact: ["Section 80C: Tuition fees deduction (later)", "Sukanya Samriddhi: EEE tax benefit", "80D: Health insurance premium deduction"],
      risks: ["Underinsurance is the biggest risk", "Education inflation is 10-12%/year", "Plan for 18-22 years of expenses"],
      documents: ["Birth certificate", "Health insurance with newborn cover", "Updated will/nomination", "Sukanya Samriddhi account docs"],
    },
    job_change: {
      immediateActions: [
        "Transfer EPF to new employer (don't withdraw!)",
        "Port health insurance if losing employer cover",
        "Negotiate tax-friendly components: HRA, NPS, LTA",
        "Check new CTC vs old — focus on in-hand, not gross",
      ],
      allocation: ["Build 3-month buffer during transition", "Continue existing SIPs without break", "Use joining bonus wisely (50% invest, 50% debt)"],
      taxImpact: ["EPF withdrawal before 5 years is taxable", "Gratuity tax-free up to ₹20L if 5+ years served", "Notice period recovery may be deductible", "Get Form 16 from both employers"],
      risks: ["Don't withdraw PF — let it compound", "Gap in health insurance is dangerous", "Don't increase lifestyle immediately"],
      documents: ["Relieving letter", "Form 16 from old employer", "EPF transfer form (Form 13)", "New offer letter for loan purposes"],
    },
    property: {
      immediateActions: [
        `Keep down payment to max 30% — don't deplete savings`,
        "Compare home loan rates across 5+ banks",
        "Check RERA registration of the property",
        "Budget for stamp duty + registration (5-8% of value)",
      ],
      allocation: ["20-30% Down payment", "5-8% Stamp duty & registration", "5% Interior & moving costs", "Maintain 6-month emergency fund"],
      taxImpact: [
        "Section 24: ₹2L deduction on home loan interest",
        "Section 80C: ₹1.5L deduction on principal repayment",
        "Section 80EEA: Additional ₹1.5L for affordable housing",
        "LTCG exemption if selling after 2 years (Section 54)",
      ],
      risks: ["EMI should not exceed 40% of income", "Under-construction has delivery risk", "Don't over-leverage — keep liquid assets"],
      documents: ["Sale agreement", "RERA registration", "Home loan sanction letter", "Property insurance"],
    },
    inheritance: {
      immediateActions: [
        "Inheritance is tax-free in India (no inheritance tax)",
        `Park ${formatINR(Math.round(a * 0.3))} in FD/liquid fund while planning`,
        "Get legal transfer of assets done properly",
        "Consult CA for income generated from inherited assets",
      ],
      allocation: ["30% Liquid parking (FD/liquid fund)", "40% Long-term equity investment", "15% Debt/fixed income", "15% Personal goals"],
      taxImpact: ["Inheritance itself is NOT taxable", "Income from inherited property IS taxable", "Capital gains on selling inherited assets — use original purchase date", "Rental income from inherited property is taxable"],
      risks: ["Don't make impulsive purchases", "Legal disputes can arise — get proper will execution", "Inherited property may have maintenance costs"],
      documents: ["Will / succession certificate", "Legal heir certificate", "Property mutation documents", "Inherited asset valuation"],
    },
  };

  return advice[eventId] || advice.bonus;
}

export default function LifeEventAdvisor() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);

  const handleGetAdvice = () => {
    if (selectedEvent) {
      setAdvice(getAdvice(selectedEvent, parseFloat(amount) || 0));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <Heart className="w-6 h-6 text-teal" />
          <h1 className="font-display text-3xl font-bold">Life Event Advisor</h1>
        </div>
        <p className="text-muted-foreground">Get personalized financial advice for life's big moments</p>
      </div>

      {/* Event Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {lifeEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => { setSelectedEvent(event.id); setAdvice(null); }}
            className={`p-4 rounded-xl border text-center transition-all duration-200 ${
              selectedEvent === event.id
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-card hover:border-primary/30"
            }`}
          >
            <div className="text-2xl mb-1">{event.emoji}</div>
            <div className="text-xs font-medium">{event.label.split(" ").slice(1).join(" ")}</div>
          </button>
        ))}
      </div>

      {selectedEvent && (
        <Card className="bg-gradient-card border-border/50 mb-6">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Amount Involved (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleGetAdvice}>
              Get Financial Advice <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {advice && (
        <div className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-score-excellent" /> Immediate Actions
              </h3>
              <ul className="space-y-2">
                {advice.immediateActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                    <span className="text-muted-foreground">{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold mb-3">📊 Allocation Strategy</h3>
              <div className="space-y-2">
                {advice.allocation.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Tax Impact
              </h3>
              <ul className="space-y-2">
                {advice.taxImpact.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span> {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-3">⚠️ Risks</h3>
                <ul className="space-y-2">
                  {advice.risks.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-score-poor">•</span> {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal" /> Documents Needed
                </h3>
                <ul className="space-y-2">
                  {advice.documents.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-teal">✓</span> {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
