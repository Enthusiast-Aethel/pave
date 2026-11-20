import { useState } from "react";
import { useAppLock } from "../context/AppLockContext";

export default function LockScreen({ onUnlock }) {
  const { pin, setPin, authenticate, biometricAvailable, failedAttempts, settings } = useAppLock();
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    setError("");
    const ok = await authenticate(settings?.appLockMethod || "PIN", pin);
    if (ok) {
      onUnlock();
    } else {
      setError("Invalid PIN");
    }
  };

  const useBiometric = async () => {
    if (biometricAvailable) {
      const ok = await authenticate("Biometric", "");
      if (ok) onUnlock();
      else setError("Biometric failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 mb-4">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-ink">Unlock Pave</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your PIN to continue</p>
        </div>

        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        {failedAttempts > 0 && <p className="mb-4 text-center text-xs text-amber-600">{failedAttempts} failed attempt(s)</p>}

        <div className="grid grid-cols-3 gap-3 mb-6" role="group" aria-label="PIN entry">
          {pin.split("").map((d, i) => (
            <div key={i} className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl font-bold text-ink border-2" style={{ borderColor: d ? "#0f6b4a" : "#e2e8f0" }}>{d}</div>
          ))}
          {Array.from({ length: 4 - pin.length }).map((_, i) => (
            <div key={i} className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border-2 border-slate-200" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button key={n} onClick={() => pin.length < 4 && setPin((p) => p + n)} className="flex h-12 items-center justify-center rounded-xl bg-slate-50 text-xl font-semibold text-ink active:scale-95">{n}</button>
          ))}
          <button onClick={() => setPin((p) => p.slice(0, -1))} className="flex h-12 items-center justify-center rounded-xl bg-slate-50 text-xl text-slate-500 active:scale-95" aria-label="Backspace">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button onClick={() => pin.length < 4 && setPin((p) => p + "0")} className="flex h-12 items-center justify-center rounded-xl bg-slate-50 text-xl font-semibold text-ink active:scale-95">0</button>
          <button onClick={() => setPin("")} className="flex h-12 items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-slate-500 active:scale-95">Clear</button>
        </div>

        {biometricAvailable && (
          <button onClick={useBiometric} className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-500 py-3 text-sm font-semibold text-brand-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Use Face/Fingerprint
          </button>
        )}
      </div>
    </div>
  );
}