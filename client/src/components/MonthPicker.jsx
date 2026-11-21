import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthPicker({ cursor, onChange }) {
  const shift = (delta) => {
    const d = new Date(cursor.year, cursor.month - 1 + delta, 1);
    onChange({ year: d.getFullYear(), month: d.getMonth() + 1 });
  };
  const label = new Date(cursor.year, cursor.month - 1, 1).toLocaleString("en-KE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm">
      <button onClick={() => shift(-1)} className="rounded-xl p-2 text-brand-700">
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-semibold">{label}</span>
      <button onClick={() => shift(1)} className="rounded-xl p-2 text-brand-700">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}