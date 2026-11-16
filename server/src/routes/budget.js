import { Router } from "express";
import BudgetPlan from "../models/BudgetPlan.js";
import Transaction from "../models/Transaction.js";

const router = Router();

const monthRange = (year, month) => ({
  $gte: new Date(year, month - 1, 1),
  $lt: new Date(year, month, 1),
});

router.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    res.json(await BudgetPlan.find({ user: req.userId, year, month }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { year, month, type, category, amount } = req.body;
    const doc = await BudgetPlan.findOneAndUpdate(
      { user: req.userId, year, month, type, category },
      { amount },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/copy", async (req, res) => {
  try {
    const { fromYear, fromMonth, toYear, toMonth } = req.body;
    const source = await BudgetPlan.find({ user: req.userId, year: fromYear, month: fromMonth });
    if (source.length === 0) return res.json({ copied: 0 });

    await BudgetPlan.bulkWrite(
      source.map((p) => ({
        updateOne: {
          filter: { user: req.userId, year: toYear, month: toMonth, type: p.type, category: p.category },
          update: { $setOnInsert: { amount: p.amount } },
          upsert: true,
        },
      }))
    );
    res.json({ copied: source.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/overview", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    const [plans, tracked] = await Promise.all([
      BudgetPlan.find({ user: req.userId, year, month }),
      Transaction.aggregate([
        { $match: { user: req.userId, effectiveDate: monthRange(year, month) } },
        { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
      ]),
    ]);

    const out = { Income: {}, Expenses: {}, Savings: {} };
    const slot = (type, category) => (out[type][category] ||= { category, budget: 0, tracked: 0 });

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