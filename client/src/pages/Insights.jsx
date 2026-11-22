import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Target, TrendingUp, AlertCircle, CalendarDays } from "lucide-react";
import api from "../api";
import { money } from "../utils/format";

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleString("en-KE", { month: "long", year: "numeric" });
}

export default function Insights() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [insights, setInsights] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { year: cursor.year, month: cursor.month };
      const [i, h] = await Promise.all([
        api.get("/settings/insights", { params }).then((r) => r.data).catch(() => null),
        api.get("/settings/health-score", { params }).then((r) => r.data).catch(() => null),
      ]);
      setInsights(i);
      setHealthScore(h);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [cursor]);

  const shiftMonth = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  if (loading) return <div className="p-5 text-sm text-gray-400">Loading insights…</div>;

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Understand your spending</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Spending Insights</h1>
        </div>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <button onClick={() => shiftMonth(-1)} className="rounded-xl p-2 text-brand-700">
          <CalendarDays size={20} />
        </button>
        <span className="text-sm font-semibold text-ink">{monthLabel(cursor.year, cursor.month)}</span>
        <button onClick={() => shiftMonth(1)} className="rounded-xl p-2 text-brand-700">
          <CalendarDays size={20} className="rotate-180" />
        </button>
      </div>

      {/* Financial Health Score */}
      {healthScore && (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Target size={20} />
            </span>
            Financial Health Score
          </h2>
          <p className="mt-1 text-xs text-slate-500">Based on budget adherence, savings rate, emergency fund & debt ratio</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full -rotate-90 transform">
                <circle cx="64" cy="64" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  stroke="#0f6b4a"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(healthScore.score / 100) * 314} 314`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-ink">{healthScore.score}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { key: "ruleAdherence", label: "Budget adherence", icon: Target },
                { key: "savingsRate", label: "Savings rate", icon: TrendingUp },
                { key: "emergencyFund", label: "Emergency fund", icon: AlertCircle },
                { key: "debtToAsset", label: "Debt to asset", icon: ArrowDownLeft },
              ].map((b) => (
                <div key={b.key} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <b.icon size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">{b.label}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-700"
                        style={{ width: `${healthScore.breakdown[b.key]}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{healthScore.breakdown[b.key]}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Safe to Spend Today */}
      {insights && (
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Target size={24} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-emerald-700">Safe to spend today</p>
                <p className="text-xs text-emerald-600 truncate">
                  {insights.daysLeft} day{insights.daysLeft !== 1 ? "s" : ""} left this month
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-emerald-700">{money(insights.safeToSpendDaily)}</p>
              <p className="text-xs text-emerald-600">/ day</p>
            </div>
          </div>
        </section>
      )}

      {/* Month-End Forecast */}
      {insights && (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp size={20} />
            </span>
            Month-End Forecast
          </h2>
          <p className="mt-1 text-xs text-slate-500">Based on your daily spending average so far</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Daily average</p>
              <p className="text-2xl font-bold text-ink">{money(insights.dailyAverage)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Projected total</p>
              <p className="text-2xl font-bold text-ink">{money(insights.forecast)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Income</p>
              <p className="text-2xl font-bold text-brand-700">{money(insights.currIncome)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Projected position</p>
              <p className={`text-2xl font-bold ${insights.overspendForecast > 0 ? "text-red-500" : "text-green-600"}`}>
                {insights.overspendForecast >= 0 ? "+" : ""}
                {money(insights.overspendForecast)}
              </p>
            </div>
          </div>
          {insights.overspendForecast > 0 && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-500">
              <AlertCircle size={14} className="mr-1 inline-block" /> At this pace you'll overspend by{" "}
              {money(insights.overspendForecast)} this month.
            </p>
          )}
        </section>
      )}

      {/* Category Insights */}
      {insights?.categoryInsights?.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp size={20} />
            </span>
            Category Changes vs Last Month
          </h2>
          <div className="mt-4 space-y-3">
            {insights.categoryInsights.map((c) => (
              <div key={c.category} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      c.pct > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    }`}
                  >
                    {c.pct > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </span>
                  <div>
                    <p className="font-medium text-slate-700">{c.category}</p>
                    <p className="text-xs text-slate-500">{c.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${c.pct > 0 ? "text-red-500" : "text-green-600"}`}>
                    {c.pct > 0 ? "+" : ""}
                    {c.pct}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {money(c.curr)} vs {money(c.prev)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Merchants */}
      {insights?.topMerchants?.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Target size={20} />
            </span>
            Top Merchants
          </h2>
          <div className="mt-4 space-y-2">
            {insights.topMerchants.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <span className="max-w-[200px] truncate font-medium text-slate-700">{m.name}</span>
                </div>
                <span className="font-bold text-ink">{money(m.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!insights?.categoryInsights?.length && !insights?.topMerchants?.length && (
        <p className="py-10 text-center text-slate-400">No insights yet. Add more transactions to see patterns.</p>
      )}
    </div>
  );
}