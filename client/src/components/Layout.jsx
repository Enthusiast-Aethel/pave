import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import useBillReminders from "../hooks/useBillReminders";

export default function Layout() {
  useBillReminders();

  return (
    <div className="mx-auto min-h-screen max-w-md bg-surface pb-24 shadow-xl">
      <Outlet />
      <BottomNav />
    </div>
  );
}