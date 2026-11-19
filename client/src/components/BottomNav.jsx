import { NavLink } from "react-router-dom";
import { ArrowLeftRight, Home, Landmark, PieChart, Search, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/transactions", label: "Transact", icon: ArrowLeftRight },
  { to: "/budget", label: "Explore", icon: PieChart },
  { to: "/wealth", label: "Wealth", icon: Landmark },
  { to: "/profile", label: "Account", icon: User },
];

export default function BottomNav() {
  return (
    <nav aria-label="Main navigation" className="fixed bottom-2 left-1/2 z-20 flex w-[calc(100%-1rem)] max-w-[26rem] -translate-x-1/2 justify-around rounded-2xl border border-slate-100 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_8px_32px_rgba(21,35,49,0.14)] backdrop-blur">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => {
            const isExplore = to === "/budget";
            return `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 pb-1.5 text-[10px] font-semibold transition-colors ${
              isActive ? "text-brand-700" : "text-slate-400"
            } ${isExplore ? "relative -mt-5" : "pt-1.5"}`;
          }}
        >
          {({ isActive }) => (
            <>
              {to === "/budget" ? (
                <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_6px_16px_rgba(20,54,94,0.28)] ring-4 ring-white transition ${
                  isActive ? "bg-[#174b86]" : "bg-[#1d5b9e]"
                }`}>
                  <Search size={22} strokeWidth={2.2} />
                </span>
              ) : (
                <span className={`flex h-8 w-10 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-brand-50" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                </span>
              )}
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}