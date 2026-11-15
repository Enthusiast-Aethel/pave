import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../api";
import Sheet from "./Sheet";
import { CATEGORIES } from "../utils/categories";
import { toInputDate } from "../utils/format";
import { inputCls, labelCls } from "../utils/ui";

const empty = () => ({
  name: "",
  linkedCategory: CATEGORIES.Savings[0],
  target: "",
  openingBalance: "0",
  plannedPerMonth: "",
  targetDate: toInputDate(new Date(new Date().getFullYear() + 1, 11, 31)),
});

export default function GoalSheet({ open, editing, onClose, onSaved }) {
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
            linkedCategory: editing.linkedCategory,
            target: String(editing.target),
            openingBalance: String(editing.openingBalance),
            plannedPerMonth: String(editing.plannedPerMonth),
            targetDate: toInputDate(editing.targetDate),
          }
        : empty()
    );
  }, [open, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim() || !(Number(form.target) > 0)) {
      setError("Enter a goal name and a target amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        target: Number(form.target),
        openingBalance: Number(form.openingBalance) || 0,
        plannedPerMonth: Number(form.plannedPerMonth) || 0,
      };
      if (editing) await api.put(`/goals/${editing._id}`, body);
      else await api.post("/goals", body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this goal?")) return;
    await api.delete(`/goals/${editing._id}`);
    onSaved();
    onClose();
  }

  return (
    <Sheet open={open} title={editing ? "Edit Goal" : "New Goal"} onClose={onClose}>
      <label className={labelCls}>Goal name</label>
      <input className={inputCls} placeholder="e.g. Emergency Fund" value={form.name}
        onChange={(e) => set("name", e.target.value)} />

      <label className={labelCls}>Linked savings category</label>
      <select className={inputCls} value={form.linkedCategory} onChange={(e) => set("linkedCategory", e.target.value)}>
        {CATEGORIES.Savings.map((c) => <option key={c}>{c}</option>)}
      </select>
      <p className="-mt-3 mb-4 text-[11px] text-gray-400">
        Savings you log in this category count toward the goal automatically.
      </p>

      <label className={labelCls}>Target amount (KES)</label>
      <input className={inputCls} type="number" inputMode="decimal" value={form.target}
        onChange={(e) => set("target", e.target.value)} />

      <label className={labelCls}>Opening balance (saved before tracking)</label>
      <input className={inputCls} type="number" inputMode="decimal" value={form.openingBalance}
        onChange={(e) => set("openingBalance", e.target.value)} />

      <label className={labelCls}>Planned per month (KES)</label>
      <input className={inputCls} type="number" inputMode="decimal" value={form.plannedPerMonth}
        onChange={(e) => set("plannedPerMonth", e.target.value)} />

      <label className={labelCls}>Target date</label>
      <input className={inputCls} type="date" value={form.targetDate}
        onChange={(e) => set("targetDate", e.target.value)} />

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <button onClick={save} disabled={saving}
        className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save Goal"}
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