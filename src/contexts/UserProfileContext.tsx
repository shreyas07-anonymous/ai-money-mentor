import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  saveProfile: () => Promise<void>;
  loadingProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

function profileToRow(p: UserProfile, isOnboarded: boolean) {
  return {
    first_name: p.firstName,
    employment_type: p.employmentType,
    age: p.age || null,
    city_type: p.cityType,
    monthly_income: p.monthlyIncome || 0,
    monthly_expenses: p.monthlyExpenses || 0,
    retirement_age: p.retirementAge || 60,
    current_behavior: p.currentBehavior,
    biggest_mistake: p.biggestMistake,
    is_onboarded: isOnboarded,
    onboarding_data: {
      expenseBreakdown: p.expenseBreakdown,
      loans: p.loans,
      safetyNets: p.safetyNets,
      deductions: p.deductions,
      worries: p.worries,
      goals: p.goals,
      portfolio: p.portfolio,
      savingsRate: p.savingsRate,
      incomeBracket: p.incomeBracket,
    },
  };
}

function rowToProfile(row: Record<string, unknown>): UserProfile {
  const data = (row.onboarding_data || {}) as Record<string, unknown>;
  const monthlyIncome = Number(row.monthly_income) || 0;
  const monthlyExpenses = Number(row.monthly_expenses) || 0;
  return {
    firstName: (row.first_name as string) || "",
    employmentType: (row.employment_type as string) || "",
    age: Number(row.age) || 0,
    cityType: (row.city_type as string) || "",
    monthlyIncome,
    monthlyExpenses,
    retirementAge: Number(row.retirement_age) || 60,
    currentBehavior: (row.current_behavior as string) || "",
    biggestMistake: (row.biggest_mistake as string) || "",
    expenseBreakdown: (data.expenseBreakdown as Record<string, number>) || {},
    loans: (data.loans as LoanInfo) || { types: [], totalEMI: 0 },
    safetyNets: (data.safetyNets as SafetyNets) || defaultProfile.safetyNets,
    deductions: (data.deductions as Deductions) || defaultProfile.deductions,
    worries: (data.worries as string[]) || [],
    goals: (data.goals as GoalWithTimeline[]) || [],
    portfolio: (data.portfolio as PortfolioItem[]) || [],
    savingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0,
    incomeBracket: getIncomeBracket(monthlyIncome),
  };
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isOnboarded, setOnboarded] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(defaultProfile);
      setOnboarded(false);
      return;
    }
    setLoadingProfile(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(rowToProfile(data as Record<string, unknown>));
          setOnboarded(Boolean(data.is_onboarded));
        }
        setLoadingProfile(false);
      });
  }, [user]);

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

  const saveProfile = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update(profileToRow(profile, isOnboarded))
      .eq("user_id", user.id);
  };

  return (
    <ProfileContext.Provider value={{
      profile, updateProfile, resetProfile, isOnboarded,
      setOnboarded: (v: boolean) => {
        setOnboarded(v);
        if (user) {
          supabase.from("profiles").update(profileToRow(profile, v)).eq("user_id", user.id).then(() => {});
        }
      },
      getBracketLabel: () => getBracketLabel(profile.incomeBracket),
      saveProfile,
      loadingProfile,
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
