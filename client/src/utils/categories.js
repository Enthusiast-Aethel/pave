import {
  Home, Zap, Droplets, Flame, Wifi, Bus, ShoppingBasket, HeartPulse,
  HeartHandshake, Wallet, Receipt, Sparkles, Repeat, Shapes, Landmark,
  PiggyBank, TrendingUp, Banknote, Briefcase, CreditCard,
} from "lucide-react";

// Same lists as your Budget Planning sheet
export const CATEGORIES = {
  Income: ["Salary", "Side Hustle", "Dividends", "Business Income"],
  Expenses: [
    "Rent", "Electricity", "Water", "Gas", "Internet/Airtime", "Transport",
    "Essential Groceries", "Healthcare", "Tithe & Offering", "Allowances",
    "Transactional Charges", "Personal Care", "Subscription",
    "Miscellaneous Costs", "Mshwari Loan", "Helb Loan", "Debt", "Self Care",
  ],
  Savings: [
    "CIC Invest(Emergency Fund)", "Zimele(Sinking Fund)",
    "SanlamAllianz(Gen & Child Fund)", "Vuka(Acorn Capital Partners)",
    "Kingdom Securities (Stocks)", "ICEA Lion", "Sacco",
  ],
};

// Icon + soft tint for each category (full class names so Tailwind picks them up)
const STYLES = {
  Salary: [Banknote, "bg-green-100 text-green-600"],
  "Side Hustle": [Briefcase, "bg-teal-100 text-teal-600"],
  Dividends: [TrendingUp, "bg-emerald-100 text-emerald-600"],
  "Business Income": [Briefcase, "bg-blue-100 text-blue-600"],
  Rent: [Home, "bg-blue-100 text-blue-600"],
  Electricity: [Zap, "bg-yellow-100 text-yellow-600"],
  Water: [Droplets, "bg-sky-100 text-sky-600"],
  Gas: [Flame, "bg-orange-100 text-orange-600"],
  "Internet/Airtime": [Wifi, "bg-purple-100 text-purple-600"],
  Transport: [Bus, "bg-indigo-100 text-indigo-600"],
  "Essential Groceries": [ShoppingBasket, "bg-lime-100 text-lime-600"],
  Healthcare: [HeartPulse, "bg-red-100 text-red-500"],
  "Tithe & Offering": [HeartHandshake, "bg-pink-100 text-pink-600"],
  Allowances: [Wallet, "bg-amber-100 text-amber-600"],
  "Transactional Charges": [Receipt, "bg-slate-100 text-slate-600"],
  "Personal Care": [Sparkles, "bg-fuchsia-100 text-fuchsia-600"],
  Subscription: [Repeat, "bg-violet-100 text-violet-600"],
  "Miscellaneous Costs": [Shapes, "bg-gray-100 text-gray-600"],
  "Mshwari Loan": [CreditCard, "bg-rose-100 text-rose-600"],
  "Helb Loan": [CreditCard, "bg-rose-100 text-rose-600"],
  Debt: [CreditCard, "bg-rose-100 text-rose-600"],
};

const SAVINGS_STYLE = [PiggyBank, "bg-brand-50 text-brand-700"];
const DEFAULT_STYLE = [Landmark, "bg-gray-100 text-gray-600"];

export function categoryStyle(category, type) {
  if (STYLES[category]) return STYLES[category];
  if (type === "Savings") return SAVINGS_STYLE;
  return DEFAULT_STYLE;
}