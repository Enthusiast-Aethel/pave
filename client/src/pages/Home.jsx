import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="space-y-5 p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Good morning,</p>
          <h1 className="text-xl font-bold">{settings?.userName || "there"} 👋</h1>
        </div>
        <NotificationBell />
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-600 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Left to allocate · {monthName}</p>
        <p className="mt-1 text-3xl font-bold">{money(s.toAllocate)}</p>
        <p className="mt-2 text-xs opacity-80">of {money(s.Income)} income</p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Income" value={s.Income} color="text-brand-500" />
        <Stat label="Expenses" value={s.Expenses} color="text-red-500" />
        <Stat label="Savings" value={s.Savings} color="text-brand-700" />
      </section>

      <BudgetHealth year={now.getFullYear()} month={now.getMonth() + 1} />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Upcoming Bills</h2>
          <Link to="/bills" className="text-sm font-semibold text-brand-600">See all</Link>
        </div>
        {bills.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400 shadow-sm">
            No bills pending. 🎉
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
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm font-semibold text-brand-600">
            See all
          </Link>
        </div>
        {recent.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">Nothing yet this month.</p>
        )}
        {recent.map((t) => (
          <TransactionRow key={t._id} t={t} />
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{money(value)}</p>
    </div>
  );
}