import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import api from "../api";
import GoalSheet from "../components/GoalSheet";
import { categoryStyle } from "../utils/categories";
import { money } from "../utils/format";

const PILL = {
  "On track": "bg-green-50 text-green-600",
  Achieved: "bg-green-50 text-green-600",
  Behind: "bg-red-50 text-red-500",
  "No plan": "bg-gray-100 text-gray-500",
};

const monthYear = (d) =>
  new Date(d).toLocaleDateString("en-KE", { month: "short", year: "numeric" });

export default function Goals() {
  const [data, setData] = useState({ summary: null, goals: [] });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get("/goals").then((r) => setData(r.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { summary: s, goals } = data;

  const openNew = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (g) => { setEditing(g); setSheetOpen(true); };

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Little by little, it adds up</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Savings goals</h1>
        </div>
        <button
          type="button"
          onClick={openNew}
          aria-label="Create a savings goal"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100"
        >
          <Plus size={20} />
        </button>
      </header>

      {s && (
        <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
          <p className="relative text-xs font-medium text-white/70">Your progress so far</p>
          <p className="relative mt-2 text-3xl font-bold tracking-tight">{money(s.totalSaved)}</p>
          <p className="relative text-[11px] text-white/70">of {money(s.totalTarget)} total target</p>
          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(s.progress * 100, 100)}%` }} />
          </div>
          <div className="relative mt-2 flex justify-between text-[11px] text-white/75">
            <span>{(s.progress * 100).toFixed(1)}% overall</span>
            <span>{s.onTrack} of {s.goalCount} goals on track</span>
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-white/65">Planned / month</p>
              <p className="font-bold">{money(s.plannedPerMonth)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-white/65">Needed each month</p>
              <p className="font-bold">{money(s.neededPerMonth)}</p>
            </div>
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink">Start with a goal of your own</p>
          <p className="mt-1 text-xs text-slate-500">Give your next milestone a name and a target.</p>
          <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white">
            Create a goal <ArrowRight size={15} />
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-ink">Your goals</h2>
            <p className="text-xs text-slate-500">Track progress toward what matters.</p>
          </div>
          <Link to="/budget/plan" className="text-xs font-semibold text-brand-700">Budget plan</Link>
        </div>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const [Icon, tint] = categoryStyle(g.linkedCategory, "Savings");
          return (
            <button key={g._id} onClick={() => openEdit(g)}
              className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{g.name}</span>
                  <span className="block truncate text-xs text-gray-400">{g.linkedCategory}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PILL[g.status]}`}>
                  {g.status}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="font-bold">{money(g.totalSaved)}</span>
                <span className="text-gray-400">{money(g.target)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(g.pct * 100, 100)}%` }} />
              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{(g.pct * 100).toFixed(1)}% · Target {monthYear(g.targetDate)}</span>
                <span>
                  {g.projected ? `Projected ${monthYear(g.projected)}` : "Set a monthly plan"}
                </span>
              </div>
              {g.status === "Behind" && (
                <p className="mt-2 rounded-xl bg-red-50 p-2 text-xs text-red-500">
                  Needs {money(g.neededPerMonth)}/month to hit the date (planned {money(g.plannedPerMonth)}).
                </p>
              )}
            </button>
          );
        })}
      </div>

      {goals.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 mx-auto flex max-w-md justify-end px-5">
          <button onClick={openNew}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg active:scale-95">
            <Plus size={28} />
          </button>
        </div>
      )}

      <GoalSheet open={sheetOpen} editing={editing} onClose={() => setSheetOpen(false)} onSaved={load} />
    </div>
  );
}