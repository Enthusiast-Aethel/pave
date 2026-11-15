import { Router } from "express";
import { getSettings } from "../models/Settings.js";
import Transaction from "../models/Transaction.js";
import { bucketOf } from "../utils/buckets.js";

const router = Router();

const EDITABLE = [
  "userName", "startingYear", "lateIncomeActive", "lateIncomeDay",
  "ruleMandatory", "ruleSavings", "ruleWants", "netWorthGoal",
];

router.get("/", async (req, res) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const s = await getSettings();
    EDITABLE.forEach((k) => {
      if (req.body[k] !== undefined) s[k] = req.body[k];
    });
    if (s.ruleMandatory + s.ruleSavings + s.ruleWants !== 100) {
      return res.status(400).json({ message: "The 50/30/20 rule must add up to 100%" });
    }
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Re-apply the late-income rule to ALL existing transactions
router.post("/recalculate", async (req, res) => {
  try {
    const all = await Transaction.find();
    for (const t of all) await t.save(); // the validate hook recomputes effectiveDate
    res.json({ updated: all.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/settings/rule?year=2026&month=10  -> actual vs target for 50/30/20
router.get("/rule", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const s = await getSettings();

    const rows = await Transaction.aggregate([
      {
        $match: {
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
});

export default router;