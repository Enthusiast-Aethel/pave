import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, ShieldCheck, Landmark, CreditCard } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../api";
import AccountSheet from "../components/AccountSheet";
import { money } from "../utils/format";
import { MONTH_NAMES } from "../utils/ui";

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#0f6b4a", "#3b82f6", "#f59e0b", "#14b8a6", "#8b5cf6", "#ec4899", "#64748b", "#cbd5e1"];

export default function Wealth() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Asset");
  const [range, setRange] = useState("All");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get("/networth", { params: { year } }).then((r) => setData(r.data));
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <div className="p-5 text-sm text-gray-400">Loading…</div>;

  const hasData = data.latestMonth > 0;
  const defaultMonth = hasData ? data.latestMonth : new Date().getMonth() + 1;

  const chart = data.series
    .slice(range === "3M" ? -3 : range === "6M" ? -6 : 0)
    .map((p) => ({ name: SHORT[p.month - 1], value: p.netWorth }));

  const list = data.accounts.filter((a) => a.kind === tab);

  const openNew = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (a) => { setEditing(a); setSheetOpen(true); };

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="px-1">
        <p className="text-xs font-medium text-slate-500">See how far you’ve come</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Net worth</h1>
      </header>

      {/* Year selector */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <button onClick={() => setYear(year - 1)} className="rounded-xl p-2 text-brand-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-ink">{year}</span>
        <button onClick={() => setYear(year + 1)} className="rounded-xl p-2 text-brand-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative flex items-center justify-between">
          <p className="text-xs font-medium text-white/70">
          {hasData ? `Net worth · ${MONTH_NAMES[data.latestMonth - 1]} ${year}` : "Net worth"}
          </p>
          <Landmark size={18} className="text-emerald-200" />
        </div>
        <p className="relative mt-2 text-3xl font-bold tracking-tight">{money(data.netWorth)}</p>
        {hasData && data.latestMonth > 1 && (
          <span className="relative mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {data.change >= 0 ? "+" : "-"}{money(Math.abs(data.change))} ({data.changePct.toFixed(1)}%) vs last month
          </span>
        )}
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(Math.max(data.goalProgress, 0) * 100, 100)}%` }} />
        </div>
        <div className="relative mt-2 flex justify-between text-[11px] text-white/75">
          <span>{(data.goalProgress * 100).toFixed(1)}% of {money(data.goal)} goal</span>
          <span>{money(data.remaining)} to go</span>
        </div>
      </section>

      {!hasData && (
        <p className="rounded-2xl border border-slate-100 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
          No balances for {year} yet. Tap + to add your first account.
        </p>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="Assets" value={money(data.assets)} color="text-brand-700" />
            <Mini label="Liabilities" value={money(data.liabilities)} color="text-rose-600" />
            <Mini label="Debt-to-asset" value={`${(data.debtToAsset * 100).toFixed(1)}%`} />
          </div>

          {data.emergencyMonths !== null && (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-brand-700">
              <ShieldCheck />
              <p className="text-sm">
                Your cash covers <b>{data.emergencyMonths.toFixed(1)} months</b> of average expenses.
              </p>
            </div>
          )}

          {/* Trend */}
          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Trend</h2>
              <div className="flex gap-1">
                {["3M", "6M", "All"].map((r) => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      range === r ? "bg-[#174b86] text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Line type="monotone" dataKey="value" stroke="#0f6b4a" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Allocation */}
          {data.allocation.length > 0 && (
            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-bold">Asset allocation</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.allocation} dataKey="value" innerRadius={50} outerRadius={78}
                      paddingAngle={2} stroke="none">
                      {data.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-2">
                {data.allocation.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="font-semibold">{Math.round((d.value / data.assets) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Accounts */}
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        {[["Asset", "Assets"], ["Liability", "Liabilities"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-xl py-2 text-sm font-semibold ${
              tab === k ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <p className="rounded-2xl border border-slate-100 bg-white py-6 text-center text-sm text-slate-400">No accounts here yet.</p>
        )}
        {list.map((a) => {
          const good = a.kind === "Asset" ? a.change >= 0 : a.change <= 0;
          const Icon = a.kind === "Asset" ? Landmark : CreditCard;
          return (
            <button key={a._id} onClick={() => openEdit(a)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                a.kind === "Asset" ? "bg-brand-50 text-brand-700" : "bg-rose-100 text-rose-600"
              }`}>
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{a.name}</span>
                <span className="block truncate text-xs text-gray-400">{a.category}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold">{money(a.balance)}</span>
                {a.change !== 0 && (
                  <span className={`text-[11px] font-semibold ${good ? "text-green-600" : "text-red-500"}`}>
                    {a.change > 0 ? "+" : "-"}{money(Math.abs(a.change))}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex w-full justify-end px-5">
        <button onClick={openNew}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg active:scale-95">
          <Plus size={28} />
        </button>
      </div>

      <AccountSheet
        open={sheetOpen}
        editing={editing}
        defaultKind={tab}
        year={year}
        defaultMonth={defaultMonth}
        onClose={() => setSheetOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

function Mini({ label, value, color = "text-ink" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`mt-1 text-xs font-bold ${color}`}>{value}</p>
    </div>
  );
}