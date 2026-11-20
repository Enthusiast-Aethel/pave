import { Router } from "express";
import Transaction from "../models/Transaction.js";
import Bill from "../models/Bill.js";
import Goal from "../models/Goal.js";
import Account from "../models/Account.js";
import Investment from "../models/Investment.js";
import Settings from "../models/Settings.js";
import Category from "../models/Category.js";

const router = Router();

// GET /api/export - download all user data as JSON
router.get("/", async (req, res) => {
  try {
    const userId = req.userId;
    const [transactions, bills, goals, accounts, investments, settings, categories] = await Promise.all([
      Transaction.find({ user: userId }).lean(),
      Bill.find({ user: userId }).lean(),
      Goal.find({ user: userId }).lean(),
      Account.find({ user: userId }).lean(),
      Investment.find({ user: userId }).lean(),
      Settings.findOne({ user: userId }).lean(),
      Category.find({ user: userId }).lean(),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      settings: settings || {},
      categories: categories || [],
      transactions,
      bills,
      goals,
      accounts,
      investments,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="pave-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;