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
} from "lucide-react";
import api from "../api";
import TransactionRow from "../components/TransactionRow";
import { money } from "../utils/format";
import BudgetHealth from "../components/BudgetHealth";
import useSettings from "../hooks/useSettings";
import NotificationBell from "../components/NotificationBell";

export default function Home() {
  const settings = useSettings();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [bills, setBills] = useState([]);
  
  const now = new Date();
  const monthName = now.toLocaleString("en-KE", { month: "long", year: "numeric" });

  useEffect(() => {
    const params = { year: now.getFullYear(), month: now.getMonth() + 1 };
    api.get("/transactions/summary", { params }).then((r) => setSummary(r.data));
    api.get("/transactions", { params }).then((r) => setRecent(r.data.slice(0, 4)));
    api.get("/bills/month", { params }).then((r) =>
      setBills(r.data.bills.filter((b) => b.status !== "Paid").slice(0, 3))
    );
  }, []);

  const s = summary || { Income: 0, Expenses: 0, Savings: 0, toAllocate: 0 };

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link to="/profile" aria-label="Open account settings" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700 ring-1 ring-brand-100">
            {(settings?.userName || "P").trim().charAt(0).toUpperCase()}
          </Link>
          <div>
            <p className="text-xs font-medium text-slate-500">Good morning</p>
            <h1 className="text-lg font-bold leading-tight text-ink">{settings?.userName || "there"}</h1>
          </div>
        </div>
        <NotificationBell />
      </header>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.2)]">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-1 -top-6 h-32 w-32 rounded-full border border-white/10" />
        <div className="relative flex items-center justify-between">
          <p className="text-xs font-medium text-white/70">Monthly snapshot · {monthName}</p>
          <Wallet size={18} className="text-emerald-200" />
        </div>
        <p className="relative mt-5 text-xs font-medium text-white/70">Left to allocate</p>
        <p className="relative mt-1 text-3xl font-bold tracking-tight">{money(s.toAllocate)}</p>
        <p className="relative mt-1 text-xs text-white/65">of {money(s.Income)} income</p>

        <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
          <Stat label="Income" value={s.Income} icon={ArrowDownLeft} />
          <Stat label="Expenses" value={s.Expenses} icon={ArrowUpRight} />
          <Stat label="Savings" value={s.Savings} icon={PiggyBank} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-ink">What would you like to do?</h2>
            <p className="mt-0.5 text-xs text-slate-500">Your money tools, all in one place.</p>
          </div>
          <Link to="/budget" className="text-xs font-semibold text-brand-700">Explore</Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction to="/transactions" label="Transactions" icon={ArrowUpRight} />
          <QuickAction to="/bills" label="My bills" icon={FileText} />
          <QuickAction to="/budget/plan" label="Plan budget" icon={PieChart} />
          <QuickAction to="/goals" label="Savings goals" icon={Target} />
        </div>
      </section>

      <Link to="/budget/plan" className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-4 transition hover:border-brand-500">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
          <CalendarDays size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">Give your money a plan</span>
          <span className="mt-0.5 block text-xs text-slate-500">Set this month’s budget in a few steps.</span>
        </span>
        <ArrowUpRight size={18} className="shrink-0 text-brand-700" />
      </Link>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-ink">Explore Pave</h2>
          <Link to="/wealth" className="text-xs font-semibold text-brand-700">Net worth</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
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

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-white/65">
        <Icon size={13} />
        <p className="truncate text-[10px] font-medium">{label}</p>
      </div>
      <p className="mt-1 truncate text-xs font-bold">{money(value)}</p>
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