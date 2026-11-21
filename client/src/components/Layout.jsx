import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="relative min-h-dvh w-full bg-surface pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-ink">
      <Outlet />
      <BottomNav />
    </div>
  );
}