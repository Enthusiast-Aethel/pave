import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="w-full min-h-dvh bg-background text-foreground pb-24 relative">
      <Outlet />
      <BottomNav />
    </div>
  );
}