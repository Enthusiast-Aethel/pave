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
    <div className="w-full min-h-dvh bg-gradient-to-b from-sky-100 via-brand-50 to-surface p-6">
      <Link to="/welcome" className="inline-flex rounded-full bg-white p-2 shadow-sm">
        <ArrowLeft size={18} />
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold text-brand-900">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 mt-2 text-sm text-gray-600">
        {isRegister ? "Start paving your way to financial freedom." : "Sign in to continue with Pave."}
      </p>

      <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-sm">
        {isRegister && (
          <>
            <label className={labelCls}>Your name</label>
            <input
              className={inputCls}
              value={form.name}
              autoComplete="name"
              onChange={(e) => set("name", e.target.value)}
            />
          </>
        )}

        <label className={labelCls}>Email</label>
        <input
          className={inputCls}
          type="email"
          value={form.email}
          autoComplete="email"
          onChange={(e) => set("email", e.target.value)}
        />

        <label className={labelCls}>Password</label>
        <div className="relative mb-4 mt-1">
          <input
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none"
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
        {isRegister && <p className="-mt-2 mb-4 text-[11px] text-gray-400">At least 8 characters.</p>}

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        {isRegister ? "Already have an account? " : "New to Pave? "}
        <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-brand-700">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}