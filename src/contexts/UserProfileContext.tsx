import { createContext, useContext, useState, ReactNode } from "react";

export interface LoanInfo {
  types: string[];
  totalEMI: number;
}

export interface SafetyNets {
  emergencyMonths: string;
  termInsurance: string;
  termCoverage: string;
  healthInsurance: string;
  healthCoverage: string;
  epf: string;
  nps: string;
  mutualFunds: string;
  sipAmount: number;
}

export interface GoalWithTimeline {
  id: string;
  label: string;
  emoji: string;
  years: string;
  amount: string;
}

export interface PortfolioItem {
  id: string;
  label: string;
  emoji: string;
  amount: number;
}

export interface Deductions {
  c80: number;
  d80: number;
  nps: number;
  hra: number;
  homeLoanInterest: number;
  unknowns: string[];
}

export interface UserProfile {
  // Phase 1
  firstName: string;
  employmentType: string;
  age: number;
  monthlyIncome: number;
  cityType: string;
  // Phase 2
  monthlyExpenses: number;
  expenseBreakdown: Record<string, number>;
  loans: LoanInfo;
  safetyNets: SafetyNets;
  currentBehavior: string;
  deductions: Deductions;
  worries: string[];
  // Phase 3
  goals: GoalWithTimeline[];
  retirementAge: number;
  portfolio: PortfolioItem[];
  biggestMistake: string;
  // Derived
  savingsRate: number;
  incomeBracket: string;
}

const defaultProfile: UserProfile = {
  firstName: "",
  employmentType: "",
  age: 0,
  monthlyIncome: 0,
  cityType: "",
  monthlyExpenses: 0,
  expenseBreakdown: {},
  loans: { types: [], totalEMI: 0 },
  safetyNets: {
    emergencyMonths: "", termInsurance: "", termCoverage: "",
    healthInsurance: "", healthCoverage: "", epf: "", nps: "",
    mutualFunds: "", sipAmount: 0,
  },
  currentBehavior: "",
  deductions: { c80: 0, d80: 0, nps: 0, hra: 0, homeLoanInterest: 0, unknowns: [] },
  worries: [],
  goals: [],
  retirementAge: 60,
  portfolio: [],
  biggestMistake: "",
  savingsRate: 0,
  incomeBracket: "",
};

function getIncomeBracket(monthly: number): string {
  const annual = monthly * 12;
  if (annual <= 300000) return "B1";
  if (annual <= 700000) return "B2";
  if (annual <= 1200000) return "B3";
  if (annual <= 2500000) return "B4";
  if (annual <= 5000000) return "B5";
  if (annual <= 10000000) return "B6";
  return "B7";
}

function getBracketLabel(bracket: string): string {
  const labels: Record<string, string> = {
    B1: "Starting out — focus on building a safety net first",
    B2: "Building momentum — time to start smart tax planning",
    B3: "Sweet spot — regime comparison can save you real money",
    B4: "Growth phase — full tax optimization unlocks big savings",
    B5: "High earner — surcharge planning becomes important",
    B6: "Premium — advanced strategies can save lakhs",
    B7: "Ultra — wealth structuring is your biggest lever",
  };
  return labels[bracket] || "";
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  isOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
  getBracketLabel: () => string;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isOnboarded, setOnboarded] = useState(false);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (updates.monthlyIncome !== undefined || updates.monthlyExpenses !== undefined) {
        const income = updates.monthlyIncome ?? prev.monthlyIncome;
        const expenses = updates.monthlyExpenses ?? prev.monthlyExpenses;
        next.savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
        next.incomeBracket = getIncomeBracket(income);
      }
      return next;
    });
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    setOnboarded(false);
  };

  return (
    <ProfileContext.Provider value={{
      profile, updateProfile, resetProfile, isOnboarded, setOnboarded,
      getBracketLabel: () => getBracketLabel(profile.incomeBracket),
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
