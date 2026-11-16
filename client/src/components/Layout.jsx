import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="w-full min-h-dvh md:max-w-md md:mx-auto bg-surface pb-24 shadow-xl relative">
      <Outlet />
      <BottomNav />
    </div>
  );
}