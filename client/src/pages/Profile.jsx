import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import api from "../api";
import { money } from "../utils/format";
import { inputCls, labelCls } from "../utils/ui";
import { useAuth } from "../context/AuthContext";
import { isNative, sendTestReminder } from "../utils/reminders";

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data));
  }, []);

  if (!form) return <div className="p-5 text-sm text-gray-400">Loading…</div>;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const ruleTotal =
    (Number(form.ruleMandatory) || 0) + (Number(form.ruleSavings) || 0) + (Number(form.ruleWants) || 0);

  async function save() {
    setSaving(true);
    setMsg({ text: "", ok: true });
    try {
      const body = {
        userName: form.userName,
        startingYear: Number(form.startingYear),
        lateIncomeActive: form.lateIncomeActive,
        lateIncomeDay: Number(form.lateIncomeDay),
        ruleMandatory: Number(form.ruleMandatory),
        ruleSavings: Number(form.ruleSavings),
        ruleWants: Number(form.ruleWants),
        netWorthGoal: Number(form.netWorthGoal),
        billReminders: form.billReminders,
        reminderDaysBefore: Number(form.reminderDaysBefore),
        reminderTime: form.reminderTime,
      };
      await api.put("/settings", body);
      setMsg({ text: "Settings saved ✓", ok: true });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Could not save", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function recalc() {
    if (!window.confirm("Re-apply the late-income rule to all existing transactions?")) return;
    const { data } = await api.post("/settings/recalculate");
    setMsg({ text: `Updated ${data.updated} transactions ✓`, ok: true });
  }

  async function testReminder() {
    const ok = await sendTestReminder();
    setMsg(
      ok
        ? { text: "Test reminder arrives in 5 seconds. Lock your phone or leave the app.", ok: true }
        : { text: "Notifications are blocked. Allow them in Android Settings → Apps → Pave → Notifications.", ok: false }
    );
  }

  return (
    <div className="space-y-4 p-5">
      <h1 className="text-xl font-bold">Profile & Settings</h1>

      <section className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-900 to-brand-600 p-5 text-white shadow-lg">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
          {(form.userName || "P")[0].toUpperCase()}
        </span>
        <div>
          <p className="text-lg font-bold">{form.userName || "Your name"}</p>
          <p className="text-xs opacity-80">{user?.email}</p>
          <p className="text-xs opacity-80">Net worth goal {money(form.netWorthGoal)}</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">General</h2>

        <label className={labelCls}>Your name</label>
        <input className={inputCls} value={form.userName} onChange={(e) => set("userName", e.target.value)} />

        <label className={labelCls}>Base currency</label>
        <input className={`${inputCls} bg-gray-50 text-gray-400`} value="KES (Kenyan Shilling)" disabled />

        <label className={labelCls}>Starting year</label>
        <input className={inputCls} type="number" value={form.startingYear}
          onChange={(e) => set("startingYear", e.target.value)} />
        <p className="-mt-3 text-[11px] text-gray-400">Set once at the beginning and don't change it again.</p>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <h2 className="font-bold">Late monthly income</h2>
            <p className="text-xs text-gray-400">
              Income received on or after a certain day counts for next month.
            </p>
          </div>
          <button
            onClick={() => set("lateIncomeActive", !form.lateIncomeActive)}
            className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${
              form.lateIncomeActive ? "bg-brand-700" : "bg-gray-300"
            }`}
          >
            <span className={`block h-5 w-5 rounded-full bg-white transition ${
              form.lateIncomeActive ? "translate-x-5" : ""
            }`} />
          </button>
        </div>

        {form.lateIncomeActive && (
          <div className="mt-4">
            <label className={labelCls}>Starting on day (1-31)</label>
            <input className={inputCls} type="number" min="1" max="31" value={form.lateIncomeDay}
              onChange={(e) => set("lateIncomeDay", e.target.value)} />
          </div>
        )}

        <button onClick={recalc}
          className="mt-2 w-full rounded-2xl border border-dashed border-brand-500 py-3 text-sm font-semibold text-brand-700">
          Re-apply to existing transactions
        </button>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <h2 className="font-bold">Bill reminders</h2>
            <p className="text-xs text-gray-400">Get a notification when a bill is due.</p>
          </div>
          <button
            onClick={() => set("billReminders", !form.billReminders)}
            className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${
              form.billReminders ? "bg-brand-700" : "bg-gray-300"
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white transition ${
                form.billReminders ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {form.billReminders && (
          <div className="mt-4">
            <label className={labelCls}>Remind me</label>
            <select
              className={inputCls}
              value={form.reminderDaysBefore}
              onChange={(e) => set("reminderDaysBefore", e.target.value)}
            >
              <option value={0}>On the due date only</option>
              <option value={1}>1 day before</option>
              <option value={2}>2 days before</option>
              <option value={3}>3 days before</option>
              <option value={5}>5 days before</option>
              <option value={7}>7 days before</option>
            </select>

            <label className={labelCls}>Reminder time</label>
            <input
              type="time"
              className={inputCls}
              value={form.reminderTime || "08:00"}
              onChange={(e) => set("reminderTime", e.target.value)}
            />

            {isNative && (
              <button
                onClick={testReminder}
                className="mt-3 w-full rounded-2xl border border-dashed border-brand-500 py-3 text-sm font-semibold text-brand-700"
              >
                Send a test reminder
              </button>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 font-bold">Budget rule</h2>
        <p className="mb-3 text-xs text-gray-400">How your income should be split. Must add up to 100%.</p>
        <div className="grid grid-cols-3 gap-2">
          <RuleInput label="Mandatory" value={form.ruleMandatory} onChange={(v) => set("ruleMandatory", v)} />
          <RuleInput label="Savings & debt" value={form.ruleSavings} onChange={(v) => set("ruleSavings", v)} />
          <RuleInput label="Wants & giving" value={form.ruleWants} onChange={(v) => set("ruleWants", v)} />
        </div>
        <p className={`mt-2 text-xs font-semibold ${ruleTotal === 100 ? "text-green-600" : "text-red-500"}`}>
          Total: {ruleTotal}%
        </p>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Net worth goal</h2>
        <label className={labelCls}>Target (KES)</label>
        <input className={inputCls} type="number" value={form.netWorthGoal}
          onChange={(e) => set("netWorthGoal", e.target.value)} />
      </section>

      {msg.text && (
        <p className={`text-center text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}

      <button onClick={save} disabled={saving || ruleTotal !== 100}
        className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save Settings"}
      </button>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-700 py-4 text-sm font-bold text-brand-700"
      >
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}

function RuleInput({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-500">{label}</p>
      <div className="flex items-center rounded-2xl border border-gray-200 px-3 py-2">
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold outline-none" />
        <span className="text-xs text-gray-400">%</span>
      </div>
    </div>
  );
}