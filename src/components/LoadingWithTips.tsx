import { useState, useEffect } from "react";

const tips = [
  "💡 Starting a ₹1,000/month SIP (monthly investment plan) at age 25 can grow to ₹35 lakh by age 55 at 12% growth.",
  "🧾 The average Indian pays 30-40% more tax than they need to — just by not knowing about available deductions.",
  "🛡️ An emergency fund is not savings — it's financial armor. Your first goal should be 3 months of expenses in a liquid account.",
  "📋 Term insurance is the cheapest financial decision you'll ever make. A ₹1 crore cover costs ₹8,000-12,000/year if you're under 30.",
  "💰 The NPS pension account gives you an extra ₹50,000 tax deduction that 80% of eligible Indians don't claim.",
  "📈 Index funds have beaten 80% of actively managed funds over 10 years — and they cost 10x less in fees.",
  "🏠 Your home loan interest (up to ₹2 lakh/year) and principal (up to ₹1.5 lakh under 80C) are both tax deductible.",
  "💳 Credit card interest can be 36-42% per year. Paying off credit card debt is the best 'investment' you can make.",
];

export function LoadingWithTips({ message }: { message?: string }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto text-center">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-secondary" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-card flex items-center justify-center">
          <span className="text-xl">₹</span>
        </div>
      </div>
      <p className="font-display font-semibold text-foreground mb-2">{message || "Analyzing your finances..."}</p>
      <div className="min-h-[60px] flex items-center">
        <p className="text-sm text-muted-foreground leading-relaxed transition-opacity duration-500">{tips[tipIndex]}</p>
      </div>
    </div>
  );
}
