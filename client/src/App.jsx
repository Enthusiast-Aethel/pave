import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { ProtectedRoute, PublicOnly } from "./components/RouteGuards";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

// Loaded only when the user opens them
const Transactions = lazy(() => import("./pages/Transactions"));
const Budget = lazy(() => import("./pages/Budget"));
const BudgetPlan = lazy(() => import("./pages/BudgetPlan"));
const Bills = lazy(() => import("./pages/Bills"));
const Goals = lazy(() => import("./pages/Goals"));
const Wealth = lazy(() => import("./pages/Wealth"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Investments = lazy(() => import("./pages/Investments"));
const Insights = lazy(() => import("./pages/Insights"));
const Categories = lazy(() => import("./pages/Categories"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const Loading = () => (
  <div className="flex min-h-dvh w-full items-center justify-center bg-surface text-sm text-gray-400">Loading…</div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-frame flex min-h-dvh w-full flex-1 flex-col bg-surface">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/budget/plan" element={<BudgetPlan />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/wealth" element={<Wealth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}