import { Router } from "express";
import Goal from "../models/Goal.js";
import Transaction from "../models/Transaction.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [goals, tracked] = await Promise.all([
      Goal.find({ user: req.userId }).sort({ createdAt: 1 }),
      Transaction.aggregate([
        { $match: { user: req.userId, type: "Savings" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]),
    ]);
    const trackedMap = Object.fromEntries(tracked.map((t) => [t._id, t.total]));
    const now = new Date();
    let neededRaw = 0;

    const items = goals.map((g) => {
      const savedViaTracker = trackedMap[g.linkedCategory] || 0;
      const totalSaved = g.openingBalance + savedViaTracker;
      const remaining = Math.max(g.target - totalSaved, 0);
      const pct = g.target > 0 ? totalSaved / g.target : 0;

      const td = new Date(g.targetDate);
      const monthsLeft = Math.max(
        (td.getFullYear() - now.getFullYear()) * 12 + (td.getMonth() - now.getMonth()),
        1
      );
      const monthsToFinish = g.plannedPerMonth > 0 ? Math.ceil(remaining / g.plannedPerMonth) : null;
      const projected =
        monthsToFinish === null
          ? null
          : new Date(now.getFullYear(), now.getMonth() + monthsToFinish, now.getDate());

      const needed = remaining / monthsLeft;
      neededRaw += needed;

      let status;
      if (remaining <= 0) status = "Achieved";
      else if (monthsToFinish === null) status = "No plan";
      else if (monthsToFinish <= monthsLeft) status = "On track";
      else status = "Behind";

      return {
        _id: g._id, name: g.name, linkedCategory: g.linkedCategory, target: g.target,
        openingBalance: g.openingBalance, plannedPerMonth: g.plannedPerMonth, targetDate: g.targetDate,
        savedViaTracker, totalSaved, remaining, pct, monthsToFinish, projected,
        neededPerMonth: Math.ceil(needed), status,
      };
    });

    const totalTarget = items.reduce((s, g) => s + g.target, 0);
    const totalSaved = items.reduce((s, g) => s + g.totalSaved, 0);

    res.json({
      summary: {
        totalTarget,
        totalSaved,
        progress: totalTarget > 0 ? totalSaved / totalTarget : 0,
        goalCount: items.filter((g) => g.target > 0).length,
        onTrack: items.filter((g) => g.status === "On track" || g.status === "Achieved").length,
        plannedPerMonth: items.reduce((s, g) => s + g.plannedPerMonth, 0),
        neededPerMonth: Math.round(neededRaw),
      },
      goals: items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, _id, ...data } = req.body;
    res.status(201).json(await Goal.create({ ...data, user: req.userId }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { user, _id, ...data } = req.body;
    const doc = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, {
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
    await Goal.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;