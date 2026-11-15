import { useEffect, useState } from "react";
import api from "../api";
import { money } from "../utils/format";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const now = new Date();
  const monthName = now.toLocaleString("en-KE", { month: "long", year: "numeric" });

  useEffect(() => {
    api
      .get("/transactions/summary", {
        params: { year: now.getFullYear(), month: now.getMonth() + 1 },
      })
      .then((res) => setSummary(res.data))
      .catch(console.error);
  }, []);

  const s = summary || { Income: 0, Expenses: 0, Savings: 0, toAllocate: 0 };

  return (
    <div className="space-y-5 p-5">
      <header>
        <p className="text-sm text-gray-500">Good morning,</p>
        <h1 className="text-xl font-bold">Charles 👋</h1>
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