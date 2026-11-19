import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { inputCls, labelCls } from "../utils/ui";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (isRegister && !form.name.trim()) return setError("Enter your name");
    if (!form.email.trim()) return setError("Enter your email");
    if (isRegister && form.password.length < 8)
      return setError("Password must be at least 8 characters");
    if (!form.password) return setError("Enter your password");

    setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <section className="relative flex min-h-[270px] flex-col bg-gradient-to-br from-[#10233a] via-[#174b58] to-brand-700 px-6 pb-14 pt-7 text-white">
        <div className="pointer-events-none absolute -right-16 top-6 h-52 w-52 rounded-full border border-white/10" />
        <Link to="/welcome" aria-label="Back to welcome" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft size={19} />
        </Link>
        <div className="relative mt-auto">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">P</span>
            Pave
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isRegister ? "Let’s get started" : "Welcome back"}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
            {isRegister ? "Create your account and start paving your way." : "Pick up where you left off and keep your plans moving."}
          </p>
        </div>
      </section>

      <main className="relative -mt-7 flex-1 rounded-t-[2rem] bg-white px-6 pb-8 pt-7 shadow-[0_-12px_36px_rgba(12,30,43,0.1)]">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200" />
        <h2 className="text-lg font-bold text-ink">{isRegister ? "Your details" : "Sign in to Pave"}</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">
          {isRegister ? "A few details are all you need to begin." : "We’re glad to have you back."}
        </p>

        <form onSubmit={submit}>
          {isRegister && (
            <>
              <label className={labelCls}>Your name</label>
              <input
                className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
                value={form.name}
                autoComplete="name"
                onChange={(e) => set("name", e.target.value)}
              />
            </>
          )}

          <label className={labelCls}>Email</label>
          <input
            className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={(e) => set("email", e.target.value)}
          />

          <label className={labelCls}>Password</label>
          <div className="relative mb-4 mt-1">
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              type={show ? "text" : "password"}
              value={form.password}
              autoComplete={isRegister ? "new-password" : "current-password"}
              onChange={(e) => set("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {isRegister && <p className="-mt-2 mb-4 text-[11px] text-slate-400">At least 8 characters.</p>}

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,107,74,0.18)] transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account? " : "New to Pave? "}
          <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-brand-700">
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </main>
    </div>
  );
}