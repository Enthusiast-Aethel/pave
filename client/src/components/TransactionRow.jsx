import { categoryStyle } from "../utils/categories";
import { money } from "../utils/format";

export default function TransactionRow({ t, onClick }) {
  const [Icon, tint] = categoryStyle(t.category, t.type);
  const isIncome = t.type === "Income";
  const amountColor = isIncome
    ? "text-brand-500"
    : t.type === "Savings"
    ? "text-brand-700"
    : "text-ink";

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm active:scale-[0.99]"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{t.category}</span>
        <span className="block truncate text-xs text-gray-400">
          {t.type}
          {t.notes ? ` · ${t.notes}` : ""}
        </span>
      </span>
      <span className={`text-sm font-bold ${amountColor}`}>
        {isIncome ? "+" : "-"} {money(t.amount)}
      </span>
    </button>
  );
}