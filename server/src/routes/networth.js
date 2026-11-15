import { Router } from "express";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import { getSettings } from "../models/Settings.js";

const router = Router();

const key = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

// 12 month-end balances for one account, carrying the last known value forward
function monthlyBalances(acc, year) {
  const b = acc.balances || {};
  const prior = Object.keys(b).sort().filter((k) => k < key(year, 1)).pop();
  let last = prior !== undefined ? b[prior] : 0;
  const out = [];
  const entered = [];
  for (let m = 1; m <= 12; m++) {
    const k = key(year, m);
    if (b[k] !== undefined && b[k] !== null) {
      last = b[k];
      entered.push(m);
    }
    out.push(last);
  }
  return { out, entered };
}

// GET /api/networth?year=2026
router.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [accounts, settings] = await Promise.all([
      Account.find().sort({ createdAt: 1 }).lean(),
      getSettings(),
    ]);

    const computed = accounts.map((a) => ({ a, ...monthlyBalances(a, year) }));
    const latest = Math.max(0, ...computed.flatMap((c) => c.entered));
    const idx = latest - 1;

    const sumAt = (kind, i) =>
      computed.filter((c) => c.a.kind === kind).reduce((s, c) => s + c.out[i], 0);

    const series = [];
    for (let m = 1; m <= latest; m++) {
      const assets = sumAt("Asset", m - 1);
      const liabilities = sumAt("Liability", m - 1);
      series.push({ month: m, assets, liabilities, netWorth: assets - liabilities });
    }

    const assets = latest ? sumAt("Asset", idx) : 0;
    const liabilities = latest ? sumAt("Liability", idx) : 0;
    const netWorth = assets - liabilities;
    const previous = latest > 1 ? series[idx - 1].netWorth : netWorth;
    const change = netWorth - previous;

    // Emergency fund: liquid cash / average monthly expenses (as in your sheet)
    const liquid = latest
      ? computed
          .filter((c) => c.a.kind === "Asset" && c.a.category === "Cash & M-Pesa")
          .reduce((s, c) => s + c.out[idx], 0)
      : 0;

    const expenses = await Transaction.find({
      type: "Expenses",
      effectiveDate: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
    })
      .select("effectiveDate amount")
      .lean();
    const monthsWithSpend = new Set(expenses.map((e) => new Date(e.effectiveDate).getMonth()));
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const avgMonthlyExpenses = monthsWithSpend.size ? totalSpend / monthsWithSpend.size : 0;

    // Asset allocation by category (latest month)
    const alloc = {};
    if (latest) {
      computed
        .filter((c) => c.a.kind === "Asset" && c.out[idx] > 0)
        .forEach((c) => (alloc[c.a.category] = (alloc[c.a.category] || 0) + c.out[idx]));
    }

    res.json({
      year,
      latestMonth: latest,
      goal: settings.netWorthGoal,
      netWorth,
      assets,
      liabilities,
      change,
      changePct: previous ? (change / Math.abs(previous)) * 100 : 0,
      debtToAsset: assets ? liabilities / assets : 0,
      emergencyMonths: avgMonthlyExpenses ? liquid / avgMonthlyExpenses : null,
      goalProgress: settings.netWorthGoal ? netWorth / settings.netWorthGoal : 0,
      remaining: Math.max(settings.netWorthGoal - netWorth, 0),
      series,
      allocation: Object.entries(alloc).map(([name, value]) => ({ name, value })),
      accounts: computed.map((c) => ({
        _id: c.a._id,
        name: c.a.name,
        kind: c.a.kind,
        category: c.a.category,
        balances: c.a.balances || {},
        balance: latest ? c.out[idx] : 0,
        change: latest > 1 ? c.out[idx] - c.out[idx - 1] : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/networth/accounts  { name, kind, category, year, month, balance }
router.post("/accounts", async (req, res) => {
  try {
    const { name, kind, category, year, month, balance } = req.body;
    const balances = {};
    if (balance !== undefined && balance !== null && balance !== "") {
      balances[key(year, month)] = Number(balance);
    }
    res.status(201).json(await Account.create({ name, kind, category, balances }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/accounts/:id", async (req, res) => {
  try {
    const { name, category } = req.body;
    const doc = await Account.findByIdAndUpdate(
      req.params.id,
      { name, category },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/networth/accounts/:id/balance  { year, month, amount }
router.put("/accounts/:id/balance", async (req, res) => {
  try {
    const { year, month, amount } = req.body;
    const doc = await Account.findByIdAndUpdate(
      req.params.id,
      { $set: { [`balances.${key(year, month)}`]: Number(amount) } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/accounts/:id", async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;