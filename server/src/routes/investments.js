import { Router } from "express";
import Investment from "../models/Investment.js";

const router = Router();

// GET /api/investments
router.get("/", async (req, res) => {
  try {
    const items = await Investment.find({ user: req.userId }).sort({ createdAt: 1 }).lean();
    const now = new Date();
    const totalInvested = items.reduce((s, i) => s + (i.initialValue || 0), 0);
    const totalCurrent = items.reduce((s, i) => s + (i.currentValue || 0), 0);
    const totalGain = totalCurrent - totalInvested;
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    res.json({ items, summary: { totalInvested, totalCurrent, totalGain, gainPct } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/investments
router.post("/", async (req, res) => {
  try {
    const { name, type, institution, units, currentPrice, initialValue, currentValue } = req.body;
    const item = await Investment.create({
      user: req.userId,
      name, type, institution,
      units: Number(units) || 0,
      currentPrice: Number(currentPrice) || 0,
      initialValue: Number(initialValue) || 0,
      currentValue: Number(currentValue) || 0,
      history: [{ date: new Date(), value: Number(currentValue) || 0, units: Number(units) || 0, price: Number(currentPrice) || 0 }],
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/investments/:id - update value (adds history entry)
router.put("/:id", async (req, res) => {
  try {
    const { currentValue, units, price, note } = req.body;
    const item = await Investment.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Not found" });
    if (currentValue !== undefined) {
      item.currentValue = Number(currentValue);
      item.history.push({ date: new Date(), value: Number(currentValue), units: Number(units) || item.units, price: Number(price) || item.currentPrice, note });
    }
    if (units !== undefined) item.units = Number(units);
    if (price !== undefined) item.currentPrice = Number(price);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/investments/:id
router.delete("/:id", async (req, res) => {
  try {
    await Investment.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;