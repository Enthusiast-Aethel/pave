import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../api";
import MonthPicker from "../components/MonthPicker";
import { CATEGORIES } from "../utils/categories";
import { money } from "../utils/format";

const TYPES = ["Income", "Expenses", "Savings"];
const key = (type, category) => `${type}|${category}`;

export default function BudgetPlan() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [values, setValues] = useState({}); // "Type|Category" -> string
  const saved = useRef({}); // last values known to be in the database
  const [open, setOpen] = useState({ Income: true, Expenses: true, Savings: true });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await api.get("/budget", { params: cursor });
    const map = {};
    data.forEach((p) => (map[key(p.type, p.category)] = String(p.amount)));
    saved.current = { ...map };
    setValues(map);
  }, [cursor]);

  useEffect(() => {
    setMsg("");
    load();
  }, [load]);

  const total = (type) =>
    Object.entries(values)
      .filter(([k]) => k.startsWith(type + "|"))
      .reduce((s, [, v]) => s + (Number(v) || 0), 0);

  const income = total("Income");
  const expenses = total("Expenses");
  const savings = total("Savings");
  const toAllocate = income - expenses - savings;

  // Save one field when the user leaves it
  async function commit(type, category) {
    const k = key(type, category);
    const amount = Number(values[k]) || 0;
    if (String(amount) === (saved.current[k] ?? "0")) return;
    try {
      await api.put("/budget", { ...cursor, type, category, amount });
      saved.current[k] = String(amount);
    } catch {
      setMsg("Could not save. Check your connection.");
    }
  }

  async function copyPrevious() {
    const prev = new Date(cursor.year, cursor.month - 2, 1);
    const { data } = await api.post("/budget/copy", {
      fromYear: prev.getFullYear(),
      fromMonth: prev.getMonth() + 1,
      toYear: cursor.year,
      toMonth: cursor.month,
    });
    setMsg(data.copied ? "Copied from last month." : "Last month has no plan to copy.");
    load();
  }

  const balanced = toAllocate === 0;

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <div className="flex items-center gap-3">
        <Link to="/budget" aria-label="Back to Explore" className="rounded-xl border border-slate-100 bg-white p-2 text-ink shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs font-medium text-slate-500">Give every shilling a purpose</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Budget plan</h1>
        </div>
      </div>

      <MonthPicker cursor={cursor} onChange={setCursor} />

      {/* To be allocated */}
      <section
        className="relative flex items-center gap-3 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]"
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          balanced ? "bg-emerald-300/15 text-emerald-200" : toAllocate < 0 ? "bg-rose-300/15 text-rose-200" : "bg-amber-300/15 text-amber-200"
        }`}>
          {balanced ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
        </span>
        <div className="relative min-w-0">
          <p className="text-xs text-white/70">To be allocated</p>
          <p className="text-xl font-bold">{money(toAllocate)}</p>
          <p className="text-[11px] text-white/65">
            {balanced
              ? "Every shilling has a job."
              : toAllocate < 0
              ? "You have planned more than your income."
              : "Income not yet assigned to expenses or savings."}
          </p>
        </div>
      </section>

      <button
        onClick={copyPrevious}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-500 bg-white py-3 text-sm font-semibold text-brand-700"
      >
        <Copy size={16} /> Copy last month's plan
      </button>
      {msg && <p className="text-center text-xs text-gray-500">{msg}</p>}

      {/* Sections */}
      {TYPES.map((type) => (
        <section key={type} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <button
            onClick={() => setOpen((o) => ({ ...o, [type]: !o[type] }))}
            className="flex w-full items-center justify-between p-4"
          >
            <span className="font-bold">{type}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-700">{money(total(type))}</span>
              <ChevronDown size={18} className={`transition ${open[type] ? "rotate-180" : ""}`} />
            </span>
          </button>

          {open[type] && (
            <ul className="divide-y divide-gray-50 border-t border-gray-50">
              {CATEGORIES[type].map((c) => (
                <li key={c} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm">{c}</span>
                  <div className="flex w-32 items-center gap-1 rounded-xl bg-surface px-3 py-2">
                    <span className="text-[10px] text-gray-400">KES</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={values[key(type, c)] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [key(type, c)]: e.target.value }))}
                      onBlur={() => commit(type, c)}
                      className="w-full bg-transparent text-right text-sm font-semibold outline-none"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}