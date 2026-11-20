import { Router } from "express";
import Bill from "../models/Bill.js";
import Transaction from "../models/Transaction.js";

const router = Router();

function isDue(bill, month) {
  if (bill.frequency === "Monthly") return true;
  if (bill.frequency === "Quarterly") return (((month - bill.firstMonth) % 3) + 3) % 3 === 0;
  return month === bill.firstMonth;
}

router.get("/month", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysInMonth = new Date(year, month, 0).getDate();

    const [bills, paidRows] = await Promise.all([
      Bill.find({ user: req.userId }),
      Transaction.aggregate([
        {
          $match: {
            user: req.userId,
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
      const base = {
        _id: b._id, name: b.name, category: b.category, amount: b.amount,
        frequency: b.frequency, dueDay: b.dueDay, firstMonth: b.firstMonth,
      };
      if (!isDue(b, month)) return others.push(base);

      const day = Math.min(b.dueDay, daysInMonth);
      const dueDate = new Date(year, month - 1, day);
      const paid = Math.min(paidMap[b.category] || 0, b.amount);
      const outstanding = b.amount - paid;
      const daysToDue = Math.round((dueDate - today) / 86400000);

      let status = "Upcoming";
      if (outstanding <= 0) status = "Paid";
      else if (dueDate < today) status = "Overdue";
      else if (paid > 0) status = "Partly paid";

      due.push({ ...base, day, dueDate, paid, outstanding, status, daysToDue });
    });

    due.sort((a, b) => a.day - b.day);

    res.json({
      summary: {
        count: due.length,
        totalDue: due.reduce((s, b) => s + b.amount, 0),
        paid: due.reduce((s, b) => s + b.paid, 0),
        outstanding: due.reduce((s, b) => s + b.outstanding, 0),
        overdue: due.filter((b) => b.status === "Overdue").length,
      },
      bills: due,
      others,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, _id, ...data } = req.body;
    res.status(201).json(await Bill.create({ ...data, user: req.userId }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { user, _id, ...data } = req.body;
    const doc = await Bill.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Bill.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/bills/:id/mark-paid - Mark a bill as paid by logging an expense
router.post("/:id/mark-paid", async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.userId });
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const { amount, date } = req.body;
    const paidAmount = Number(amount) || bill.amount;
    const paidDate = date ? new Date(date) : new Date();

    const txn = await Transaction.create({
      user: req.userId,
      type: "Expenses",
      category: bill.category,
      amount: paidAmount,
      date: paidDate,
      notes: `Bill payment: ${bill.name}`,
    });

    res.json({ transaction: txn, bill });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// GET /api/bills/unpaid?year=2026&month=11
// Unpaid bills for this month and next month
router.get("/unpaid", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const bills = await Bill.find({ user: req.userId });
    const out = [];

    for (const offset of [0, 1]) {
      const first = new Date(year, month - 1 + offset, 1);
      const y = first.getFullYear();
      const m = first.getMonth() + 1;
      const daysInMonth = new Date(y, m, 0).getDate();

      const paidRows = await Transaction.aggregate([
        {
          $match: {
            user: req.userId,
            type: "Expenses",
            date: { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) },
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]);
      const paidMap = Object.fromEntries(paidRows.map((r) => [r._id, r.total]));

      bills.forEach((b) => {
        if (!isDue(b, m)) return;
        const outstanding = b.amount - Math.min(paidMap[b.category] || 0, b.amount);
        if (outstanding <= 0) return; // already paid

        const day = Math.min(b.dueDay, daysInMonth);
        out.push({
          _id: b._id,
          name: b.name,
          category: b.category,
          amount: b.amount,
          outstanding,
          dueKey: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        });
      });
    }

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;