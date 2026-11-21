import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../api";
import Sheet from "./Sheet";
import { CATEGORIES } from "../utils/categories";
import { inputCls, labelCls, MONTH_NAMES } from "../utils/ui";

const empty = () => ({
  name: "",
  category: CATEGORIES.Expenses[0],
  amount: "",
  frequency: "Monthly",
  dueDay: "1",
  firstMonth: "1",
});

export default function BillSheet({ open, editing, onClose, onSaved }) {
  const [form, setForm] = useState(empty());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      editing
        ? {
            name: editing.name,
            category: editing.category,
            amount: String(editing.amount),
            frequency: editing.frequency,
            dueDay: String(editing.dueDay),
            firstMonth: String(editing.firstMonth || 1),
          }
        : empty()
    );
  }, [open, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim() || !(Number(form.amount) > 0)) {
      setError("Enter a name and an amount greater than 0");
      return;
    }
    const day = Number(form.dueDay);
    if (day < 1 || day > 31) {
      setError("Due day must be between 1 and 31");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        amount: Number(form.amount),
        dueDay: day,
        firstMonth: Number(form.firstMonth),
      };
      if (editing) await api.put(`/bills/${editing._id}`, body);
      else await api.post("/bills", body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this bill?")) return;
    await api.delete(`/bills/${editing._id}`);
    onSaved();
    onClose();
  }

  return (
    <Sheet open={open} title={editing ? "Edit Bill" : "Add Bill"} onClose={onClose}>
      <label className={labelCls}>Bill name</label>
      <input className={inputCls} placeholder="e.g. Rent" value={form.name}
        onChange={(e) => set("name", e.target.value)} />

      <label className={labelCls}>Linked expense category</label>
      <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
        {CATEGORIES.Expenses.map((c) => <option key={c}>{c}</option>)}
      </select>
      <p className="-mt-3 mb-4 text-[11px] text-gray-400">
        Expenses you log in this category count as payment for the bill.
      </p>

      <label className={labelCls}>Amount (KES)</label>
      <input className={inputCls} type="number" inputMode="decimal" placeholder="0"
        value={form.amount} onChange={(e) => set("amount", e.target.value)} />

      <label className={labelCls}>Frequency</label>
      <select className={inputCls} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Yearly</option>
      </select>

      <label className={labelCls}>Due day of month (1-31)</label>
      <input className={inputCls} type="number" min="1" max="31" value={form.dueDay}
        onChange={(e) => set("dueDay", e.target.value)} />

      {form.frequency !== "Monthly" && (
        <>
          <label className={labelCls}>First due month</label>
          <select className={inputCls} value={form.firstMonth} onChange={(e) => set("firstMonth", e.target.value)}>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </>
      )}

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <button onClick={save} disabled={saving}
        className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save Bill"}
      </button>

      {editing && (
        <button onClick={remove}
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-red-500">
          <Trash2 size={16} /> Delete
        </button>
      )}
    </Sheet>
  );
}