import { Router } from "express";
import Bill from "../models/Bill.js";
import Transaction from "../models/Transaction.js";

const router = Router();

// Is this bill due in the given month (1-12)?
function isDue(bill, month) {
  if (bill.frequency === "Monthly") return true;
  if (bill.frequency === "Quarterly") return (((month - bill.firstMonth) % 3) + 3) % 3 === 0;
  return month === bill.firstMonth; // Yearly
}

// GET /api/bills/month?year=2026&month=11
router.get("/month", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysInMonth = new Date(year, month, 0).getDate();

    const [bills, paidRows] = await Promise.all([
      Bill.find(),
      Transaction.aggregate([
        {
          $match: {
            type: "Expenses",
            date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]),
    ]);
    const paidMap = Object.fromEntries(paidRows.map((r) => [r._id, r.total]));

    const due = [];
    const others = [];

    bills.forEach((b) => {
      if (!isDue(b, month)) {
        others.push({ _id: b._id, name: b.name, category: b.category, amount: b.amount,
          frequency: b.frequency, dueDay: b.dueDay, firstMonth: b.firstMonth });
        return;
      }
      const day = Math.min(b.dueDay, daysInMonth);
      const dueDate = new Date(year, month - 1, day);
      const paid = Math.min(paidMap[b.category] || 0, b.amount);
      const outstanding = b.amount - paid;
      const daysToDue = Math.round((dueDate - today) / 86400000);

      let status = "Upcoming";
      if (outstanding <= 0) status = "Paid";
      else if (dueDate < today) status = "Overdue";
      else if (paid > 0) status = "Partly paid";

      due.push({
        _id: b._id, name: b.name, category: b.category, amount: b.amount,
        frequency: b.frequency, dueDay: b.dueDay, firstMonth: b.firstMonth,
        day, dueDate, paid, outstanding, status, daysToDue,
      });
    });

    due.sort((a, b) => a.day - b.day);

    const summary = {
      count: due.length,
      totalDue: due.reduce((s, b) => s + b.amount, 0),
      paid: due.reduce((s, b) => s + b.paid, 0),
      outstanding: due.reduce((s, b) => s + b.outstanding, 0),
      overdue: due.filter((b) => b.status === "Overdue").length,
    };

    res.json({ summary, bills: due, others });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    res.status(201).json(await Bill.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;