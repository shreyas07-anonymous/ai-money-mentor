import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: { label: string; value: number; detail?: string }[];
  dimension: string;
}

const questions: Question[] = [
  {
    id: "emergency",
    question: "How many months of expenses do you have saved as an emergency fund?",
    dimension: "Emergency Fund",
    options: [
      { label: "None", value: 0 },
      { label: "1-2 months", value: 30 },
      { label: "3-5 months", value: 70 },
      { label: "6+ months", value: 100 },
    ],
  },
  {
    id: "insurance",
    question: "What insurance coverage do you currently have?",
    dimension: "Insurance",
    options: [
      { label: "No insurance", value: 0 },
      { label: "Only employer health insurance", value: 30 },
      { label: "Health + Term life insurance", value: 70 },
      { label: "Health + Term + Critical illness", value: 100 },
    ],
  },
  {
    id: "investments",
    question: "How diversified are your investments?",
    dimension: "Investments",
    options: [
      { label: "No investments / Only FD", value: 10 },
      { label: "FD + PPF / RD only", value: 35 },
      { label: "Mutual Funds + some fixed income", value: 70 },
      { label: "Diversified: Equity, Debt, Gold, International", value: 100 },
    ],
  },
  {
    id: "debt",
    question: "What portion of your income goes to EMIs?",
    dimension: "Debt Management",
    options: [
      { label: "More than 50%", value: 10 },
      { label: "30-50%", value: 40 },
      { label: "10-30%", value: 70 },
      { label: "Less than 10% or debt-free", value: 100 },
    ],
  },
  {
    id: "tax",
    question: "How actively do you plan your taxes?",
    dimension: "Tax Planning",
    options: [
      { label: "I don't plan taxes at all", value: 0 },
      { label: "Last-minute 80C investments only", value: 30 },
      { label: "80C + 80D + HRA planned", value: 65 },
      { label: "Full optimization: NPS, ELSS, HRA, regime comparison", value: 100 },
    ],
  },
  {
    id: "retirement",
    question: "Do you have a retirement plan?",
    dimension: "Retirement Planning",
    options: [
      { label: "Haven't thought about it", value: 0 },
      { label: "EPF / PPF only", value: 35 },
      { label: "EPF + NPS / Mutual Funds", value: 70 },
      { label: "Clear FIRE target with active SIPs", value: 100 },
    ],
  },
  {
    id: "income_div",
    question: "How many sources of income do you have?",
    dimension: "Income Diversification",
    options: [
      { label: "Single salary only", value: 20 },
      { label: "Salary + small side income", value: 50 },
      { label: "2-3 active income sources", value: 75 },
      { label: "Multiple: salary, freelance, rental, dividends", value: 100 },
    ],
  },
];

const weights: Record<string, number> = {
  "Emergency Fund": 15,
  Insurance: 20,
  Investments: 20,
  "Debt Management": 15,
  "Tax Planning": 15,
  "Retirement Planning": 10,
  "Income Diversification": 5,
};

function getGrade(score: number) {
  if (score >= 85) return { grade: "A", label: "Excellent", color: "text-score-excellent" };
  if (score >= 70) return { grade: "B", label: "Good", color: "text-score-good" };
  if (score >= 50) return { grade: "C", label: "Fair", color: "text-score-fair" };
  if (score >= 30) return { grade: "D", label: "Needs Work", color: "text-score-poor" };
  return { grade: "F", label: "Critical", color: "text-score-critical" };
}

function getScoreColor(score: number) {
  if (score >= 85) return "stroke-score-excellent";
  if (score >= 70) return "stroke-score-good";
  if (score >= 50) return "stroke-score-fair";
  if (score >= 30) return "stroke-score-poor";
  return "stroke-score-critical";
}

function getInsights(answers: Record<string, number>) {
  const insights: string[] = [];
  if ((answers["emergency"] ?? 0) < 70) insights.push("Build an emergency fund of at least 6 months' expenses in a liquid fund or savings account.");
  if ((answers["insurance"] ?? 0) < 70) insights.push("Get term life insurance (10x annual income) and a ₹10L+ health cover immediately.");
  if ((answers["investments"] ?? 0) < 70) insights.push("Diversify beyond FDs — start SIPs in index funds (Nifty 50 + Nifty Next 50).");
  if ((answers["debt"] ?? 0) < 70) insights.push("Reduce EMI burden below 30% of income. Consider prepaying high-interest loans first.");
  if ((answers["tax"] ?? 0) < 70) insights.push("Maximize 80C (₹1.5L), 80CCD(1B) (₹50K NPS), and 80D (health insurance) deductions.");
  if ((answers["retirement"] ?? 0) < 70) insights.push("Start NPS for extra ₹50K tax saving and set a clear FIRE target.");
  if ((answers["income_div"] ?? 0) < 50) insights.push("Explore side income: freelancing, content creation, or rental income.");
  if (insights.length === 0) insights.push("You're in great shape! Focus on optimizing asset allocation and tax harvesting.");
  return insights;
}

export default function HealthScore() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQ = questions[step];

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setShowResult(true), 200);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalWeight = 0;
    questions.forEach((q) => {
      const w = weights[q.dimension] || 5;
      totalWeight += w;
      totalScore += ((answers[q.id] ?? 0) * w) / 100;
    });
    return Math.round((totalScore / totalWeight) * 100);
  };

  if (showResult) {
    const score = calculateScore();
    const { grade, label, color } = getGrade(score);
    const insights = getInsights(answers);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Your Money Health Score</h1>
          <p className="text-muted-foreground">Based on 8 financial dimensions</p>
        </div>

        <Card className="bg-gradient-card border-border/50 mb-6">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-secondary" />
                <circle
                  cx="50" cy="50" r="45" fill="none" strokeWidth="8"
                  className={`${getScoreColor(score)} animate-score-fill`}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className={`font-display text-2xl font-bold ${color}`}>
              Grade {grade} — {label}
            </div>
          </CardContent>
        </Card>

        {/* Dimension breakdown */}
        <Card className="bg-gradient-card border-border/50 mb-6">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-display font-semibold mb-2">Dimension Breakdown</h3>
            {questions.map((q) => {
              const val = answers[q.id] ?? 0;
              return (
                <div key={q.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{q.dimension}</span>
                    <span className="font-medium">{val}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        val >= 70 ? "bg-score-excellent" : val >= 50 ? "bg-score-fair" : "bg-score-poor"
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-gradient-card border-border/50 mb-6">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold mb-3">🎯 Top Actions</h3>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button variant="hero" className="w-full" onClick={() => { setStep(0); setAnswers({}); setShowResult(false); }}>
          Retake Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {step + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">{currentQ.dimension}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-xl md:text-2xl font-bold mb-6">{currentQ.question}</h2>

      <div className="space-y-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
              answers[currentQ.id] === opt.value
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-card hover:border-primary/30 hover:bg-secondary/50"
            }`}
          >
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>

      {step > 0 && (
        <Button variant="ghost" className="mt-6" onClick={() => setStep(step - 1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      )}
    </div>
  );
}
