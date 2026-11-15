import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SlidersHorizontal } from "lucide-react";
import api from "../api";
import MonthPicker from "../components/MonthPicker";
import { categoryStyle } from "../utils/categories";
import { money } from "../utils/format";

const TYPES = ["Income", "Expenses", "Savings"];
const COLORS = ["#0f6b4a", "#3b82f6", "#f59e0b", "#14b8a6", "#8b5cf6", "#cbd5e1"];

export default function Budget() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [type, setType] = useState("Expenses");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/budget/overview", { params: cursor }).then((r) => setData(r.data));
  }, [cursor]);

  const section = data?.[type] || { rows: [], budget: 0, tracked: 0 };

  // Only show categories that have a plan or activity, biggest first
  const rows = useMemo(
    () =>
      section.rows
        .filter((r) => r.budget > 0 || r.tracked > 0)
        .sort((a, b) => b.tracked - a.tracked || b.budget - a.budget),
    [section]
  );

  // Donut: top 5 categories + "Other" (same as your Calculations sheet)
  const donut = useMemo(() => {
    const withValue = rows.filter((r) => r.tracked > 0);
    const top = withValue.slice(0, 5).map((r) => ({ name: r.category, value: r.tracked }));
    const otherTotal = withValue.slice(5).reduce((s, r) => s + r.tracked, 0);
    if (otherTotal > 0) top.push({ name: "Other", value: otherTotal });
    return top;
  }, [rows]);

  const pct = section.budget > 0 ? Math.round((section.tracked / section.budget) * 100) : 0;
  const verb = type === "Income" ? "received" : type === "Savings" ? "saved" : "spent";

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Budget</h1>
        <Link
          to="/budget/plan"
          className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
        >
          <SlidersHorizontal size={16} /> Plan
        </Link>
      </div>

      <MonthPicker cursor={cursor} onChange={setCursor} />

      {/* Type tabs */}
      <div className="grid grid-cols-3 rounded-2xl bg-brand-50 p-1">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl py-2 text-sm font-semibold ${
              type === t ? "bg-brand-700 text-white" : "text-brand-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-600 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Monthly {type.toLowerCase()} budget</p>
        <p className="mt-1 text-3xl font-bold">{money(section.budget)}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs opacity-90">
          <span>{money(section.tracked)} {verb}</span>
          <span>
            {section.budget - section.tracked >= 0
              ? `${money(section.budget - section.tracked)} remaining`
              : `${money(section.tracked - section.budget)} over`}
          </span>
        </div>
      </section>

      {/* Donut */}
      {donut.length > 0 && (
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-bold">{type} Breakdown</h2>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none">
                  {donut.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{money(section.tracked)}</span>
              <span className="text-xs text-gray-400">{verb}</span>
            </div>
          </div>
          <ul className="mt-2 space-y-2">
            {donut.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-semibold">
                  {Math.round((d.value / section.tracked) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Category progress list */}
      <section className="space-y-2">
        {rows.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400">Nothing planned or tracked for this month yet.</p>
            <Link to="/budget/plan" className="mt-3 inline-block text-sm font-semibold text-brand-600">
              Set up your plan →
            </Link>
          </div>
        )}
        {rows.map((r) => (
          <CategoryRow key={r.category} r={r} type={type} />
        ))}
      </section>
    </div>
  );
}

function CategoryRow({ r, type }) {
  const [Icon, tint] = categoryStyle(r.category, type);
  const pct = r.budget > 0 ? Math.round((r.tracked / r.budget) * 100) : null;
  const diff = r.budget - r.tracked;
  const over = diff < 0;
  // For expenses/savings, going over is a warning; for income it is good news
  const badgeColor =
    over && type === "Expenses" ? "bg-red-50 text-red-500" : "bg-brand-50 text-brand-700";

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{r.category}</p>
          <p className="text-xs text-gray-400">
            {money(r.tracked)} / {money(r.budget)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{pct === null ? "-" : `${pct}%`}</p>
          {r.budget > 0 || r.tracked > 0 ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
              {over ? `Excess ${money(-diff)}` : `Left ${money(diff)}`}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${over && type === "Expenses" ? "bg-red-400" : "bg-brand-500"}`}
          style={{ width: `${Math.min(pct ?? (r.tracked > 0 ? 100 : 0), 100)}%` }}
        />
      </div>
    </div>
  );
}