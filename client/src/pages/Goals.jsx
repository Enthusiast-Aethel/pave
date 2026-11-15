import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
    <div className="space-y-4 p-5">
      <h1 className="text-xl font-bold">Savings Goals</h1>

      {s && (
        <section className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-600 p-5 text-white shadow-lg">
          <p className="text-sm opacity-80">Total saved</p>
          <p className="mt-1 text-3xl font-bold">{money(s.totalSaved)}</p>
          <p className="text-xs opacity-80">of {money(s.totalTarget)} target</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(s.progress * 100, 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs opacity-90">
            <span>{(s.progress * 100).toFixed(1)}% overall</span>
            <span>{s.onTrack} of {s.goalCount} goals on track</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2">
              <p className="opacity-80">Planned / month</p>
              <p className="font-bold">{money(s.plannedPerMonth)}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2">
              <p className="opacity-80">Needed to hit all dates</p>
              <p className="font-bold">{money(s.neededPerMonth)}</p>
            </div>
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">No goals yet. Tap + to create one.</p>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const [Icon, tint] = categoryStyle(g.linkedCategory, "Savings");
          return (
            <button key={g._id} onClick={() => openEdit(g)}
              className="w-full rounded-3xl bg-white p-4 text-left shadow-sm">
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

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 mx-auto flex max-w-md justify-end px-5">
        <button onClick={openNew}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg active:scale-95">
          <Plus size={28} />
        </button>
      </div>

      <GoalSheet open={sheetOpen} editing={editing} onClose={() => setSheetOpen(false)} onSaved={load} />
    </div>
  );
}