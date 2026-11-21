import { Router } from "express";
import { getSettings } from "../models/Settings.js";
import Transaction from "../models/Transaction.js";
import { bucketOf } from "../utils/buckets.js";

const router = Router();

const EDITABLE = [
  "userName", "startingYear", "lateIncomeActive", "lateIncomeDay",
  "ruleMandatory", "ruleSavings", "ruleWants", "netWorthGoal",
  "billReminders", "reminderDaysBefore", "reminderTime",
  "appLockEnabled", "appLockPIN", "appLockMethod", "autoLockMinutes",
  "hideAmounts", "emergencyFundMonths",
];

router.get("/", async (req, res) => {
  try {
    res.json(await getSettings(req.userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const s = await getSettings(req.userId);
    EDITABLE.forEach((k) => {
      if (req.body[k] !== undefined) s[k] = req.body[k];
    });
    if (s.ruleMandatory + s.ruleSavings + s.ruleWants !== 100) {
      return res.status(400).json({ message: "The 50/30/20 rule must add up to 100%" });
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.reminderTime)) {
      return res.status(400).json({ message: "Enter a valid reminder time" });
    }
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/recalculate", async (req, res) => {
  try {
    const s = await getSettings(req.userId);
    const all = await Transaction.find({ user: req.userId }).select("date type").lean();

    const ops = all.map((t) => {
      const d = new Date(t.date);
      const late = t.type === "Income" && s.lateIncomeActive && d.getDate() >= s.lateIncomeDay;
      const effectiveDate = late ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : d;
      return { updateOne: { filter: { _id: t._id }, update: { $set: { effectiveDate } } } };
    });

    if (ops.length) await Transaction.bulkWrite(ops);
    res.json({ updated: ops.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/rule", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const s = await getSettings(req.userId);

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          effectiveDate: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
        },
      },
      { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
    ]);

    let income = 0;
    const actual = { mandatory: 0, savings: 0, wants: 0 };
    rows.forEach((r) => {
      if (r._id.type === "Income") income += r.total;
      else if (r._id.type === "Savings") actual.savings += r.total;
      else actual[bucketOf(r._id.category)] += r.total;
    });

    res.json({
      income,
      actual,
      targets: { mandatory: s.ruleMandatory, savings: s.ruleSavings, wants: s.ruleWants },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
// GET /api/settings/insights - Spending insights & month-end forecast
router.get("/insights", async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);

    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    const curr = await Transaction.find({
      user: req.userId,
      effectiveDate: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
    }).lean();

    const prev = await Transaction.find({
      user: req.userId,
      effectiveDate: { $gte: new Date(prevYear, prevMonth - 1, 1), $lt: new Date(prevYear, prevMonth, 1) },
    }).lean();

    const currCats = {};
    const prevCats = {};
    const merchants = {};
    let currExpenses = 0;
    let currIncome = 0;

    curr.forEach((t) => {
      if (t.type === "Income") currIncome += t.amount;
      if (t.type === "Expenses") {
        currExpenses += t.amount;
        currCats[t.category] = (currCats[t.category] || 0) + t.amount;
        if (t.notes) merchants[t.notes.trim()] = (merchants[t.notes.trim()] || 0) + t.amount;
      }
    });

    prev.forEach((t) => {
      if (t.type === "Expenses") prevCats[t.category] = (prevCats[t.category] || 0) + t.amount;
    });

    const categoryInsights = [];
    Object.keys(currCats).forEach((cat) => {
      const c = currCats[cat];
      const p = prevCats[cat] || 0;
      if (p > 0) {
        const diff = c - p;
        const pct = Math.round((diff / p) * 100);
        if (Math.abs(pct) >= 10) {
          categoryInsights.push({
            category: cat, curr: c, prev: p, pct,
            message: `You spent ${Math.abs(pct)}% ${pct > 0 ? "more" : "less"} on ${cat} than last month`,
          });
        }
      }
    });

    const topMerchants = Object.entries(merchants)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount).slice(0, 5);

    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === (now.getMonth() + 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayElapsed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;

    const dailyAverage = Math.round(currExpenses / dayElapsed);
    const forecast = Math.round(dailyAverage * daysInMonth);
    const safeToSpendDaily = isCurrentMonth
      ? Math.max(0, Math.round((currIncome - currExpenses) / Math.max(1, daysInMonth - dayElapsed + 1)))
      : 0;

    const overspendForecast = currIncome > 0 ? forecast - currIncome : 0;

    res.json({
      currExpenses, currIncome, dailyAverage, forecast, safeToSpendDaily,
      overspendForecast, daysLeft: isCurrentMonth ? daysInMonth - dayElapsed + 1 : 0,
      categoryInsights, topMerchants,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
});
// GET /api/settings/health-score - Financial Health Score calculation
router.get("/health-score", async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);
    const s = await getSettings(req.userId);

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          effectiveDate: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
        },
      },
      { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
    ]);

    let income = 0;
    const actual = { mandatory: 0, savings: 0, wants: 0 };
    rows.forEach((r) => {
      if (r._id.type === "Income") income += r.total;
      else if (r._id.type === "Savings") actual.savings += r.total;
      else {
        const cat = r._id.category;
        const isMandatory = ["Rent", "Electricity", "Water", "Gas", "Internet/Airtime", "Transport", "Essential Groceries", "Healthcare", "Transactional Charges"].includes(cat);
        const isSavingsDebt = ["Mshwari Loan", "Helb Loan", "Debt"].includes(cat);
        if (isMandatory) actual.mandatory += r.total;
        else if (isSavingsDebt) actual.savings += r.total;
        else actual.wants += r.total;
      }
    });

    let ruleScore = 30;
    if (income > 0) {
      const mandPct = (actual.mandatory / income) * 100;
      const wantPct = (actual.wants / income) * 100;
      if (mandPct > s.ruleMandatory) ruleScore -= Math.min(15, (mandPct - s.ruleMandatory) * 0.8);
      if (wantPct > s.ruleWants) ruleScore -= Math.min(15, (wantPct - s.ruleWants) * 0.8);
    }

    let savingsRateScore = 0;
    if (income > 0) {
      const savingsRate = (actual.savings / income) * 100;
      savingsRateScore = Math.min(25, Math.round((savingsRate / 20) * 25));
    }

    const efMonths = s.emergencyFundMonths || 0;
    const efScore = Math.min(25, Math.round((efMonths / 6) * 25));

    const debtScore = 20;

    const totalScore = Math.min(100, Math.max(0, Math.round(ruleScore + savingsRateScore + efScore + debtScore)));

    res.json({
      score: totalScore,
      breakdown: {
        ruleAdherence: Math.round(ruleScore),
        savingsRate: savingsRateScore,
        emergencyFund: efScore,
        debtToAsset: debtScore,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;