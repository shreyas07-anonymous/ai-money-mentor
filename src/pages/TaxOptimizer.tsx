import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

// FY 2025-26 Tax Slabs
function calcOldRegime(income: number, deductions: { c80: number; d80: number; nps: number; hra: number }) {
  const totalDeductions = Math.min(deductions.c80, 150000) + Math.min(deductions.d80, 75000) + Math.min(deductions.nps, 50000) + deductions.hra;
  const standardDeduction = 50000;
  const taxableIncome = Math.max(0, income - totalDeductions - standardDeduction);

  let tax = 0;
  if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.3;
  if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.2;
  if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;

  // Rebate u/s 87A
  if (taxableIncome <= 500000) tax = 0;

  const cess = tax * 0.04;
  return { taxableIncome, tax, cess, total: tax + cess, deductionsUsed: totalDeductions + standardDeduction };
}

function calcNewRegime(income: number) {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, income - standardDeduction);

  let tax = 0;
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  let prev = 0;
  for (const slab of slabs) {
    if (taxableIncome > prev) {
      const taxable = Math.min(taxableIncome, slab.limit) - prev;
      tax += taxable * slab.rate;
      prev = slab.limit;
    }
  }

  // Rebate u/s 87A for new regime — zero tax up to ₹12.75L (income ₹12L + ₹75K std deduction)
  if (taxableIncome <= 1200000) tax = 0;

  // Marginal relief for income slightly above ₹12L
  if (taxableIncome > 1200000 && taxableIncome <= 1275000) {
    const normalTax = tax;
    const marginalTax = taxableIncome - 1200000;
    tax = Math.min(normalTax, marginalTax);
  }

  const cess = tax * 0.04;
  return { taxableIncome, tax, cess, total: tax + cess };
}

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function TaxOptimizer() {
  const [income, setIncome] = useState("");
  const [c80, setC80] = useState("");
  const [d80, setD80] = useState("");
  const [nps, setNps] = useState("");
  const [hra, setHra] = useState("");
  const [result, setResult] = useState<null | ReturnType<typeof calculateResult>>(null);

  function calculateResult() {
    const inc = parseFloat(income) || 0;
    const deductions = {
      c80: parseFloat(c80) || 0,
      d80: parseFloat(d80) || 0,
      nps: parseFloat(nps) || 0,
      hra: parseFloat(hra) || 0,
    };

    const oldR = calcOldRegime(inc, deductions);
    const newR = calcNewRegime(inc);
    const savings = Math.abs(oldR.total - newR.total);
    const bestRegime = oldR.total <= newR.total ? "Old" : "New";

    const missedDeductions: string[] = [];
    if (deductions.c80 < 150000) missedDeductions.push(`Section 80C: You can save up to ₹${(150000 - deductions.c80).toLocaleString("en-IN")} more via ELSS, PPF, or NPS Tier-I.`);
    if (deductions.nps < 50000) missedDeductions.push(`Section 80CCD(1B): Extra ₹${(50000 - deductions.nps).toLocaleString("en-IN")} tax saving via NPS contribution.`);
    if (deductions.d80 < 25000) missedDeductions.push(`Section 80D: Get health insurance — save up to ₹25,000 (₹50K for senior citizens).`);

    return { oldR, newR, savings, bestRegime, missedDeductions, income: inc };
  }

  const handleCalculate = () => {
    setResult(calculateResult());
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold mb-2">Tax Optimizer</h1>
        <p className="text-muted-foreground">FY 2025–26 | Old vs New Regime Comparison</p>
      </div>

      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Annual Gross Income (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 1200000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">80C Investments (₹)</Label>
              <Input
                type="number"
                placeholder="Max 1,50,000"
                value={c80}
                onChange={(e) => setC80(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">80D Health Insurance (₹)</Label>
              <Input
                type="number"
                placeholder="Max 75,000"
                value={d80}
                onChange={(e) => setD80(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">NPS 80CCD(1B) (₹)</Label>
              <Input
                type="number"
                placeholder="Max 50,000"
                value={nps}
                onChange={(e) => setNps(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">HRA Exemption (₹)</Label>
              <Input
                type="number"
                placeholder="Calculated HRA"
                value={hra}
                onChange={(e) => setHra(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button variant="hero" className="w-full" onClick={handleCalculate}>
            Compare Regimes <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className={`border-2 transition-colors ${result.bestRegime === "Old" ? "border-primary shadow-gold" : "border-border/50"} bg-gradient-card`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">Old Regime</h3>
                  {result.bestRegime === "Old" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">Recommended</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span>{formatINR(result.oldR.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductions Used</span>
                    <span className="text-score-excellent">{formatINR(result.oldR.deductionsUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatINR(result.oldR.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cess (4%)</span>
                    <span>{formatINR(result.oldR.cess)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50 font-semibold">
                    <span>Total Tax</span>
                    <span className="text-primary">{formatINR(result.oldR.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 transition-colors ${result.bestRegime === "New" ? "border-primary shadow-gold" : "border-border/50"} bg-gradient-card`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">New Regime</h3>
                  {result.bestRegime === "New" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">Recommended</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span>{formatINR(result.newR.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Std Deduction</span>
                    <span className="text-score-excellent">₹75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatINR(result.newR.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cess (4%)</span>
                    <span>{formatINR(result.newR.cess)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50 font-semibold">
                    <span>Total Tax</span>
                    <span className="text-primary">{formatINR(result.newR.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings */}
          <Card className="bg-gradient-card border-border/50 mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">You save with {result.bestRegime} Regime</p>
              <p className="font-display text-3xl font-bold text-gradient-gold">{formatINR(result.savings)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                That's {formatINR(Math.round(result.savings / 12))}/month extra in your pocket
              </p>
            </CardContent>
          </Card>

          {/* Missed Deductions */}
          {result.missedDeductions.length > 0 && (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" /> Missed Deductions
                </h3>
                <ul className="space-y-2">
                  {result.missedDeductions.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
