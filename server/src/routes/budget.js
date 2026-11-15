import { Router } from "express";
import BudgetPlan from "../models/BudgetPlan.js";
import Transaction from "../models/Transaction.js";

const router = Router();

const monthRange = (year, month) => ({
  $gte: new Date(year, month - 1, 1),
  $lt: new Date(year, month, 1),
});

// GET /api/budget?year=2026&month=11  -> planned amounts for the month
router.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    res.json(await BudgetPlan.find({ year, month }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/budget  { year, month, type, category, amount }  -> create or update
router.put("/", async (req, res) => {
  try {
    const { year, month, type, category, amount } = req.body;
    const doc = await BudgetPlan.findOneAndUpdate(
      { year, month, type, category },
      { amount },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/budget/copy  { fromYear, fromMonth, toYear, toMonth }
// Copies planned amounts into the target month WITHOUT overwriting existing ones
router.post("/copy", async (req, res) => {
  try {
    const { fromYear, fromMonth, toYear, toMonth } = req.body;
    const source = await BudgetPlan.find({ year: fromYear, month: fromMonth });
    if (source.length === 0) return res.json({ copied: 0 });

    const ops = source.map((p) => ({
      updateOne: {
        filter: { year: toYear, month: toMonth, type: p.type, category: p.category },
        update: { $setOnInsert: { amount: p.amount } },
        upsert: true,
      },
    }));
    await BudgetPlan.bulkWrite(ops);
    res.json({ copied: source.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/budget/overview?year=2026&month=11
// Budget vs tracked, per category, for each type
router.get("/overview", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    const [plans, tracked] = await Promise.all([
      BudgetPlan.find({ year, month }),
      Transaction.aggregate([
        { $match: { effectiveDate: monthRange(year, month) } },
        {
          $group: {
            _id: { type: "$type", category: "$category" },
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const out = { Income: {}, Expenses: {}, Savings: {} };
    const slot = (type, category) =>
      (out[type][category] ||= { category, budget: 0, tracked: 0 });

    plans.forEach((p) => (slot(p.type, p.category).budget = p.amount));
    tracked.forEach((t) => (slot(t._id.type, t._id.category).tracked = t.total));

    const result = {};
    for (const type of Object.keys(out)) {
      const rows = Object.values(out[type]);
      result[type] = {
        rows,
        budget: rows.reduce((s, r) => s + r.budget, 0),
        tracked: rows.reduce((s, r) => s + r.tracked, 0),
      };
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;