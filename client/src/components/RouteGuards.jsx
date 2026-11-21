import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Splash() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-surface text-sm text-gray-400">
      Loading…
    </div>
  );
}

// Only for signed-in users
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Outlet /> : <Navigate to="/welcome" replace />;
}

// Welcome / login / register: signed-in users skip straight to Home
export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}