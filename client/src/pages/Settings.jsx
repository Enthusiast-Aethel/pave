import { useState } from "react";
import { ArrowLeft, Moon, Sun, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { inputCls, labelCls } from "../utils/ui";

const APP_VERSION = "1.0.0";

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { changePassword } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordMsg, setPasswordMsg] = useState({ text: "", ok: true });
  const [savingPassword, setSavingPassword] = useState(false);

  const set = (k, v) => setPasswordForm((f) => ({ ...f, [k]: v }));

  async function submitPassword(e) {
    e.preventDefault();
    setPasswordMsg({ text: "", ok: true });
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) 
      return setPasswordMsg({ text: "Fill in all fields", ok: false });
    if (passwordForm.new.length < 8) 
      return setPasswordMsg({ text: "New password must be at least 8 characters", ok: false });
    if (passwordForm.new !== passwordForm.confirm) 
      return setPasswordMsg({ text: "New passwords do not match", ok: false });
    if (passwordForm.current === passwordForm.new) 
      return setPasswordMsg({ text: "New password must be different from current", ok: false });

    setSavingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setPasswordForm({ current: "", new: "", confirm: "" });
      setPasswordMsg({ text: "Password changed successfully ✓", ok: true });
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || "Could not change password", ok: false });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-5 pt-4">
      <header className="flex items-center justify-between px-1">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-medium text-slate-500">Your settings</p>
          <h1 className="text-xl font-bold tracking-tight text-ink">Settings</h1>
        </div>
        <div className="w-10" />
      </header>

      {/* Appearance Section */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </span>
          <h2 className="text-sm font-bold text-ink">Appearance</h2>
          <p className="text-xs text-slate-400">Choose theme</p>
        </div>
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          {[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }].map(({ value, label, icon: Icon }) => (
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

      {/* Change Password Section */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <Lock size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink">Change password</h2>
            <p className="text-[11px] text-slate-400">Update your account password</p>
          </div>
        </div>

        <form onSubmit={submitPassword} className="space-y-3">
          <label className={labelCls}>Current Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
            <input
              type={showPassword.current ? "text" : "password"}
              className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
              value={passwordForm.current}
              autoComplete="current-password"
              onChange={(e) => set("current", e.target.value)}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className={labelCls}>New Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
            <input
              type={showPassword.new ? "text" : "password"}
              className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
              value={passwordForm.new}
              autoComplete="new-password"
              onChange={(e) => set("new", e.target.value)}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => ({ ...s, new: !s.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className={labelCls}>Confirm New Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
            <input
              type={showPassword.confirm ? "text" : "password"}
              className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
              value={passwordForm.confirm}
              autoComplete="new-password"
              onChange={(e) => set("confirm", e.target.value)}
              placeholder="Repeat new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {passwordMsg.text && (
            <p className={`text-sm ${passwordMsg.ok ? "text-green-600" : "text-red-500"}`}>{passwordMsg.text}</p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full rounded-2xl bg-brand-700 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {savingPassword ? "Saving..." : "Change Password"}
          </button>
        </form>
      </section>

      {/* About Pave Section */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-ink mb-3">About Pave</h2>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600">Current version</p>
          <p className="text-sm text-slate-500">v{APP_VERSION}</p>
          <p className="mt-2 text-xs text-slate-400">
            Personal budgeting app. Built with ❤️ for Kenyan users.
          </p>
        </div>
      </section>
    </div>
  );
}