import { useCallback, useEffect, useState } from "react";
import { Check, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import MonthPicker from "../components/MonthPicker";
import BillSheet from "../components/BillSheet";
import { categoryStyle } from "../utils/categories";
import { money } from "../utils/format";

const PILL = {
  Paid: "bg-green-50 text-green-600",
  Overdue: "bg-red-50 text-red-500",
  Upcoming: "bg-amber-50 text-amber-600",
  "Partly paid": "bg-amber-50 text-amber-600",
};
const DOT = {
  Paid: "bg-green-500",
  Overdue: "bg-red-500",
  Upcoming: "bg-amber-400",
  "Partly paid": "bg-amber-400",
};

// The "worst" status among bills due the same day decides the dot colour
function worstStatus(list) {
  if (list.some((b) => b.status === "Overdue")) return "Overdue";
  if (list.some((b) => b.status !== "Paid")) return "Upcoming";
  return "Paid";
}

function dueText(b) {
  if (b.status === "Paid") return "Paid";
  if (b.status === "Overdue") return `${Math.abs(b.daysToDue)} day${Math.abs(b.daysToDue) === 1 ? "" : "s"} overdue`;
  if (b.daysToDue === 0) return "Due today";
  return `Due in ${b.daysToDue} day${b.daysToDue === 1 ? "" : "s"}`;
}

export default function Bills() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [data, setData] = useState({ summary: {}, bills: [], others: [] });
  const [selectedDay, setSelectedDay] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get("/bills/month", { params: cursor }).then((r) => setData(r.data));
  }, [cursor]);

  useEffect(() => {
    setSelectedDay(null);
    load();
  }, [load]);

  const { summary, bills, others } = data;

  // Calendar cells (week starts on Monday)
  const first = (new Date(cursor.year, cursor.month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth() + 1;

  const shown = selectedDay ? bills.filter((b) => b.day === selectedDay) : bills;

  const openNew = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (b) => { setEditing(b); setSheetOpen(true); };

  async function markPaid(b) {
    const amountStr = window.prompt(`Mark "${b.name}" as paid for ${money(b.outstanding)}?`, String(b.outstanding));
    if (amountStr === null) return;
    const paidAmount = Number(amountStr);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      window.alert("Enter a valid amount");
      return;
    }
    try {
      await api.post(`/bills/${b._id}/mark-paid`, { amount: paidAmount });
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not mark as paid");
    }
  }

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <Link to="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-xs font-medium text-slate-500">Keep the month running smoothly</p>
        <h1 className="text-xl font-bold tracking-tight text-ink">Bills calendar</h1>
      </header>
      <MonthPicker cursor={cursor} onChange={setCursor} />
      <MonthPicker cursor={cursor} onChange={setCursor} />

      {/* Summary */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <p className="relative text-xs font-medium text-white/70">Bills overview</p>
        <p className="relative mt-2 text-3xl font-bold tracking-tight">{money(summary.totalDue ?? 0)}</p>
        <p className="relative mt-0.5 text-[11px] text-white/65">Total due this month</p>
        <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
          <BillStat label="Bills due" value={summary.count ?? 0} />
          <BillStat label="Paid" value={money(summary.paid ?? 0).replace("KES ", "")} />
          <BillStat label="Overdue" value={summary.overdue ?? 0} />
        </div>
      </section>

      {/* Calendar */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const dayBills = bills.filter((b) => b.day === day);
            const isToday = isCurrentMonth && day === now.getDate();
            const selected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => dayBills.length && setSelectedDay(selected ? null : day)}
                className={`mx-auto flex h-11 w-9 flex-col items-center justify-center rounded-xl text-sm ${
                  selected ? "bg-[#174b86] text-white" : isToday ? "ring-2 ring-[#174b86]" : ""
                }`}
              >
                <span className="font-medium">{day}</span>
                {dayBills.length > 0 && (
                  <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${DOT[worstStatus(dayBills)]}`} />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-center gap-4 text-[11px] text-gray-500">
          <Legend color="bg-red-500" text="Overdue" />
          <Legend color="bg-amber-400" text="Upcoming" />
          <Legend color="bg-green-500" text="Paid" />
        </div>
      </section>

      {/* List */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">
          {selectedDay ? `Due on day ${selectedDay}` : "Recurring Bills"}
        </h2>
        {selectedDay && (
          <button onClick={() => setSelectedDay(null)} className="text-sm font-semibold text-brand-600">
            Show all
          </button>
        )}
      </div>

      {shown.length === 0 && (
        <p className="py-6 text-center text-sm text-gray-400">
          {bills.length === 0 ? "No bills yet. Tap + to add one." : "No bills on this day."}
        </p>
      )}

      <div className="space-y-2">
        {shown.map((b) => {
          const [Icon, tint] = categoryStyle(b.category, "Expenses");
          return (
            <div key={b._id} className="flex items-center gap-2">
              <button onClick={() => openEdit(b)}
                className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{b.name}</span>
                  <span className="block text-xs text-gray-400">
                    {b.frequency} · {new Date(b.dueDate).toLocaleDateString("en-KE", { day: "numeric", month: "short" })} · {dueText(b)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-bold">{money(b.amount)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PILL[b.status]}`}>
                    {b.status}
                  </span>
                </span>
              </button>
              {b.status !== "Paid" && (
                <button
                  type="button"
                  onClick={() => markPaid(b)}
                  title="Mark as paid"
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-700 px-3 text-xs font-bold text-white"
                >
                  <Check size={16} /> Paid
                </button>
              )}
            </div>
          );
        })}
      </div>

      {others.length > 0 && !selectedDay && (
        <div className="space-y-2">
          <h3 className="pt-2 text-sm font-bold text-gray-400">Not due this month</h3>
          {others.map((b) => (
            <button key={b._id} onClick={() => openEdit(b)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm shadow-sm">
              <span>{b.name} <span className="text-xs text-gray-400">· {b.frequency}</span></span>
              <span className="font-semibold text-gray-400">{money(b.amount)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex w-full justify-end px-5">
        <button onClick={openNew}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg active:scale-95">
          <Plus size={28} />
        </button>
      </div>

      <BillSheet open={sheetOpen} editing={editing} onClose={() => setSheetOpen(false)} onSaved={load} />
    </div>
  );
}

function BillStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[10px] font-medium text-white/65">{label}</p>
      <p className="mt-1 truncate text-xs font-bold">{value}</p>
    </div>
  );
}

function Legend({ color, text }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} /> {text}
    </span>
  );
}