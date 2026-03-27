import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, ArrowRight, TrendingUp } from "lucide-react";

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function calculateFIRE(monthlyExpenses: number, currentAge: number, targetAge: number, currentSavings: number) {
  const annualExpenses = monthlyExpenses * 12;
  const inflationRate = 0.06;
  const yearsToFIRE = targetAge - currentAge;

  // Inflation-adjusted annual expenses at FIRE age
  const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToFIRE);

  // 25x rule
  const fireCorpus = futureAnnualExpenses * 25;

  // What current savings will grow to (assume 12% equity returns)
  const equityReturn = 0.12;
  const futureValueSavings = currentSavings * Math.pow(1 + equityReturn, yearsToFIRE);

  // Gap
  const corpusGap = Math.max(0, fireCorpus - futureValueSavings);

  // SIP needed (monthly)
  const monthlyRate = equityReturn / 12;
  const months = yearsToFIRE * 12;
  const sipNeeded = months > 0
    ? corpusGap * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;

  // Step-up SIP (10% annual increase)
  const stepUpRate = 0.10;
  let stepUpSIP = 0;
  // Approximate: start with lower SIP, increase 10% yearly
  // Using formula: FV = SIP * Σ(1+g)^(k) * [(1+r)^(12*(n-k)) - 1]/r for each year
  // Simplified approximation
  let accumulated = 0;
  let testSIP = sipNeeded * 0.5;
  for (let iter = 0; iter < 100; iter++) {
    accumulated = 0;
    let currentSIP = testSIP;
    for (let year = 0; year < yearsToFIRE; year++) {
      for (let month = 0; month < 12; month++) {
        accumulated = (accumulated + currentSIP) * (1 + monthlyRate);
      }
      currentSIP *= (1 + stepUpRate);
    }
    accumulated += futureValueSavings;
    if (Math.abs(accumulated - fireCorpus) < 1000) break;
    testSIP *= fireCorpus / accumulated;
  }
  stepUpSIP = Math.max(0, testSIP);

  // Asset allocation recommendation
  const equityPercent = Math.max(30, Math.min(80, 100 - currentAge));
  const debtPercent = 100 - equityPercent;

  return {
    fireCorpus,
    futureAnnualExpenses,
    futureValueSavings,
    corpusGap,
    sipNeeded: Math.max(0, sipNeeded),
    stepUpSIP,
    equityPercent,
    debtPercent,
    yearsToFIRE,
  };
}

export default function FirePlanner() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentAge, setCurrentAge] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateFIRE> | null>(null);

  const handleCalculate = () => {
    const r = calculateFIRE(
      parseFloat(monthlyExpenses) || 0,
      parseInt(currentAge) || 30,
      parseInt(targetAge) || 45,
      parseFloat(currentSavings) || 0
    );
    setResult(r);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <Flame className="w-6 h-6 text-destructive" />
          <h1 className="font-display text-3xl font-bold">FIRE Planner</h1>
        </div>
        <p className="text-muted-foreground">Financial Independence, Retire Early — Indian Edition</p>
      </div>

      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Monthly Expenses (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Current Savings (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 1000000"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Current Age</Label>
              <Input
                type="number"
                placeholder="e.g. 28"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Target FIRE Age</Label>
              <Input
                type="number"
                placeholder="e.g. 45"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button variant="hero" className="w-full" onClick={handleCalculate}>
            Calculate My FIRE Number <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* FIRE Corpus */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your FIRE Corpus Target</p>
              <p className="font-display text-4xl font-bold text-gradient-gold">{formatINR(result.fireCorpus)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {formatINR(result.futureAnnualExpenses)}/year inflation-adjusted expenses × 25
              </p>
            </CardContent>
          </Card>

          {/* SIP Plan */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Fixed Monthly SIP</p>
                <p className="font-display text-2xl font-bold text-primary">{formatINR(result.sipNeeded)}</p>
                <p className="text-xs text-muted-foreground mt-1">Same amount every month for {result.yearsToFIRE} years</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Step-up SIP (10%/yr)</p>
                <p className="font-display text-2xl font-bold text-teal">{formatINR(result.stepUpSIP)}</p>
                <p className="text-xs text-muted-foreground mt-1">Start lower, increase 10% each year</p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Allocation */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Recommended Asset Allocation
              </h3>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-3">
                <div
                  className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground transition-all"
                  style={{ width: `${result.equityPercent}%` }}
                >
                  Equity {result.equityPercent}%
                </div>
                <div
                  className="bg-teal flex items-center justify-center text-xs font-medium text-accent-foreground transition-all"
                  style={{ width: `${result.debtPercent}%` }}
                >
                  Debt {result.debtPercent}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-primary">Equity ({result.equityPercent}%)</p>
                  <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                    <li>• Nifty 50 Index Fund (40%)</li>
                    <li>• Nifty Next 50 (20%)</li>
                    <li>• International Fund (20%)</li>
                    <li>• ELSS for tax saving (20%)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-teal">Debt ({result.debtPercent}%)</p>
                  <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                    <li>• PPF (40%)</li>
                    <li>• NPS Tier-I (30%)</li>
                    <li>• Debt Mutual Funds (30%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assumptions */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold mb-2 text-sm">Assumptions</h3>
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                <div>
                  <p className="font-display text-lg font-bold text-foreground">12%</p>
                  <p>Equity Returns</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">7%</p>
                  <p>Debt Returns</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">6%</p>
                  <p>Inflation Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
