import { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Landmark, Building, Banknote } from "lucide-react";
import api from "../api";
import Sheet from "../components/Sheet";
import { money } from "../utils/format";
import { inputCls, labelCls } from "../utils/ui";

const TYPES = ["MMF", "Stocks", "SACCO", "Bonds", "Other"];
const ICONS = { MMF: TrendingUp, Stocks: Landmark, SACCO: Building, Bonds: Banknote, Other: TrendingUp };

export default function Investments() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", type: "MMF", institution: "",
    units: "", currentPrice: "", initialValue: "", currentValue: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/investments");
    setItems(data.items);
    setSummary(data.summary);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", type: "MMF", institution: "", units: "", currentPrice: "", initialValue: "", currentValue: "" });
    setSheetOpen(true);
  };

  const openEdit = (i) => {
    setEditing(i);
    setForm({
      name: i.name, type: i.type, institution: i.institution || "",
      units: String(i.units || ""), currentPrice: String(i.currentPrice || ""),
      initialValue: String(i.initialValue || ""), currentValue: String(i.currentValue || ""),
    });
    setSheetOpen(true);
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim() || Number(form.currentValue) <= 0) {
      setError("Enter name and current value");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name, type: form.type, institution: form.institution,
        units: Number(form.units) || 0, currentPrice: Number(form.currentPrice) || 0,
        initialValue: Number(form.initialValue) || 0, currentValue: Number(form.currentValue),
      };
      if (editing) await api.put(`/investments/${editing._id}`, body);
      else await api.post("/investments", body);
      load();
      setSheetOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this investment?")) return;
    await api.delete(`/investments/${editing._id}`);
    load();
    setSheetOpen(false);
  };

  const updateValue = async (item) => {
    const newVal = window.prompt(`Update value for ${item.name} (current: ${money(item.currentValue)}):`, String(item.currentValue));
    if (!newVal) return;
    await api.put(`/investments/${item._id}`, { currentValue: Number(newVal) });
    load();
  };

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
<header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Track your portfolio</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Investments</h1>
        </div>
        <button onClick={openNew} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100">
          <Plus size={20} />
        </button>
      </header>

      {summary && (
        <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
          <p className="relative text-xs font-medium text-white/70">Portfolio summary</p>
          <p className="relative mt-2 text-3xl font-bold tracking-tight">{money(summary.totalCurrent)}</p>
          <p className="relative mt-1 text-xs text-white/65">Invested {money(summary.totalInvested)} · Gain {summary.totalGain >= 0 ? "+" : ""}{money(summary.totalGain)} ({summary.gainPct.toFixed(1)}%)</p>
        </section>
      )}

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-ink">Start tracking your investments</p>
            <p className="mt-1 text-xs text-slate-500">Add MMF, stocks, SACCO shares and more.</p>
            <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white">
              Add investment <Plus size={15} />
            </button>
          </div>
        )}
        {items.map((item) => {
          const Icon = ICONS[item.type] || TrendingUp;
          const gain = item.currentValue - (item.initialValue || 0);
          const gainPct = item.initialValue ? ((gain / item.initialValue) * 100).toFixed(1) : "0";
          return (
            <button key={item._id} onClick={() => updateValue(item)} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.type === "Stocks" ? "bg-blue-50 text-blue-600" : item.type === "SACCO" ? "bg-purple-50 text-purple-600" : "bg-brand-50 text-brand-700"}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600">{item.type}</span>
                  </p>
                  {item.institution && <p className="text-xs text-slate-400">{item.institution}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{money(item.currentValue)}</p>
                <p className={`text-xs font-semibold ${gain >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {gain >= 0 ? "+" : ""}{money(gain)} ({gainPct}%)
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={sheetOpen} title={editing ? "Edit Investment" : "Add Investment"} onClose={() => setSheetOpen(false)}>
        <label className={labelCls}>Name</label>
        <input className={inputCls} placeholder="e.g. Sanlam MMF" value={form.name} onChange={(e) => setF("name", e.target.value)} />

        <label className={labelCls}>Type</label>
        <select className={inputCls} value={form.type} onChange={(e) => setF("type", e.target.value)}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label className={labelCls}>Institution (optional)</label>
        <input className={inputCls} placeholder="e.g. Sanlam, ICEA, Safaricom SACCO" value={form.institution} onChange={(e) => setF("institution", e.target.value)} />

        <label className={labelCls}>Units / Shares</label>
        <input className={inputCls} type="number" inputMode="decimal" placeholder="0" value={form.units} onChange={(e) => setF("units", e.target.value)} />

        <label className={labelCls}>Price per unit</label>
        <input className={inputCls} type="number" inputMode="decimal" placeholder="0" value={form.currentPrice} onChange={(e) => setF("currentPrice", e.target.value)} />

        <label className={labelCls}>Initial invested (KES)</label>
        <input className={inputCls} type="number" inputMode="decimal" placeholder="0" value={form.initialValue} onChange={(e) => setF("initialValue", e.target.value)} />

        <label className={labelCls}>Current value (KES)</label>
        <input className={inputCls} type="number" inputMode="decimal" placeholder="0" value={form.currentValue} onChange={(e) => setF("currentValue", e.target.value)} />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save Investment"}
        </button>

        {editing && (
          <button onClick={remove} className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-red-500">
            <Trash2 size={16} /> Delete
          </button>
        )}
      </Sheet>
    </div>
  );
}