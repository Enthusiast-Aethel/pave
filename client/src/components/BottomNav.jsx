import { NavLink } from "react-router-dom";
import { Home, PieChart, Target, Landmark, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/wealth", label: "Wealth", icon: Landmark },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 justify-around rounded-t-3xl border-t border-gray-100 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium ${
              isActive ? "text-brand-700" : "text-gray-400"
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}