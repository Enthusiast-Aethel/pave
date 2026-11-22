import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Landmark,
  PiggyBank,
  PieChart,
  Target,
  Wallet,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import api from "../api";
import TransactionRow from "../components/TransactionRow";
import { money } from "../utils/format";
import BudgetHealth from "../components/BudgetHealth";
import useSettings from "../hooks/useSettings";
import NotificationBell from "../components/NotificationBell";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Night owl";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Night owl";
}

function formatNumber(n, hide) {
  if (hide) return "••••••";
  return n.toLocaleString("en-KE");
}

export default function Home() {
  const settings = useSettings();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [bills, setBills] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [hideAmounts, setHideAmounts] = useState(false);
  
  const now = new Date();
  const monthName = now.toLocaleString("en-KE", { month: "long", year: "numeric" });

  useEffect(() => {
    const params = { year: now.getFullYear(), month: now.getMonth() + 1 };
    api.get("/transactions/summary", { params }).then((r) => setSummary(r.data));
    api.get("/transactions", { params }).then((r) => setRecent(r.data.slice(0, 4)));
    api.get("/bills/month", { params }).then((r) =>
      setBills(r.data.bills.filter((b) => b.status !== "Paid").slice(0, 3))
    );
    api.get("/settings/health-score", { params }).then((r) => setHealthScore(r.data)).catch(() => {});
  }, []);

  const s = summary || { Income: 0, Expenses: 0, Savings: 0, toAllocate: 0 };
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
  const safeToSpend = s.toAllocate > 0 ? Math.round(s.toAllocate / daysLeft) : 0;

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link to="/settings" aria-label="Open account settings" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700 ring-1 ring-brand-100">
            {(settings?.userName || "P").trim().charAt(0).toUpperCase()}
          </Link>
          <div>
            <p className="text-xs font-medium text-slate-500">{timeGreeting()}</p>
            <h1 className="text-lg font-bold leading-tight text-ink">{settings?.userName || "there"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideAmounts((h) => !h)}
            className="rounded-full bg-white p-2.5 shadow-sm"
            aria-label={hideAmounts ? "Show amounts" : "Hide amounts"}
          >
            {hideAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <NotificationBell />
        </div>
      </header>
<section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.2)]">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-1 -top-6 h-32 w-32 rounded-full border border-white/10" />
        <div className="relative flex items-center justify-between">
          <p className="text-xs font-medium text-white/70">Monthly snapshot · {monthName}</p>
          <Wallet size={18} className="text-emerald-200" />
        </div>
        <p className="relative mt-5 text-xs font-medium text-white/70">Left to allocate</p>
        <p className="relative mt-1 text-3xl font-bold tracking-tight">KES {formatNumber(s.toAllocate, hideAmounts)}</p>
        <p className="relative mt-1 text-xs text-white/65">of {money(s.Income)} income</p>

        <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
          <Stat label="Income" value={s.Income} icon={ArrowDownLeft} hide={hideAmounts} />
          <Stat label="Expenses" value={s.Expenses} icon={ArrowUpRight} hide={hideAmounts} />
          <Stat label="Savings" value={s.Savings} icon={PiggyBank} hide={hideAmounts} />
        </div>
      </section>

      {/* Safe to Spend Today */}
      <section className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Shield size={20} />
            </span>
            <div>
              <p className="text-xs font-medium text-emerald-700">Safe to spend today</p>
              <p className="text-[11px] text-emerald-600">{daysLeft} day{daysLeft !== 1 ? "s" : ""} left this month</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-700">KES {formatNumber(safeToSpend, hideAmounts)}</p>
            <p className="text-xs text-emerald-600">/ day</p>
          </div>
        </div>
      </section>

      {/* Financial Health Score */}
      {healthScore && (
        <section className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Shield size={20} />
              </span>
              <div>
                <p className="font-bold text-ink">Financial Health Score</p>
                <p className="text-xs text-slate-500">Based on budget, savings & emergency fund</p>
              </div>
            </div>
            <a href="/insights" className="text-xs font-semibold text-brand-700">View details</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48" cy="48" r="40"
                  stroke="#e2e8f0" strokeWidth="8" fill="none"
                />
                <circle
                  cx="48" cy="48" r="40"
                  stroke="#0f6b4a" strokeWidth="8" fill="none"
                  strokeDasharray={`${(healthScore.score / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-ink">{healthScore.score}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { key: "ruleAdherence", label: "Budget adherence" },
                { key: "savingsRate", label: "Savings rate" },
                { key: "emergencyFund", label: "Emergency fund" },
                { key: "debtToAsset", label: "Debt to asset" },
              ].map((b) => (
                <div key={b.key} className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-700 rounded-full"
                    style={{ width: `${healthScore.breakdown[b.key]}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
<section className="space-y-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-ink">Quick actions</h2>
          <p className="mt-0.5 text-xs text-slate-500">Common tasks you can do in a tap.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <QuickAction to="/transactions" label="Add expense" icon={ArrowUpRight} />
          <QuickAction to="/transactions" label="Add income" icon={ArrowDownLeft} />
          <QuickAction to="/bills" label="Add bill" icon={FileText} />
          <QuickAction to="/goals" label="Add goal" icon={Target} />
          <QuickAction to="/wealth" label="Add account" icon={Landmark} />
          <QuickAction to="/budget" label="Budget plan" icon={PieChart} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-ink">Explore</h2>
          <p className="mt-0.5 text-xs text-slate-500">Deeper views of your money.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FeatureLink to="/budget" label="Budget" icon={PieChart} />
          <FeatureLink to="/bills" label="Bills" icon={FileText} />
          <FeatureLink to="/goals" label="Goals" icon={Target} />
          <FeatureLink to="/wealth" label="Net worth" icon={Landmark} />
          <FeatureLink to="/transactions" label="Activity" icon={ArrowLeftRight} />
          <FeatureLink to="/profile" label="Settings" icon={Wallet} />
        </div>
      </section>

      <BudgetHealth year={now.getFullYear()} month={now.getMonth() + 1} />

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-ink">Upcoming bills</h2>
          <Link to="/bills" className="text-xs font-semibold text-brand-700">View all</Link>
        </div>
        {bills.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-center text-sm text-slate-400 shadow-sm">
            No bills pending.
          </p>
        )}
        {bills.map((b) => (
          <div key={b._id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
            <div>
              <p className="text-sm font-semibold">{b.name}</p>
              <p className={`text-xs ${b.status === "Overdue" ? "text-red-500" : "text-amber-600"}`}>
                {b.status === "Overdue" ? `${Math.abs(b.daysToDue)} days overdue` : `Due in ${b.daysToDue} days`}
              </p>
            </div>
            <span className="text-sm font-bold">{money(b.outstanding)}</span>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-ink">Recent transactions</h2>
          <Link to="/transactions" className="text-xs font-semibold text-brand-700">View all</Link>
        </div>
        {recent.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">Nothing yet this month.</p>
        )}
        {recent.map((t) => (
          <TransactionRow key={t._id} t={t} />
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon, hide }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-white/65">
        <Icon size={13} />
        <p className="truncate text-[10px] font-medium">{label}</p>
      </div>
      <p className="mt-1 truncate text-xs font-bold">KES {formatNumber(value, hide)}</p>
    </div>
  );
}

function QuickAction({ to, label, icon: Icon }) {
  return (
    <Link to={to} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-white px-1.5 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="text-[10px] font-semibold leading-tight text-slate-600">{label}</span>
    </Link>
  );
}

function FeatureLink({ to, label, icon: Icon }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon size={17} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}