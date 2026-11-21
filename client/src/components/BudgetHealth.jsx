import { useEffect, useState } from "react";
import api from "../api";

const ROWS = [
  { key: "mandatory", label: "Mandatory bills", bar: "bg-brand-700", warnOver: true },
  { key: "savings", label: "Savings & debt", bar: "bg-blue-500", warnOver: false },
  { key: "wants", label: "Wants & giving", bar: "bg-amber-400", warnOver: true },
];

export default function BudgetHealth({ year, month }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get("/settings/rule", { params: { year, month } }).then((r) => setD(r.data));
  }, [year, month]);

  if (!d || d.income <= 0) return null;

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">Budget Health</h2>
      {ROWS.map((r) => {
        const actual = Math.round((d.actual[r.key] / d.income) * 100);
        const target = d.targets[r.key];
        const over = r.warnOver && actual > target;
        return (
          <div key={r.key}>
            <div className="flex justify-between text-xs">
              <span className="font-medium">{r.label}</span>
              <span className={over ? "font-semibold text-red-500" : "text-gray-500"}>
                {actual}% of income · target {target}%
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${over ? "bg-red-400" : r.bar}`}
                style={{ width: `${Math.min((actual / Math.max(target, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}