import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Info,
  PiggyBank,
} from "lucide-react";
import api from "../api";
import TransactionRow from "../components/TransactionRow";
import TransactionSheet from "../components/TransactionSheet";
import { dayLabel, money, toInputDate } from "../utils/format";
import useSettings from "../hooks/useSettings";

const FILTERS = ["All", "Income", "Expenses", "Savings"];

export default function Transactions() {
  const settings = useSettings();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newType, setNewType] = useState("Expenses");

  const load = useCallback(() => {
    api.get("/transactions", { params: cursor }).then((r) => setItems(r.data));
  }, [cursor]);

  useEffect(() => {
    load();
  }, [load]);

  const shiftMonth = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  const monthLabel = new Date(cursor.year, cursor.month - 1, 1).toLocaleString("en-KE", {
    month: "long",
    year: "numeric",
  });

  // Filter, then group by date (list is already sorted newest first)
  const groups = useMemo(() => {
    const visible = items.filter((t) => filter === "All" || t.type === filter);
    const map = {};
    visible.forEach((t) => {
      const key = toInputDate(t.date);
      (map[key] ||= []).push(t);
    });
    return Object.entries(map);
  }, [items, filter]);

  const totals = items.reduce(
    (acc, t) => ({ ...acc, [t.type]: acc[t.type] + t.amount }),
    { Income: 0, Expenses: 0, Savings: 0 }
  );

  const openNew = (type = "Expenses") => {
    setEditing(null);
    setNewType(type);
    setSheetOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Your money activity</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Transact</h1>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ArrowUpRight size={20} />
        </span>
      </header>

      {/* Month selector */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <button onClick={() => shiftMonth(-1)} className="rounded-xl p-2 text-brand-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-ink">{monthLabel}</span>
        <button onClick={() => shiftMonth(1)} className="rounded-xl p-2 text-brand-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month totals */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <p className="relative text-xs font-medium text-white/70">A look at your activity</p>
        <h2 className="relative mt-1 text-2xl font-bold tracking-tight">{monthLabel}</h2>
        <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
          <Mini label="Income" value={totals.Income} icon={ArrowDownLeft} />
          <Mini label="Expenses" value={totals.Expenses} icon={ArrowUpRight} />
          <Mini label="Savings" value={totals.Savings} icon={PiggyBank} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-ink">What would you like to record?</h2>
          <p className="mt-0.5 text-xs text-slate-500">Choose a transaction type to get started.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ActionCard label="Income" detail="Money received" icon={ArrowDownLeft} color="text-emerald-700" onClick={() => openNew("Income")} />
          <ActionCard label="Expense" detail="Money spent" icon={ArrowUpRight} color="text-rose-600" onClick={() => openNew("Expenses")} />
          <ActionCard label="Savings" detail="Set money aside" icon={PiggyBank} color="text-blue-700" onClick={() => openNew("Savings")} />
        </div>
      </section>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl bg-slate-100/80 p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
              filter === f ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {settings?.lateIncomeActive && (
        <p className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-xs text-brand-700">
          <Info size={14} className="mt-0.5 shrink-0" />
          Late income shift is on: income received on or after day {settings.lateIncomeDay} counts for next month.
        </p>
      )}

      {/* List */}
      {groups.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">
          No transactions for this month yet.
        </p>
      )}
      {groups.map(([key, rows]) => (
        <section key={key} className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">{dayLabel(key)}</h3>
          {rows.map((t) => (
            <TransactionRow key={t._id} t={t} onClick={() => openEdit(t)} />
          ))}
        </section>
      ))}

      <TransactionSheet
        open={sheetOpen}
        editing={editing}
        defaultType={newType}
        onClose={() => setSheetOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

function Mini({ label, value, icon: Icon }) {
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

function ActionCard({ label, detail, icon: Icon, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col items-center rounded-2xl border border-slate-100 bg-white px-2 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${color}`}>
        <Icon size={20} />
      </span>
      <span className="mt-2 text-xs font-bold text-ink">{label}</span>
      <span className="mt-0.5 text-[9px] leading-tight text-slate-400">{detail}</span>
    </button>
  );
}