import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../api";
import { CATEGORIES } from "../utils/categories";
import { toInputDate } from "../utils/format";
import useSettings from "../hooks/useSettings";

const TYPES = ["Income", "Expenses", "Savings"];
const emptyForm = (type = "Expenses") => ({
  type,
  category: CATEGORIES[type][0],
  amount: "",
  date: toInputDate(),
  notes: "",
});

export default function TransactionSheet({ open, editing, defaultType = "Expenses", onClose, onSaved }) {
  const settings = useSettings();
  const lateDay = settings?.lateIncomeDay ?? 20;
  const lateActive = settings?.lateIncomeActive ?? true;

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fill the form when opening (blank for new, existing values for edit)
  useEffect(() => {
    if (!open) return;
    setError("");
    if (editing) {
      setForm({
        type: editing.type,
        category: editing.category,
        amount: String(editing.amount),
        date: toInputDate(editing.date),
        notes: editing.notes || "",
      });
    } else {
      setForm(emptyForm(defaultType));
    }
  }, [open, editing, defaultType]);

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const changeType = (type) =>
    setForm((f) => ({ ...f, type, category: CATEGORIES[type][0] }));

  const lateIncome =
    lateActive && form.type === "Income" && new Date(form.date + "T00:00:00").getDate() >= lateDay;

  async function save() {
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, amount: Number(form.amount) };
      if (editing) await api.put(`/transactions/${editing._id}`, body);
      else await api.post("/transactions", body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${editing._id}`);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {editing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2">
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="mb-4 grid grid-cols-3 rounded-2xl bg-brand-50 p-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => changeType(t)}
              className={`rounded-xl py-2 text-sm font-semibold ${
                form.type === t ? "bg-brand-700 text-white" : "text-brand-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <label className="text-xs font-medium text-gray-500">Amount</label>
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <span className="text-sm font-semibold text-gray-400">KES</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            className="w-full bg-transparent text-2xl font-bold outline-none"
          />
        </div>

        {/* Category */}
        <label className="text-xs font-medium text-gray-500">Category</label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="mb-4 mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        >
          {CATEGORIES[form.type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Date */}
        <label className="text-xs font-medium text-gray-500">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="mb-2 mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
        />
        {lateIncome && (
          <p className="mb-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
            Income received on or after day {lateDay} counts for next month.
          </p>
        )}

        {/* Notes */}
        <label className="text-xs font-medium text-gray-500">Notes (optional)</label>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. Matatu to town"
          className="mb-4 mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Transaction"}
        </button>

        {editing && (
          <button
            onClick={remove}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-red-500"
          >
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}