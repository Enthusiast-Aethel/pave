import { Router } from "express";
import Transaction from "../models/Transaction.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { type, year, month } = req.query;
    const filter = { user: req.userId };
    if (type) filter.type = type;
    if (year && month) {
      filter.effectiveDate = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }
    res.json(await Transaction.find(filter).sort({ date: -1, createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const rows = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          effectiveDate: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
        },
      },
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
    const { user, _id, effectiveDate, ...data } = req.body;
    res.status(201).json(await Transaction.create({ ...data, user: req.userId }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!doc) return res.status(404).json({ message: "Not found" });
    const { user, _id, effectiveDate, ...data } = req.body;
    Object.assign(doc, data);
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Transaction.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;