import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import BudgetPlan from "./pages/BudgetPlan";
import Goals from "./pages/Goals";
import Wealth from "./pages/Wealth";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Bills from "./pages/Bills";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/budget/plan" element={<BudgetPlan />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/wealth" element={<Wealth />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}