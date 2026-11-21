import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { fetchDueSoon } from "../utils/reminders";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () =>
      fetchDueSoon()
        .then((bills) => setCount(bills.filter((b) => b.daysToDue <= 3).length))
        .catch(() => {});
    load();
    window.addEventListener("pave:data-changed", load);
    return () => window.removeEventListener("pave:data-changed", load);
  }, []);

  return (
    <Link to="/notifications" className="relative rounded-full bg-white p-3 shadow-sm">
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}