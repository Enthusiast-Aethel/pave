import { useEffect, useState } from "react";
import { ArrowUpRight, FileText, Landmark, LogOut, Moon, PieChart, Sun, Target, UserRound, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import { money } from "../utils/format";
import { inputCls, labelCls } from "../utils/ui";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { isNative, sendTestReminder } from "../utils/reminders";

const APP_VERSION = "1.0.0";
const UPDATE_URL = "https://github.com/Enthusiast-Aethel/pave/releases/latest";

export default function Profile() {
  const { user, logout, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [saving, setSaving] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data));
    // Check for new version from GitHub
    fetch("https://api.github.com/repos/Enthusiast-Aethel/pave/releases/latest")
      .then((r) => r.json())
      .then((d) => setLatestVersion(d.tag_name || d.name || null))
      .catch(() => {});
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
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-slate-500">Your personal space</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Account</h1>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <UserRound size={20} />
        </span>
      </header>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#10233a] via-[#173b51] to-brand-900 p-5 text-white shadow-[0_12px_28px_rgba(16,35,58,0.18)]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/20">
            {(form.userName || "P").trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">Pave account</p>
            <p className="mt-1 truncate text-lg font-bold">{form.userName || "Your name"}</p>
            <p className="truncate text-xs text-white/70">{user?.email}</p>
          </div>
        </div>
        <div className="relative mt-5 flex items-center justify-between border-t border-white/15 pt-4">
          <div>
            <p className="text-[10px] font-medium text-white/65">Net worth goal</p>
            <p className="mt-0.5 text-sm font-bold">{money(form.netWorthGoal)}</p>
          </div>
          <Link to="/wealth" className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
            View progress <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-base font-bold text-ink">Your Pave shortcuts</h2>
          <p className="mt-0.5 text-xs text-slate-500">Pick up where you left off.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <AccountShortcut to="/transactions" label="Activity" icon={ArrowUpRight} />
          <AccountShortcut to="/budget" label="Budget" icon={PieChart} />
          <AccountShortcut to="/bills" label="Bills" icon={FileText} />
          <AccountShortcut to="/goals" label="Goals" icon={Target} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            {theme === "dark" ? <Moon size={19} /> : <Sun size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-ink">Appearance</h2>
            <p className="text-xs text-slate-500">Choose how Pave looks on this device.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                theme === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <UserRound size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink">Personal details</h2>
            <p className="text-[11px] text-slate-400">Your name and currency preferences</p>
          </div>
        </div>

        <label className={labelCls}>Your name</label>
        <input className={inputCls} value={form.userName} onChange={(e) => set("userName", e.target.value)} />

        <label className={labelCls}>Base currency</label>
        <input className={`${inputCls} bg-gray-50 text-gray-400`} value="KES (Kenyan Shilling)" disabled />

        <label className={labelCls}>Starting year</label>
        <input className={inputCls} type="number" value={form.startingYear}
          onChange={(e) => set("startingYear", e.target.value)} />
        <p className="-mt-3 text-[11px] text-gray-400">Set once at the beginning and don't change it again.</p>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <Lock size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink">Change password</h2>
            <p className="text-[11px] text-slate-400">Update your account password</p>
          </div>
        </div>

        <ChangePasswordForm />
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
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

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
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

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">About Pave</h2>
            <p className="text-[11px] text-slate-400">Version info & updates</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <div>
            <p className="text-xs font-semibold text-ink">Current version</p>
            <p className="text-[11px] text-slate-500">{APP_VERSION}</p>
          </div>
          {latestVersion && latestVersion !== APP_VERSION && (
            <a
              href={UPDATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2 text-xs font-bold text-white"
            >
              Update available
            </a>
          )}
        </div>
        {latestVersion && latestVersion !== APP_VERSION && (
          <p className="mt-2 text-[11px] text-amber-600">
            A new version ({latestVersion}) is available. Tap to update.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
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

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Landmark size={18} />
          </span>
          <h2 className="font-bold">Net worth goal</h2>
        </div>
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

function AccountShortcut({ to, label, icon: Icon }) {
  return (
    <Link to={to} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white px-1.5 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon size={19} />
      </span>
      <span className="truncate text-[10px] font-semibold text-slate-600">{label}</span>
    </Link>
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

function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: "", new: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setMsg({ text: "", ok: true });
    if (!form.current || !form.new || !form.confirm) return setMsg({ text: "Fill in all fields", ok: false });
    if (form.new.length < 8) return setMsg({ text: "New password must be at least 8 characters", ok: false });
    if (form.new !== form.confirm) return setMsg({ text: "New passwords do not match", ok: false });
    if (form.current === form.new) return setMsg({ text: "New password must be different from current", ok: false });

    setSaving(true);
    try {
      await changePassword(form.current, form.new);
      setForm({ current: "", new: "", confirm: "" });
      setMsg({ text: "Password changed successfully ✓", ok: true });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Could not change password", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className={labelCls}>Current Password</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
        <input
          type={show.current ? "text" : "password"}
          className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
          value={form.current}
          autoComplete="current-password"
          onChange={(e) => set("current", e.target.value)}
          placeholder="Enter current password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <label className={labelCls}>New Password</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
        <input
          type={show.new ? "text" : "password"}
          className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
          value={form.new}
          autoComplete="new-password"
          onChange={(e) => set("new", e.target.value)}
          placeholder="At least 8 characters"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <label className={labelCls}>Confirm New Password</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
        <input
          type={show.confirm ? "text" : "password"}
          className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
          value={form.confirm}
          autoComplete="new-password"
          onChange={(e) => set("confirm", e.target.value)}
          placeholder="Repeat new password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {msg.text && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-brand-700 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
}