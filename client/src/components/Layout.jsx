import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-surface pb-24 shadow-xl">
      <Outlet />
      <BottomNav />
    </div>
  );
}