import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Info } from "lucide-react";
import api from "../api";
import TransactionRow from "../components/TransactionRow";
import TransactionSheet from "../components/TransactionSheet";
import { dayLabel, money, toInputDate } from "../utils/format";

const FILTERS = ["All", "Income", "Expenses", "Savings"];

export default function Transactions() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4 p-5">
      <h1 className="text-xl font-bold">Transactions</h1>

      {/* Month selector */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm">
        <button onClick={() => shiftMonth(-1)} className="rounded-xl p-2 text-brand-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button onClick={() => shiftMonth(1)} className="rounded-xl p-2 text-brand-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month totals */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Income" value={totals.Income} color="text-brand-500" />
        <Mini label="Expenses" value={totals.Expenses} color="text-red-500" />
        <Mini label="Savings" value={totals.Savings} color="text-brand-700" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-xs text-brand-700">
        <Info size={14} className="mt-0.5 shrink-0" />
        Late income shift is on: income received on or after the 20th counts for next month.
      </p>

      {/* List */}
      {groups.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">
          No transactions for this month yet.
        </p>
      )}
      {groups.map(([key, rows]) => (
        <section key={key} className="space-y-2">
          <h3 className="text-sm font-bold text-gray-500">{dayLabel(key)}</h3>
          {rows.map((t) => (
            <TransactionRow key={t._id} t={t} onClick={() => openEdit(t)} />
          ))}
        </section>
      ))}

      {/* Floating add button */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 mx-auto flex max-w-md justify-end px-5">
        <button
          onClick={openNew}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>

      <TransactionSheet
        open={sheetOpen}
        editing={editing}
        onClose={() => setSheetOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

function Mini({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={`mt-1 text-xs font-bold ${color}`}>{money(value)}</p>
    </div>
  );
}