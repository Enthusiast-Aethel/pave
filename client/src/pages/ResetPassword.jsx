import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";
import api from "../api";
import { inputCls, labelCls } from "../utils/ui";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState("validating");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    const e = searchParams.get("email");
    if (!t || !e) {
      setStatus("error");
      setMessage("Invalid or missing reset link. Please request a new one.");
    } else {
      setToken(t);
      setEmail(e);
      setStatus("ready");
    }
  }, [searchParams]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    if (!form.password) {
      setStatus("error");
      return setMessage("Enter a new password");
    }
    if (form.password.length < 8) {
      setStatus("error");
      return setMessage("Password must be at least 8 characters");
    }
    if (form.password !== form.confirm) {
      setStatus("error");
      return setMessage("Passwords do not match");
    }

    setStatus("loading");
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password: form.password,
      });
      setStatus("success");
      setMessage("Password reset successful! Redirecting to sign in...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Could not reset password. The link may have expired."
      );
    }
  }

  if (status === "validating") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface px-6">
        <div className="flex h-12 w-12 animate-spin rounded-full border-3 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  if (status === "error" && !token) {
    return (
      <div className="flex min-h-dvh flex-col bg-surface">
        <section className="relative flex min-h-[270px] flex-col bg-gradient-to-br from-[#10233a] via-[#174b58] to-brand-700 px-6 pb-14 pt-[calc(1.75rem+env(safe-area-inset-top))] text-white">
          <Link
            to="/login"
            aria-label="Back to login"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="relative mt-auto text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Invalid Link</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/75">{message}</p>
          </div>
        </section>
        <main className="relative -mt-7 flex-1 rounded-t-[2rem] bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_36px_rgba(12,30,43,0.1)]">
          <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200" />
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
            <p className="mt-4 text-lg font-semibold text-ink">Reset Link Expired</p>
            <p className="mx-auto mt-2 max-w-xs text-slate-500">{message}</p>
            <Link
              to="/forgot-password"
              className="mt-6 block w-full rounded-2xl bg-brand-700 py-4 text-center text-sm font-bold text-white"
            >
              Request New Link
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <section className="relative flex min-h-[270px] flex-col bg-gradient-to-br from-[#10233a] via-[#174b58] to-brand-700 px-6 pb-14 pt-[calc(1.75rem+env(safe-area-inset-top))] text-white">
        <div className="pointer-events-none absolute -right-16 top-6 h-52 w-52 rounded-full border border-white/10" />
        <Link
          to="/login"
          aria-label="Back to login"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur"
        >
          <ArrowLeft size={19} />
        </Link>
        <div className="relative mt-auto">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">
              P
            </span>
            Pave
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {status === "success" ? "Password Reset!" : "Create New Password"}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
            {status === "success"
              ? "Your password has been updated. You can now sign in with your new password."
              : "Enter your new password below. Make it strong and memorable."}
          </p>
        </div>
      </section>

      <main className="relative -mt-7 flex-1 rounded-t-[2rem] bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_36px_rgba(12,30,43,0.1)]">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200" />

        {status === "success" ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-green-50 p-4">
              <CheckCircle className="h-8 w-8 shrink-0 text-green-600" />
              <p className="font-semibold text-green-800">{message}</p>
            </div>
            <Link
              to="/login"
              className="mt-4 block w-full rounded-2xl bg-brand-700 py-4 text-center text-sm font-bold text-white"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className={labelCls}>New Password</label>
            <div className="relative mb-4 mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={show ? "text" : "password"}
                className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
                value={form.password}
                autoComplete="new-password"
                onChange={(e) => set("password", e.target.value)}
                placeholder="At least 8 characters"
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className={labelCls}>Confirm Password</label>
            <div className="relative mb-4 mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={show ? "text" : "password"}
                className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
                value={form.confirm}
                autoComplete="new-password"
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="Repeat your new password"
                disabled={status === "loading"}
              />
            </div>

            {message && (
              <p className={`mb-3 text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
                {status === "error" && <AlertCircle className="mr-1 inline h-4 w-4" />}
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,107,74,0.18)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-brand-700">
            Back to Sign In
          </Link>
        </p>
      </main>
    </div>
  );
}