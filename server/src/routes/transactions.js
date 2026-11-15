import { Router } from "express";
import Transaction from "../models/Transaction.js";

const router = Router();

// GET /api/transactions?type=Expenses&year=2026&month=10
router.get("/", async (req, res) => {
  try {
    const { type, year, month } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (year && month) {
      filter.effectiveDate = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }
    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/transactions/summary?year=2026&month=10
// Must come BEFORE "/:id"
router.get("/summary", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const rows = await Transaction.aggregate([
      { $match: { effectiveDate: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const totals = { Income: 0, Expenses: 0, Savings: 0 };
    rows.forEach((r) => (totals[r._id] = r.total));

    res.json({ ...totals, toAllocate: totals.Income - totals.Expenses - totals.Savings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await Transaction.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Transaction.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    Object.assign(doc, req.body);
    await doc.save(); // runs the effective-date hook again
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;