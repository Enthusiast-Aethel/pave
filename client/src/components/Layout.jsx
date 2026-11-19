import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="relative min-h-dvh w-full bg-surface pb-28 text-ink">
      <Outlet />
      <BottomNav />
    </div>
  );
}