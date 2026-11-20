import { useEffect, useState } from "react";
import {
  Plus, Eye, EyeOff, Trash2, Edit2,
  Home, Zap, Droplets, Flame, Wifi, Bus, ShoppingBasket, HeartPulse,
  HeartHandshake, Wallet, Receipt, Sparkles, Repeat, Shapes, Landmark,
  PiggyBank, TrendingUp, Banknote, Briefcase, CreditCard,
} from "lucide-react";
import api from "../api";
import Sheet from "../components/Sheet";
import { inputCls, labelCls } from "../utils/ui";

const ICON_MAP = {
  Home, Zap, Droplets, Flame, Wifi, Bus, ShoppingBasket, HeartPulse,
  HeartHandshake, Wallet, Receipt, Sparkles, Repeat, Shapes, Landmark,
  PiggyBank, TrendingUp, Banknote, Briefcase, CreditCard,
};

function getIcon(name) {
  return ICON_MAP[name] || Shapes;
}

export default function Categories() {
  const [categories, setCategories] = useState({ Income: [], Expenses: [], Savings: [] });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Expenses" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/categories");
    setCategories(data);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", type: "Expenses" });
    setSheetOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type });
    setSheetOpen(true);
  };

  const toggleHidden = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { hidden: !cat.hidden });
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Failed to update");
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError("Enter category name");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.put(`/categories/${editing._id}`, form);
      else await api.post("/categories", form);
      load();
      setSheetOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${editing._id}`);
    load();
    setSheetOpen(false);
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Customize your categories</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Categories</h1>
        </div>
        <button onClick={openNew} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100">
          <Plus size={20} />
        </button>
      </header>

      {["Income", "Expenses", "Savings"].map((type) => (
        <section key={type} className="space-y-2">
          <h2 className="px-1 text-sm font-bold text-slate-500">{type}</h2>
          {categories[type]?.map((cat) => (
            <div key={cat._id || cat.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getIcon(cat.icon);
                  return <Icon size={20} />;
                })()}
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-slate-400">{cat.isCustom ? "Custom" : "Built-in"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleHidden(cat)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={cat.hidden ? "Show" : "Hide"}>
                  {cat.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {cat.isCustom && (
                  <>
                    <button onClick={() => openEdit(cat)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => { setEditing(cat); remove(); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {(!categories[type] || categories[type].length === 0) && (
            <p className="px-1 text-sm text-slate-400">No {type.toLowerCase()} categories</p>
          )}
        </section>
      ))}

      <Sheet open={sheetOpen} title={editing ? "Edit Category" : "Add Category"} onClose={() => setSheetOpen(false)}>
        <label className={labelCls}>Category name</label>
        <input className={inputCls} placeholder="e.g. Coffee" value={form.name} onChange={(e) => setF("name", e.target.value)} />

        <label className={labelCls}>Type</label>
        <select className={inputCls} value={form.type} onChange={(e) => setF("type", e.target.value)}>
          <option value="Income">Income</option>
          <option value="Expenses">Expenses</option>
          <option value="Savings">Savings</option>
        </select>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save Category"}
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