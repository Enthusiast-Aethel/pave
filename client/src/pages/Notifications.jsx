import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BellOff, CheckCircle2 } from "lucide-react";
import { fetchDueSoon, isNative } from "../utils/reminders";
import useSettings from "../hooks/useSettings";
import { money } from "../utils/format";

const whenText = (b) => {
  if (b.daysToDue < 0) {
    const n = Math.abs(b.daysToDue);
    return `${n} day${n === 1 ? "" : "s"} overdue`;
  }
  if (b.daysToDue === 0) return "Due today";
  return `Due in ${b.daysToDue} day${b.daysToDue === 1 ? "" : "s"}`;
};

export default function Notifications() {
  const [bills, setBills] = useState(null);
  const settings = useSettings();

  useEffect(() => {
    const load = () => fetchDueSoon().then(setBills).catch(() => setBills([]));
    load();
    window.addEventListener("pave:data-changed", load);
    return () => window.removeEventListener("pave:data-changed", load);
  }, []);

  const groups = bills && [
    { title: "Overdue", color: "bg-red-500", items: bills.filter((b) => b.daysToDue < 0) },
    { title: "Due in the next 7 days", color: "bg-amber-400", items: bills.filter((b) => b.daysToDue >= 0 && b.daysToDue <= 7) },
    { title: "Later", color: "bg-gray-300", items: bills.filter((b) => b.daysToDue > 7) },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {!isNative && (
        <p className="rounded-2xl bg-brand-50 p-3 text-xs text-brand-700">
          Phone reminders are available in the Pave Android app. On the web, your due bills show here.
        </p>
      )}
      {isNative && settings?.billReminders === false && (
        <p className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">
          <BellOff size={16} /> Reminders are off.{" "}
          <Link to="/profile" className="font-semibold underline">Turn them on in Profile</Link>
        </p>
      )}

      {bills === null && <p className="py-8 text-center text-sm text-gray-400">Loading…</p>}

      {bills && bills.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-brand-700" size={40} />
          <p className="mt-3 font-semibold">You're all caught up</p>
          <p className="mt-1 text-sm text-gray-500">No unpaid bills in the next 30 days.</p>
        </div>
      )}

      {groups?.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.title} className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <span className={`h-2.5 w-2.5 rounded-full ${g.color}`} /> {g.title}
              </h2>
              {g.items.map((b) => (
                <Link
                  key={`${b._id}-${b.dueKey}`}
                  to="/bills"
                  className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
                >
                  <span>
                    <span className="block text-sm font-semibold">{b.name}</span>
                    <span className={`text-xs ${b.daysToDue < 0 ? "text-red-500" : "text-gray-400"}`}>
                      {whenText(b)} ·{" "}
                      {b.due.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{money(b.outstanding)}</span>
                </Link>
              ))}
            </section>
          )
      )}
    </div>
  );
}