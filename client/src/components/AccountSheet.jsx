import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../api";
import Sheet from "./Sheet";
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from "../utils/wealth";
import { inputCls, labelCls, MONTH_NAMES } from "../utils/ui";

const keyOf = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

export default function AccountSheet({ open, editing, defaultKind, year, defaultMonth, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", kind: "Asset", category: ASSET_CATEGORIES[0] });
  const [month, setMonth] = useState(defaultMonth);
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = form.kind === "Asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  useEffect(() => {
    if (!open) return;
    setError("");
    setMonth(defaultMonth);
    setForm(
      editing
        ? { name: editing.name, kind: editing.kind, category: editing.category }
        : {
            name: "",
            kind: defaultKind,
            category: (defaultKind === "Asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES)[0],
          }
    );
  }, [open, editing, defaultKind, defaultMonth]);

  // Pre-fill the balance for the chosen month when editing
  useEffect(() => {
    if (!open) return;
    const v = editing?.balances?.[keyOf(year, month)];
    setBalance(v === undefined ? "" : String(v));
  }, [open, editing, year, month]);

  const changeKind = (kind) =>
    setForm((f) => ({
      ...f,
      kind,
      category: (kind === "Asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES)[0],
    }));

  async function save() {
    if (!form.name.trim()) return setError("Enter an account name");
    if (!editing && balance === "") return setError("Enter the current balance");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/networth/accounts/${editing._id}`, { name: form.name, category: form.category });
        if (balance !== "") {
          await api.put(`/networth/accounts/${editing._id}/balance`, {
            year, month: Number(month), amount: Number(balance),
          });
        }
      } else {
        await api.post("/networth/accounts", {
          ...form, year, month: Number(month), balance: Number(balance),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this account and all its balances?")) return;
    await api.delete(`/networth/accounts/${editing._id}`);
    onSaved();
    onClose();
  }

  return (
    <Sheet open={open} title={editing ? "Edit Account" : "Add Account"} onClose={onClose}>
      {!editing && (
        <div className="mb-4 grid grid-cols-2 rounded-2xl bg-brand-50 p-1">
          {["Asset", "Liability"].map((k) => (
            <button
              key={k}
              onClick={() => changeKind(k)}
              className={`rounded-xl py-2 text-sm font-semibold ${
                form.kind === k ? "bg-brand-700 text-white" : "text-brand-700"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      <label className={labelCls}>Account name</label>
      <input className={inputCls} placeholder="e.g. Main Bank Account" value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

      <label className={labelCls}>Category</label>
      <select className={inputCls} value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>

      <label className={labelCls}>Balance for month ({year})</label>
      <select className={inputCls} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
        {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>

      <label className={labelCls}>Month-end balance (KES)</label>
      <input className={inputCls} type="number" inputMode="decimal" placeholder="0"
        value={balance} onChange={(e) => setBalance(e.target.value)} />

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <button onClick={save} disabled={saving}
        className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save Account"}
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