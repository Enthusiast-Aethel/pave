import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";
import { inputCls, labelCls } from "../utils/ui";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return setMessage("Enter your email address");

    setStatus("loading");
    setMessage("");
    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("success");
      setMessage("If that email exists, a reset link has been sent");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Could not send reset link. Please try again.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <section className="relative flex min-h-[270px] flex-col bg-gradient-to-br from-[#10233a] via-[#174b58] to-brand-700 px-6 pb-14 pt-[calc(1.75rem+env(safe-area-inset-top))] text-white">
        <div className="pointer-events-none absolute -right-16 top-6 h-52 w-52 rounded-full border border-white/10" />
        <Link to="/login" aria-label="Back to login" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft size={19} />
        </Link>
        <div className="relative mt-auto">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">P</span>
            Pave
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
            Enter your email and we'll send you a link to create a new password.
          </p>
        </div>
      </section>

      <main className="relative -mt-7 flex-1 rounded-t-[2rem] bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_36px_rgba(12,30,43,0.1)]">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200" />
        <h2 className="text-lg font-bold text-ink">Forgot Password</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">We'll email you a secure link to reset your password.</p>

        {status === "success" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
              <CheckCircle className="h-8 w-8 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Check your email</p>
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 text-center">
              Didn't receive it?{" "}
              <button onClick={() => { setStatus("idle"); setMessage(""); }} className="font-semibold text-brand-700 underline">
                Try again
              </button>
            </p>
            <Link to="/login" className="block mt-4 w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white text-center">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className={labelCls}>Email</label>
            <div className="relative mb-4 mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
              <input
                type="email"
                className={`${inputCls} rounded-xl border-slate-200 bg-slate-50/60 pl-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === "loading"}
              />
            </div>

            {message && (
              <p className={`mb-3 text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
                {status === "error" && <AlertCircle className="inline h-4 w-4 mr-1" />}
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 w-full rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,107,74,0.18)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-brand-700">Sign in</Link>
        </p>
      </main>
    </div>
  );
}